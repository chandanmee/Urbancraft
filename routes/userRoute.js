// routes/users.js

const express = require("express");
const router = express.Router();
const connection = require("../config/dbConnect");

// Route to get all users
router.get("/", (req, res) => {
  connection.query("SELECT * FROM users", (error, results) => {
    if (error) {
      console.error("Error executing query:", error.stack);
      res.status(500).send("Database query error");
      return;
    }
    res.json(results);
  });
});

module.exports = router;
