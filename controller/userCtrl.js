const generateToken = require("../config/jwtToken");
const User = require("../models/userModel");
const Wishlist = require("../models/wishlistModel");
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
const {
  createUserSchema,
  loginUserSchema,
  updateUserSchema,
  updatePasswordSchema,
} = require("../utils/validationSchemas");

//create a user
const createUser = asyncHandler(async (req, res) => {
  try {
    console.log("Request body:", req.body); // Log the request body for debugging
    // Validate the request body against the createUserSchema
    const { error } = createUserSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email } = req.body;

    // Check if a user with the given email already exists
    const existingUser = await User.findOne({ where: { email } });

    if (!existingUser) {
      // User does not exist, create a new user
      const newUser = await User.create(req.body);
      res.json(newUser);
    } else {
      // User already exists, throw an error
      return res.status(400).json({ message: "User already exists" });
    }
  } catch (error) {
    console.error("Error creating user:", error);
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
});

//login a user
const loginUser = asyncHandler(async (req, res) => {
  try {
    // Validate the request body against the loginUserSchema
    const { error } = loginUserSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = req.body;

    // Check if a user with the given email exists
    const user = await User.findOne({ where: { email } });

    if (user && (await user.isPasswordMatched(password))) {
      // User exists and password matches
      const token = generateToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

      user.refreshToken = refreshToken;
      await user.save();

      // Set the refresh token in an HTTP-only cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Use secure cookies in production
        sameSite: "None", // Adjust according to your needs, especially for cross-site requests
        maxAge: 24 * 60 * 60 * 1000, // Example: 1 day
      });

      // Send the tokens to the client
      res.json({ token });
    } else {
      // User does not exist or password does not match
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Error logging in user:", error);
    res
      .status(500)
      .json({ message: "Error logging in user", error: error.message });
  }
});

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
  const cookies = req.cookies;
  console.log("Received cookies:", cookies); // Log cookies for debugging

  if (!cookies || !cookies.refreshToken) {
    return res.status(400).json({ message: "No Refresh Token in cookies" });
  }

  const refreshToken = cookies.refreshToken;
  const user = await User.findOne({ where: { refreshToken } });

  if (!user) {
    return res
      .status(403)
      .json({ message: "Invalid refresh token present in DB or not matched" });
  }

  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err || user.id !== decoded.id) {
      return res
        .status(403)
        .json({ message: "There is something wrong with the refresh token" });
    }

    const accessToken = generateToken(user.id); // Make sure generateToken uses the correct user ID field
    res.json({ accessToken });
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
// Update Password
const updatePassword = asyncHandler(async (req, res) => {
  try {
    const { id } = req.user;
    validateMySQLId(id);

    const { error } = updatePasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { existingPassword, newPassword } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify existing password
    const isPasswordValid = await user.isPasswordMatched(existingPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid existing password" });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res
      .status(500)
      .json({ message: "Failed to update password", error: error.message });
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
    res.json({ message: "Token sent to email" });
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

//logout a user
const logout = asyncHandler(async (req, res) => {
  console.log("Logging out user"); // Log for debugging
  try {
    const cookie = req.cookies;
    if (!cookie?.refreshToken) throw new Error("No Refresh Token in cookies.");

    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ where: { refreshToken } });
    console.log("User found:", user); // Log user for debugging

    if (!user) {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
      });
      return res.status(204).json({ message: "User logged out successfully" });
    }

    await User.update({ refreshToken: "" }, { where: { refreshToken } });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    res.status(204).json({ message: "User logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to logout", error: error.message }); // Send an error response
  }
});

//update a user
const updateauser = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const { mobile } = req.body;
  validateMySQLId(id);

  // Validate the request body against the updateUserSchema
  const { error } = updateUserSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (mobile && mobile !== user.mobile) {
      const existingUserWithMobile = await User.findOne({ where: { mobile } });
      if (existingUserWithMobile) {
        return res
          .status(400)
          .json({ message: "Mobile number already in use" });
      }
    }

    const [numOfAffectedRows] = await User.update(
      {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        mobile: req.body.mobile,
      },
      { where: { id } }
    );

    if (numOfAffectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = await User.findByPk(id);
    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res
      .status(500)
      .json({ message: "Failed to update user", error: error.message });
  }
});

//get users wishlists
const getWishlists = asyncHandler(async (req, res) => {
  const { user_id } = req.user;
  console.log("test");
  console.log(user_id, "found users wishlists");
  try {
    // Find the user
    const user = await User.findOne({ where: { user_id: user_id } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find all wishlist entries for the user
    const wishlists = await Wishlist.findAll({
      where: { userId: user.id },
      include: [{ model: Product }],
    });

    return res.status(200).json({
      success: true,
      wishlists: wishlists,
    });
  } catch (error) {
    console.error("Error fetching user's wishlist:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
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
  logout,
  updateauser,
  getWishlists,
};
