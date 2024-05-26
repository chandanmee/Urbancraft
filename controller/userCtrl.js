const generateToken = require("../config/jwtToken");
const User = require("../models/userModel");
const uniqid = require("uniqid");
const asyncHandler = require("express-async-handler");
const generateRefreshToken = require("../config/refreshtoken");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { Sequelize } = require("sequelize");
const { response } = require("express");
const { reset } = require("nodemon");
const { validateMySQLId } = require("../utils/validateMySQLId");
const sendEmail = require("./emailCtrl");

//create a user
const createUser = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if a user with the given email already exists
    const existingUser = await User.findOne({ where: { email } });

    if (!existingUser) {
      // User does not exist, create a new user
      const newUser = await User.create(req.body);
      res.json(newUser);
    } else {
      // User already exists, throw an error
      throw new Error("User already exists");
    }
  } catch (error) {
    console.error("Error creating user:", error);
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
};

//login a user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if a user with the given email exists
    const user = await User.findOne({ where: { email } });

    if (user && (await user.isPasswordMatched(password))) {
      // User exists and password matches
      const token = generateToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

      res.json({ token, refreshToken });
    } else {
      // User does not exist or password does not match
      throw new Error("Invalid email or password");
    }
  } catch (error) {
    console.error("Error logging in user:", error);
    res
      .status(401)
      .json({ message: "Invalid email or password", error: error.message });
  }
};

//get all users
const getalluser = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: {
        exclude: ["password"], // Exclude the password field
      },
    });
    res.json(users);
  } catch (error) {
    console.error("Error getting users:", error);
    res
      .status(500)
      .json({ message: "Error getting users", error: error.message });
  }
};

const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie.refreshToken) throw new Error("Please Refresh Token in cookies.");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user)
    throw new Error("Invalid refresh token present in db or not matched");
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err || user.id !== decoded.id) {
      throw new Error("there is something wrong with the refresh token");
    }
    const accesToken = generateToken(user._id);
    res.json({
      accesToken,
    });
  });
});

//get a user
const getauser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log(id + "id");
  validateMySQLId(id);
  try {
    // Assuming you have a MySQL database connection and a User model
    const user = await User.findByPk(id, {
      attributes: {
        exclude: ["password"], // Exclude the password field
      },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    throw new Error(error);
  }
});

//delete a user
const deleteauser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMySQLId(id);
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await user.destroy();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    throw new Error(error);
  }
});

//blocak a user
const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMySQLId(id);
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.isBlocked = true;
    await user.save();
    res.json({ message: "User blocked successfully" });
  } catch (error) {
    throw new Error(error);
  }
});

//unblock a user
const unblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMySQLId(id);
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.isBlocked = false;
    await user.save();
    res.json({ message: "User unblocked successfully" });
  } catch (error) {
    throw new Error(error);
  }
});

//update password
const updatePassword = asyncHandler(async (req, res) => {
  const { id } = req.user;
  validateMySQLId(id);
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.password = req.body.password;
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    throw new Error(error);
  }
});

//generate password reset token
const forgotPasswordToken = asyncHandler(async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const token = await user.createPasswordResetToken();
    await user.save();
    const resetURL = `Hi please follow this link to reset your password.(Valid till 10 min)<a href="http://localhost:5000/api/user/rest-password/${token}">Click here</a>`;
    const data = {
      to: email,
      text: "hey User, Please click on the link to reset your password.",
      subject: "Password Reset Link",
      htm: resetURL,
    };
    sendEmail(data);
    console.log(token);
    res.json(token);
  } catch (error) {
    throw new Error(error);
  }
});

//reset password
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  try {
    const user = await User.findOne({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: { [Sequelize.Op.gt]: Date.now() },
      },
    });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found or token expired" });
    }
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({
      fields: ["password", "passwordResetToken", "passwordResetExpires"],
    });
    res.json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ errMessage: error.message });
  }
});

module.exports = {
  createUser,
  loginUser,
  getalluser,
  getauser,
  handleRefreshToken,
  deleteauser,
  blockUser,
  unblockUser,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
};
