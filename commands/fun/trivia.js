const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require("axios");
const TriviaQuestion = require("../../models/TriviaQuestion");
const Leaderboard = require("../../models/Leaderboard");
const { decode } = require("html-entities");

const API_INTERVAL = 5000; // 5 seconds
const QUESTION_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 1 month
const ONGOING_TRIVIA = new Set(); // Track users with ongoing trivia
const LAST_API_CALL = { time: 0 }; // Track last API call

const CATEGORY_MAP = {
  15: "Video Games",
  31: "Anime & Manga",
  18: "Computers",
  16: "Board Games",
  29: "Comics",
  32: "Cartoons & Animations",
  11: "Film",
  9: "General Knowledge",
  17: "Science & Nature",
  27: "Animals",
  12: "Music",
  23: "History",
  22: "Geography",
  20: "Mythology",
};

const fetchTriviaQuestion = async (categoryId, categoryName) => {
  try {
    let triviaQuestion = await TriviaQuestion.findOne({
      last_served: { $lt: new Date(Date.now() - QUESTION_EXPIRY) },
      category: categoryName,
    }).sort({ last_served: 1 });

    if (!triviaQuestion || Date.now() - LAST_API_CALL.time >= API_INTERVAL) {
      const response = await axios.get(
        `https://opentdb.com/api.php?amount=1&category=${categoryId}`
      );
      triviaQuestion = response.data.results[0];
      LAST_API_CALL.time = Date.now();

      await TriviaQuestion.create({
        question: decode(triviaQuestion.question),
        correct_answer: decode(triviaQuestion.correct_answer),
        incorrect_answers: triviaQuestion.incorrect_answers.map(decode),
        category: categoryName,
        last_served: null,
      });

      triviaQuestion = await TriviaQuestion.findOne({
        question: decode(triviaQuestion.question),
        category: categoryName,
      });
    }

    if (triviaQuestion) {
      triviaQuestion.last_served = new Date();
      await triviaQuestion.save();
    }

    return triviaQuestion;
  } catch (error) {
    console.error("Error fetching or saving trivia question:", error);
    throw new Error("Error fetching trivia question");
  }
};

const getShuffledQuestions = async (categoryName) => {
  try {
    const questions = await TriviaQuestion.find({
      category: categoryName,
    }).sort({ last_served: 1 });

    if (questions.length === 0) {
      return [];
    }

    questions.forEach(async (question) => {
      question.last_served = new Date();
      await question.save();
    });

    // Shuffle questions
    return questions.sort(() => Math.random() - 0.5);
  } catch (error) {
    console.error("Error fetching or shuffling questions:", error);
    throw new Error("Error fetching questions from database");
  }
};

const createTriviaEmbed = (
  categoryName,
  question,
  answerMap,
  guild,
  timeLimit
) => {
  return new EmbedBuilder()
    .setColor("#0099ff")
    .setTitle(`${categoryName} Trivia Question`)
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
};

