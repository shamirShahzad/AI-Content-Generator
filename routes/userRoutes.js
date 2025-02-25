const {
  register,
  login,
  logout,
  userProfile,
  checkAuth,
} = require("../controllers/usersController");
const isAuthenticated = require("../middlewares/isAuthenticated");

const userRouter = require("express").Router();

userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.post("/logout", logout);
userRouter.get("/profile", isAuthenticated, userProfile);
userRouter.get("/auth/check", isAuthenticated, checkAuth);

module.exports = userRouter;
