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
  blockUser,
  unblockUser,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
  logout,
  updateauser,
} = require("../controller/userCtrl");

const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

router.post("/register", createUser);
router.post("/forgot-password-token", forgotPasswordToken);
router.put("/reset-password/:token", resetPassword);
router.put("/password", authMiddleware, updatePassword);
router.post("/login", loginUser);

router.get("/refresh", handleRefreshToken);
router.get("/logout", logout);
router.get("/get-all", authMiddleware, isAdmin, getalluser);
router.get("/:id", authMiddleware, isAdmin, getauser);

router.delete("/:id", authMiddleware, isAdmin, deleteauser);

router.put("/edit-user", authMiddleware, updateauser);
router.put("/block-user/:id", authMiddleware, isAdmin, blockUser);
router.put("/unblock-user/:id", authMiddleware, isAdmin, unblockUser);

module.exports = router;
