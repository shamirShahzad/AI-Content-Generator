const isAuthenticated = require("../middlewares/isAuthenticated");

const openAIRouter = require("express").Router();

openAIRouter.get("/generate-content", isAuthenticated, openAIController);

module.exports = openAIRouter;
