// routes/users.js
const express = require("express");
const router = express.Router();
const connection = require("../config/dbConnect");
const { createCategory } = require("../controller/categoryCtrl");

const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

router.post("/create", authMiddleware, isAdmin, createCategory);

module.exports = router;
