// server.js

require("dotenv").config();
const express = require("express");
const connection = require("./config/dbConnect");
const userRoutes = require("./routes/userRoute");
const { notFound, errorHandler } = require("./middlewares/errorHandler");

const app = express();
const port = process.env.PORT || 5000;

// Import and use middleware
require("./middlewares/bodyParser")(app);

// Import and use routes

app.use("api/users", userRoutes);

app.use(notFound);
app.use(errorHandler);

// Define a simple route
app.get("/", (req, res) => {
  res.send("Hello, world!");
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
