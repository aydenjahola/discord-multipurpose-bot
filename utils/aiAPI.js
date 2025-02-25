const axios = require("axios");
const API_KEY = process.env.HUGGING_FACE_API_KEY;

const getAIResponse = async (model_name, input) => {
  try {
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${model_name}`,
      { inputs: input, parameters: { max_length: 100 } },
      {
        headers: { Authorization: `Bearer ${API_KEY}` },
      }
    );

    // Handle model loading state
    if (response.data.error?.includes("loading")) {
      console.log(`Model ${model_name} is loading, retrying...`);
      return null;
    }

    return response.data[0] || null;
  } catch (error) {
    console.error("API Error:", error.message);

    // Handle specific error cases
    if (error.response?.data?.error) {
      console.log("HF API Error:", error.response.data.error);
    }

    return null;
  }
};

module.exports = { getAIResponse };
