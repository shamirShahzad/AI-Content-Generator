const asyncHandler = require("express-async-handler");
const axios = require("axios");
const ContentHistory = require("../models/ContentHistory");

//!Open AI Controller

const openAIController = asyncHandler(async (req, res) => {
  const { prompt } = req.body;
  const response = await axios.post(
    `https://api.openai.com/v1/chat/completions`,
    {
      model: "gpt-4o-mini",
      prompt: `Generate a blog post for ${prompt}`,
      max_tokens: 10,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPEN_AI_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  const content = response?.data?.choices[0].text?.trim();

  //! Create history.

  const history = await ContentHistory.create({
    user: req?.user?._id,
    content: content,
  });

  const user = await User.findById(req?.user?._id);
  user?.history?.push(history?._id);
  await user?.save();

  res.status(200).json({
    content,
  });
});

module.exports = openAIController;
