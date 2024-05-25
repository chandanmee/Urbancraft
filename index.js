// server.js

require("dotenv").config();
const express = require("express");
const sequelize = require("./config/dbConnect");
const authRouter = require("./routes/authRoute");
const { notFound, errorHandler } = require("./middlewares/errorHandler");

const app = express();
const port = process.env.PORT || 5000;

// Import and use middleware
require("./middlewares/bodyParser")(app);

// Import and use routes

app.use("/api/user", authRouter);

app.use(notFound);
app.use(errorHandler);

// Define a simple route
// app.get("/", (req, res) => {
//   res.send("Hello, world!");
// });

// Sync database and start the server
sequelize.sync().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});
