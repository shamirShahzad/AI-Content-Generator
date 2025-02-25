const openAIController = require("../controllers/openAIController");
const checkApiRequestLimit = require("../middlewares/checkApiRequestLimit");
const isAuthenticated = require("../middlewares/isAuthenticated");

const openAIRouter = require("express").Router();

openAIRouter.get(
  "/generate-content",
  isAuthenticated,
  checkApiRequestLimit,
  openAIController
);

module.exports = openAIRouter;
