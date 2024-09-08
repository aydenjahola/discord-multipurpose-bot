const mongoose = require("mongoose");

require("dotenv").config();

const TriviaQuestion = require("../models/TriviaQuestion");

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ Failed to connect to MongoDB", err));

async function removeDuplicates() {
  try {
    // Aggregate duplicates
    const duplicates = await TriviaQuestion.aggregate([
      {
        $group: {
          _id: "$question", // Group by the question text
          count: { $sum: 1 },
          ids: { $push: "$_id" }, // Collect ids of the duplicate entries
        },
      },
      {
        $match: { count: { $gt: 1 } }, // Match groups with more than one document
      },
    ]);

    // Remove duplicates
    for (const doc of duplicates) {
      const idsToRemove = doc.ids.slice(1); // Keep the first entry and remove the rest
      await TriviaQuestion.deleteMany({ _id: { $in: idsToRemove } });
      console.log(`Removed duplicates: ${idsToRemove}`);
    }

    console.log("Duplicates removed");
  } catch (err) {
    console.error("Error removing duplicates:", err);
  } finally {
    // Close the connection
    mongoose.connection.close();
  }
}

removeDuplicates();
