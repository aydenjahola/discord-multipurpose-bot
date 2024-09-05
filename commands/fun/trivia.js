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
    .setDescription("Play a trivia game about video games"),

  async execute(interaction, client) {
    const userId = interaction.user.id;
    const username = interaction.user.username;
    const guild = interaction.guild;
    const timeLimit = 30000; // Time limit for answering in milliseconds

    try {
      // Fetch a trivia question from the cache or the API
      let triviaQuestion = await TriviaQuestion.findOne({
        last_served: { $lt: new Date(Date.now() - QUESTION_EXPIRY) }, // Fetch questions not served recently
      }).sort({ last_served: 1 });

      if (!triviaQuestion || Date.now() - lastApiCall >= API_INTERVAL) {
        // Fetch a new trivia question from OTDB
        const response = await axios.get(
          "https://opentdb.com/api.php?amount=1&category=15" // Category 15 is for Video Games
        );

        triviaQuestion = response.data.results[0];
        lastApiCall = Date.now();

        // Save the new trivia question to MongoDB
        await TriviaQuestion.create({
          question: decode(triviaQuestion.question),
          correct_answer: decode(triviaQuestion.correct_answer),
          incorrect_answers: triviaQuestion.incorrect_answers.map(decode),
          last_served: null, // Initially not served
        });

        // Fetch the newly created question
        triviaQuestion = await TriviaQuestion.findOne({
          question: decode(triviaQuestion.question),
        });
      }

      if (triviaQuestion) {
        triviaQuestion.last_served = new Date();
        await triviaQuestion.save();
      }

      const question = decode(triviaQuestion.question);
      const correctAnswer = decode(triviaQuestion.correct_answer);
      const incorrectAnswers = triviaQuestion.incorrect_answers.map(decode);
      const allAnswers = [...incorrectAnswers, correctAnswer].sort(
        () => Math.random() - 0.5
      );

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
        content: `<@${userId}>`,
        embeds: [triviaEmbed],
      });

      // Create a message collector specific to the user
      const filter = (response) => {
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

      const collector = interaction.channel.createMessageCollector({
        filter,
        max: 1,
        time: timeLimit,
      });

      collector.on("collect", async (message) => {
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

      collector.on("end", (collected, reason) => {
        if (reason === "time") {
          interaction.followUp(
            `<@${userId}> Time's up! You didn't answer in time.`
          );
        }
      });
    } catch (error) {
      console.error("Error executing trivia command:", error);
      if (error.response && error.response.status === 429) {
        await interaction.reply({
          content: `<@${userId}> The trivia API rate limit has been exceeded. Please try again later.`,
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: `<@${userId}> There was an error while executing this command!`,
          ephemeral: true,
        });
      }
    }
  },
};
