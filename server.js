require("dotenv").config();
const express = require("express");
const userRouter = require("./routes/userRoutes");
const errorMiddleware = require("./middlewares/errorMiddleware");
const cookieParser = require("cookie-parser");
const cron = require("node-cron");
const openAIRouter = require("./routes/openAIRoutes");
const stripePaymentRouter = require("./routes/stripePaymentRoutes");
const User = require("./models/User");
const cors = require("cors");
require("./utils/connectDb")();
const app = express();
const PORT = process.env.PORT || 5000;

// Cron for the trial period run every single day

//1 day
cron.schedule("0 0 * * * *", async () => {
  try {
    // Get current Date()
    const today = new Date();
    await User.updateMany(
      {
        trialActive: true,
        trialExpires: { $lt: today },
      },
      {
        trialActive: false,
        subscriptionPlan: "Free",
        monthlyRequestCount: 5,
        apiRequestCount: 0,
      }
    );
  } catch (error) {
    console.error(error);
  }
});

// Cron for free plan
cron.schedule("0 0 1 * * *", async () => {
  try {
    // Get current Date()
    const today = new Date();
    await User.updateMany(
      {
        subscriptionPlan: "Free",
        nextBillingDate: { $lt: today },
      },
      {
        monthlyRequestCount: 0,
      }
    );
  } catch (error) {
    console.error(error);
  }
});

//Cron for Basic plan
cron.schedule("0 0 1 * * *", async () => {
  try {
    // Get current Date()
    const today = new Date();
    await User.updateMany(
      {
        subscriptionPlan: "Basic",
        nextBillingDate: { $lt: today },
      },
      {
        trialActive: false,
        subscriptionPlan: "Free",
        monthlyRequestCount: 5,
        apiRequestCount: 0,
      }
    );
  } catch (error) {
    console.error(error);
  }
});

// Cron for Premium Plan
cron.schedule("0 0 1 * * *", async () => {
  try {
    // Get current Date()
    const today = new Date();
    await User.updateMany(
      {
        subscriptionPlan: "Premium",
        nextBillingDate: { $lt: today },
      },
      {
        trialActive: false,
        subscriptionPlan: "Free",
        monthlyRequestCount: 5,
        apiRequestCount: 0,
      }
    );
  } catch (error) {
    console.error(error);
  }
});

//Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

//Routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/openai", openAIRouter);
app.use("/api/v1/stripe", stripePaymentRouter);
app.use(errorMiddleware);

app.get("/", (req, res) => res.send("Hello World!"));
app.listen(PORT, () => console.log(`Server is running on port ${PORT}!`));
