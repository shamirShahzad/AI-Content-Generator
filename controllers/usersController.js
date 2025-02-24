const User = require("../models/User");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

//!REGISTER

const register = asyncHandler(async (req, res) => {
  try {
    const { username, email, password } = req.body;
    //*Validate user data from req.body
    if (!username || !email || !password) {
      res.status(400);
      throw new Error("Please fill in all fields");
    }
    //*Check if email is taken
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    newUser.trialExpires = new Date(
      new Date().getTime() + newUser.trialPeriod * 24 * 60 * 60 * 1000
    );
    await newUser.save();
    res.json({
      status: true,
      message: "User created successfully",
      user: {
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    throw new Error(error);
  }
});

//!LOGIN
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("Please fill in all fields");
  }
  const user = await User.findOne({ email });
  if (!user) {
    res.status(401);
    throw new Error("Invalid Credentials");
  }
  const isMatching = await bcrypt.compare(password, user?.password);
  if (!isMatching) {
    res.status(401);
    throw new Error("Invalid Credentials");
  }
  //*Generate JWT token
  const token = jwt.sign(
    {
      id: user?._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "3d",
    }
  );
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "prod",
    sameSite: "strict",
    maxAge: 3 * 24 * 60 * 60 * 1000,
  });

  console.log(token);

  res.json({
    status: true,
    message: "User logged in successfully",
    user: {
      _id: user?._id,
      username: user?.username,
      email: user?.email,
    },
  });
});

//!Logout

const logout = asyncHandler(async (req, res) => {
  res.cookie("token", "", { maxAge: 1 });
  res.status(200);
  res.json({
    message: "User logged out successfully",
  });
});

//!Get user profile
const userProfile = asyncHandler(async (req, res) => {
  const id = "67bc94a74b4fd58d11adfd29";
  const user = await User.findById(id).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.status(200);
  res.json({
    status: true,
    user,
  });
});

//!Export

const usersController = {
  register,
  login,
  logout,
  userProfile,
};

module.exports = usersController;
