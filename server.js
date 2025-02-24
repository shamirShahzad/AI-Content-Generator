require("dotenv").config();
const express = require("express");
const userRouter = require("./routes/userRoutes");
const errorMiddleware = require("./middlewares/errorMiddleware");
const cookieParser = require("cookie-parser");
require("./utils/connectDb")();
const app = express();
const PORT = process.env.PORT || 5000;

//Middlewares
app.use(express.json());
app.use(cookieParser());

//Routes
app.use("/api/v1/users", userRouter);
app.use(errorMiddleware);

app.get("/", (req, res) => res.send("Hello World!"));
app.listen(PORT, () => console.log(`Server is running on port ${PORT}!`));