const handleAnswerCollection = async (
  interaction,
  triviaQuestion,
  answerMap,
  correctAnswer,
  allAnswers,
  timeLimit,
  userId,
  username
) => {
  try {
    const answerFilter = (response) => {
      const userInput = response.content.trim();
      const userAnswerNumber = parseInt(userInput, 10);
      const userAnswerText =
        allAnswers.includes(userInput) ||
        (answerMap[userAnswerNumber] &&
          answerMap[userAnswerNumber] === correctAnswer);

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
      try {
        const userInput = message.content.trim();
        const userAnswerNumber = parseInt(userInput, 10);
        const userAnswer = answerMap[userAnswerNumber] || userInput;

        let resultMessage =
          userAnswer === correctAnswer
            ? "Correct!"
            : `Incorrect! the correct answer is **${correctAnswer}.**`;

        let userScore = await Leaderboard.findOne({ userId });
        if (!userScore) {
          userScore = new Leaderboard({
            userId,
            username,
            gamesPlayed: 1,
            correctAnswers: userAnswer === correctAnswer ? 1 : 0,
            streak: userAnswer === correctAnswer ? 1 : 0, // Start streak
          });
        } else {
          userScore.gamesPlayed += 1;
          if (userAnswer === correctAnswer) {
            userScore.correctAnswers += 1;
            userScore.streak += 1; // Increment streak
          } else {
            userScore.streak = 0; // Reset streak
          }
        }
        await userScore.save();

        await interaction.followUp(
          `${resultMessage} <@${userId}> You've answered ${userScore.correctAnswers} questions correctly out of ${userScore.gamesPlayed} games. Your current streak is **${userScore.streak}**.`
        );

        ONGOING_TRIVIA.delete(userId);
      } catch (error) {
        console.error("Error processing collected answer:", error);
        await interaction.followUp({
          content: "There was an error processing your answer.",
          ephemeral: true,
        });
        ONGOING_TRIVIA.delete(userId);
      }
    });

    answerCollector.on("end", (collected, reason) => {
      if (reason === "time") {
        interaction.followUp(
          `<@${userId}> Time's up! the correct answer is **${correctAnswer}.**`
        );
        ONGOING_TRIVIA.delete(userId);
      }
    });
  } catch (error) {
    console.error("Error handling answer collection:", error);
    await interaction.followUp({
      content: "There was an error handling your response.",
      ephemeral: true,
    });
    ONGOING_TRIVIA.delete(userId);
  }
};

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
          ...Object.entries(CATEGORY_MAP).map(([value, name]) => ({
            name,
            value,
          }))
        )
    ),

  async execute(interaction, client) {
    const userId = interaction.user.id;
    const username = interaction.user.username;
    const guild = interaction.guild;
    const timeLimit = 30000; // Time limit for answering in milliseconds

    if (ONGOING_TRIVIA.has(userId)) {
      return interaction.reply({
        content:
          "You already have an ongoing trivia game. Please finish it before starting a new one.",
        ephemeral: true,
      });
    }

    ONGOING_TRIVIA.add(userId);

    try {
      const categoryId = interaction.options.getString("category");
      const categoryName = CATEGORY_MAP[categoryId] || "Video Games";

      let triviaQuestion = await fetchTriviaQuestion(categoryId, categoryName);

      if (!triviaQuestion) {
        // If all questions have been served, fetch questions from the database
        const shuffledQuestions = await getShuffledQuestions(categoryName);
        if (shuffledQuestions.length === 0) {
          throw new Error("No questions available for this category.");
        }

        triviaQuestion = shuffledQuestions[0];
        triviaQuestion.last_served = new Date();
        await triviaQuestion.save();
      }

      if (!triviaQuestion) throw new Error("Failed to fetch trivia question");

      const question = decode(triviaQuestion.question);
      const correctAnswer = decode(triviaQuestion.correct_answer);
      const incorrectAnswers = triviaQuestion.incorrect_answers.map(decode);
      let allAnswers = [...incorrectAnswers, correctAnswer];

      let answerMap = {};

      if (triviaQuestion.type === "boolean") {
        answerMap = { 1: "True", 2: "False" };
      } else {
        allAnswers = allAnswers.sort(() => Math.random() - 0.5);
        answerMap = allAnswers.reduce((map, answer, index) => {
          map[index + 1] = answer;
          return map;
        }, {});
      }

      const triviaEmbed = createTriviaEmbed(
        categoryName,
        question,
        answerMap,
        guild,
        timeLimit
      );

      await interaction.reply({ embeds: [triviaEmbed] });

      await handleAnswerCollection(
        interaction,
        triviaQuestion,
        answerMap,
        correctAnswer,
        allAnswers,
        timeLimit,
        userId,
        username
      );
    } catch (error) {
      console.error("Error executing trivia command:", error);
      await interaction.reply({
        content:
          "Trivia API hit the rate limit or encountered an issue. Please try again in 5 seconds.",
        ephemeral: true,
      });
      ONGOING_TRIVIA.delete(userId);
    }
  },
};
