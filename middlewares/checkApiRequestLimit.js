const asyncHandler = require("express-async-handler");
const User = require("../models/User");

const checkApiRequestLimit = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    res.status(401);
    return next(new Error("Unauthorized"));
  }
  const user = await User.findById(req?.user?.id);
  if (!user) {
    res.status(404);
    return next(new Error("User not found"));
  }
  let requestLimit = 0;
  // Check if user is on trial period
  if (user.isTrialActive) {
    requestLimit = user?.monthlyRequestCount;
  }
  // Check if user has exceeded his/her monthly request limit
  if (user.apiRequestCount >= requestLimit) {
    next(new Error("Api request Limit reached"));
  }
});

module.exports = checkApiRequestLimit;
