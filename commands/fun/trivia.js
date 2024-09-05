const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require("axios");
const TriviaQuestion = require("../../models/TriviaQuestion");
const Leaderboard = require("../../models/Leaderboard");
const { decode } = require("html-entities");

const API_INTERVAL = 5000; // 5 seconds
const QUESTION_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 1 month

let lastApiCall = 0;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("trivia")
    .setDescription("Play a trivia game")
    .addStringOption((option) =>
      option
        .setName("category")
        .setDescription("Choose a trivia category")
        .setRequired(true)
        .addChoices(
          { name: "Video Games", value: "15" },
          { name: "Anime & Manga", value: "31" }
        )
    ),

  async execute(interaction, client) {
    const userId = interaction.user.id;
    const username = interaction.user.username;
    const guild = interaction.guild;
    const timeLimit = 30000; // Time limit for answering in milliseconds

    const categoryId = interaction.options.getString("category");
    const categoryName = categoryId === "15" ? "Video Games" : "Anime & Manga";

    // Fetch a trivia question from the cache or the API
    let triviaQuestion = await TriviaQuestion.findOne({
      last_served: { $lt: new Date(Date.now() - QUESTION_EXPIRY) }, // Fetch questions not served recently
      category: categoryName, // Filter by category
    }).sort({ last_served: 1 });

    if (!triviaQuestion || Date.now() - lastApiCall >= API_INTERVAL) {
      // Fetch a new trivia question from OTDB
      const response = await axios.get(
        `https://opentdb.com/api.php?amount=1&category=${categoryId}`
      );

      triviaQuestion = response.data.results[0];
      lastApiCall = Date.now();

      // Save the new trivia question to MongoDB
      await TriviaQuestion.create({
        question: decode(triviaQuestion.question),
        correct_answer: decode(triviaQuestion.correct_answer),
        incorrect_answers: triviaQuestion.incorrect_answers.map(decode),
        category: categoryName, // Include the category
        last_served: null, // Initially not served
      });

      // Fetch the newly created question
      triviaQuestion = await TriviaQuestion.findOne({
        question: decode(triviaQuestion.question),
        category: categoryName, // Filter by category
      });
    }

    if (triviaQuestion) {
      triviaQuestion.last_served = new Date();
      await triviaQuestion.save();
    }

    const question = decode(triviaQuestion.question);
    const correctAnswer = decode(triviaQuestion.correct_answer);
    const incorrectAnswers = triviaQuestion.incorrect_answers.map(decode);
    let allAnswers = [...incorrectAnswers, correctAnswer];

    // Handle True/False questions specifically
    if (triviaQuestion.type === "boolean") {
      allAnswers = ["True", "False"];
    }

    allAnswers = allAnswers.sort(() => Math.random() - 0.5); // Shuffle answers

    // Create a mapping of numbers to answers
    const answerMap = allAnswers.reduce((map, answer, index) => {
      map[index + 1] = answer;
      return map;
    }, {});

    // Create an embed with the trivia question and numbered options
    const triviaEmbed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("Trivia Question")
      .setDescription(question)
      .addFields(
        Object.entries(answerMap).map(([number, answer]) => ({
          name: `Option ${number}`,
          value: answer,
          inline: true,
        }))
      )
      .setTimestamp()
      .setFooter({
        text: `${guild.name} | Answer within ${timeLimit / 1000} seconds`,
        iconURL: guild.iconURL(),
      });

    await interaction.reply({
      embeds: [triviaEmbed],
    });

    // Create a message collector specific to the user
    const answerFilter = (response) => {
      const userInput = response.content.trim();
      const userAnswerNumber = parseInt(userInput, 10);
      const userAnswerText =
        allAnswers.includes(userInput) ||
        (answerMap[userAnswerNumber] &&
          answerMap[userAnswerNumber] === correctAnswer);

      // Check if the input is a number within valid range or a text that matches one of the options
      return (
        response.author.id === userId &&
        (userAnswerText || (userAnswerNumber >= 1 && userAnswerNumber <= 4))
      );
    };

    const answerCollector = interaction.channel.createMessageCollector({
      filter: answerFilter,
      max: 1,
      time: timeLimit,
    });

    answerCollector.on("collect", async (message) => {
      const userInput = message.content.trim();
      const userAnswerNumber = parseInt(userInput, 10);
      const userAnswer = answerMap[userAnswerNumber] || userInput;

      let resultMessage = "Incorrect! Better luck next time.";

      if (userAnswer === correctAnswer) {
        resultMessage = "Correct!";
      }

      // Update leaderboard
      let userScore = await Leaderboard.findOne({ userId });
      if (!userScore) {
        userScore = new Leaderboard({
          userId,
          username,
          gamesPlayed: 1,
          correctAnswers: userAnswer === correctAnswer ? 1 : 0,
        });
      } else {
        userScore.gamesPlayed += 1;
        if (userAnswer === correctAnswer) {
          userScore.correctAnswers += 1;
        }
      }
      await userScore.save();

      await interaction.followUp(
        `${resultMessage} <@${userId}> You've answered ${userScore.correctAnswers} questions correctly out of ${userScore.gamesPlayed} games.`
      );
    });

    answerCollector.on("end", (collected, reason) => {
      if (reason === "time") {
        interaction.followUp(
          `<@${userId}> Time's up! You didn't answer in time.`
        );
      }
    });
  },
};
