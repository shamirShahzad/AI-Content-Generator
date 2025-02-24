const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const isAuthenticated = asyncHandler(async (req, res, next) => {
  if (req.cookies.token) {
    //! Verify the token
    const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded?.id).select("-password");
    return next();
  } else {
    res.status(401);
    return next(new Error("Not authenticated"));
  }
});

module.exports = isAuthenticated;
