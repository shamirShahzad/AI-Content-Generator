const {
  register,
  login,
  logout,
  userProfile,
} = require("../controllers/usersController");
const isAuthenticated = require("../middlewares/isAuthenticated");

const userRouter = require("express").Router();

userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.post("/logout", logout);
userRouter.get("/profile", isAuthenticated, userProfile);

module.exports = userRouter;
