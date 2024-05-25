// routes/users.js

const express = require("express");
const router = express.Router();
const connection = require("../config/dbConnect");
const {
  createUser,
  loginUser,
  getalluser,
  handleRefreshToken,
  getauser,
  deleteauser,
} = require("../controller/userCtrl");

const { authMiddleware, isAdmin } = require("../middlewares/authMiddlewate");

router.post("/register", createUser);
router.post("/login", loginUser);

router.get("/get-all", authMiddleware, isAdmin, getalluser);
router.get("/:id", authMiddleware, isAdmin, getauser);

router.delete("/:id", authMiddleware, isAdmin, deleteauser);
module.exports = router;
