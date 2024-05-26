const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;
  if (req?.headers?.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
    try {
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ where: { id: decoded.id } }); // Find user by ID using Sequelize

        if (!user) {
          throw new Error("User not found"); // If user is not found, throw an error
        }

        req.user = user;
        next();
      }
    } catch (error) {
      next(error); // Call next with the error to pass it to the error handler middleware
    }
  } else {
    next(new Error("Token not found")); // Call next with the error to pass it to the error handler middleware
  }
});

const isAdmin = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req.user;
    const adminUser = await User.findOne({ where: { email } }); // Find user by email using Sequelize

    if (!adminUser) {
      throw new Error("User not found"); // If user is not found, throw an error
    }

    if (adminUser.role !== "admin") {
      throw new Error("Not authorised as an admin"); // If user is not an admin, throw an error
    }

    next(); // If everything is fine, call next to proceed to the next middleware
  } catch (error) {
    next(error); // Call next with the error to pass it to the error handler middleware
  }
});

module.exports = { authMiddleware, isAdmin };
