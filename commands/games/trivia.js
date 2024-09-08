const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require("axios");
const { decode } = require("html-entities");
const TriviaQuestion = require("../../models/TriviaQuestion");
const Leaderboard = require("../../models/Leaderboard");
const TriviaSession = require("../../models/TriviaSession");

const API_INTERVAL = 5000; // 5 seconds
const QUESTION_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 1 month
const ACTIVE_GAMES = new Set(); // Track users with ongoing trivia
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

// Fetch or create a new session token from the database
const getSessionToken = async () => {
  let session = await TriviaSession.findOne();

  if (!session) {
    // If no token exists, request a new one
    const response = await axios.get(
      "https://opentdb.com/api_token.php?command=request"
    );
    const newToken = response.data.token;

    session = new TriviaSession({
      token: newToken,
    });

    await session.save();
  }

  return session.token;
};

// Reset the session token if it's exhausted and update the database
const resetSessionToken = async () => {
  let session = await TriviaSession.findOne();

  if (!session) {
    // If there's no session, create a new one as fallback
    return await getSessionToken();
  }

  // Reset the session token
  const response = await axios.get(
    `https://opentdb.com/api_token.php?command=reset&token=${session.token}`
  );
  const newToken = response.data.token;

  // Update token in the database
  session.token = newToken;
  session.last_updated = new Date();
  await session.save();

  return newToken;
};

const fetchTriviaQuestion = async (categoryId, categoryName) => {
  try {
    let triviaQuestion;
    let source = "API"; // Default to API

    // Get session token before making API call
    let sessionToken = await getSessionToken();

    // Attempt to find a question in the database that hasn't been served recently
    triviaQuestion = await TriviaQuestion.findOne({
      last_served: { $lt: new Date(Date.now() - QUESTION_EXPIRY) },
      category: categoryName,
    }).sort({ last_served: 1 });

    if (!triviaQuestion || Date.now() - LAST_API_CALL.time >= API_INTERVAL) {
      // If no question was found in the database or API cooldown is over, fetch from API
      const response = await axios.get(
        `https://opentdb.com/api.php?amount=1&category=${categoryId}&token=${sessionToken}`
      );
      const apiQuestion = response.data.results[0];

      // Check if the token is exhausted (response code 4 indicates this)
      if (response.data.response_code === 4) {
        sessionToken = await resetSessionToken(); // Reset session token
        // Retry fetching the question with the new token
        const retryResponse = await axios.get(
          `https://opentdb.com/api.php?amount=1&category=${categoryId}&token=${sessionToken}`
        );
        const retryApiQuestion = retryResponse.data.results[0];
        triviaQuestion = await TriviaQuestion.findOne({
          question: decode(retryApiQuestion.question),
          category: categoryName,
        });

        if (!triviaQuestion) {
          await TriviaQuestion.create({
            question: decode(retryApiQuestion.question),
            correct_answer: decode(retryApiQuestion.correct_answer),
            incorrect_answers: retryApiQuestion.incorrect_answers.map(decode),
            category: categoryName,
            last_served: null,
          });

          triviaQuestion = await TriviaQuestion.findOne({
            question: decode(retryApiQuestion.question),
            category: categoryName,
          });
        }
      } else {
        triviaQuestion = await TriviaQuestion.findOne({
          question: decode(apiQuestion.question),
          category: categoryName,
        });

        if (!triviaQuestion) {
          await TriviaQuestion.create({
            question: decode(apiQuestion.question),
            correct_answer: decode(apiQuestion.correct_answer),
            incorrect_answers: apiQuestion.incorrect_answers.map(decode),
            category: categoryName,
            last_served: null,
          });

          triviaQuestion = await TriviaQuestion.findOne({
            question: decode(apiQuestion.question),
            category: categoryName,
          });
        }
      }

      LAST_API_CALL.time = Date.now(); // Update the last API call time
    } else {
      // If found in the database, set source to "Database"
      source = "Database";
    }

    if (triviaQuestion) {
      // Update the `last_served` timestamp when serving the question
      triviaQuestion.last_served = new Date();
      await triviaQuestion.save();
    }

    return { triviaQuestion, source }; // Return both the question and its source
  } catch (error) {
    console.error("Error fetching or saving trivia question:", error);
    throw new Error("Error fetching trivia question");
  }
};

const createTriviaEmbed = (
  categoryName,
  question,
  answerMap,
  guild,
  timeLimit,
  source
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
      text: `${guild.name} | Answer within ${
        timeLimit / 1000
      } seconds | Source: ${source}`,
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
            ? "🎉 Correct!"
            : `❌ Incorrect! the correct answer is **${correctAnswer}.**`;

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

        ACTIVE_GAMES.delete(userId);
      } catch (error) {
        console.error("Error processing collected answer:", error);
        await interaction.followUp({
          content: "There was an error processing your answer.",
          ephemeral: true,
        });
        ACTIVE_GAMES.delete(userId);
      }
    });

    answerCollector.on("end", async (collected, reason) => {
      if (reason === "time") {
        // Reset the user's streak when time runs out
        try {
          let userScore = await Leaderboard.findOne({ userId });
          if (userScore) {
            userScore.streak = 0; // Reset streak
            await userScore.save();
          }

          await interaction.followUp(
            `⏰ <@${userId}> Time's up! The correct answer is **${correctAnswer}**. Your current streak is **${userScore.streak}**.`
          );
        } catch (error) {
          console.error("Error resetting streak after time limit:", error);
          await interaction.followUp({
            content: "There was an error resetting your streak.",
            ephemeral: true,
          });
        }

        ACTIVE_GAMES.delete(userId);
      }
    });
  } catch (error) {
    console.error("Error handling answer collection:", error);
    await interaction.followUp({
      content: "There was an error handling your response.",
      ephemeral: true,
    });
    ACTIVE_GAMES.delete(userId);
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

    if (ACTIVE_GAMES.has(userId)) {
      return interaction.reply({
        content:
          "You already have an ongoing trivia game. Please finish it before starting a new one.",
        ephemeral: true,
      });
    }

    ACTIVE_GAMES.add(userId);

    try {
      const categoryId = interaction.options.getString("category");
      const categoryName = CATEGORY_MAP[categoryId] || "Video Games";

      const { triviaQuestion, source } = await fetchTriviaQuestion(
        categoryId,
        categoryName
      );

      if (!triviaQuestion) {
        throw new Error("No questions available.");
      }

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
        timeLimit,
        source // Pass the source flag (API or Database)
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
      ACTIVE_GAMES.delete(userId);
    }
  },
};
