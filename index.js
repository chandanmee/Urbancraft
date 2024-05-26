require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const sequelize = require("./config/dbConnect");
const authRouter = require("./routes/authRoute");
const { notFound, errorHandler } = require("./middlewares/errorHandler");

const app = express();
const port = process.env.PORT || 5000;

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // This should be before the routes

// Import and use routes
app.use("/api/user", authRouter);

// Error handling middlewares
app.use(notFound);
app.use(errorHandler);

// Sync database and start the server
sequelize.sync().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});
