// models/user.js

const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/dbConnect");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

class User extends Model {
  async isPasswordMatched(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  }

  async createPasswordResetToken() {
    const resettoken = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto
      .createHash("sha256")
      .update(resettoken)
      .digest("hex");
    this.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 10 minutes
    await this.save();
    return resettoken;
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, // Generate UUID using Sequelize
      primaryKey: true,
      unique: true,
    },
    user_id: {
      type: DataTypes.STRING,
    },
    firstname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    mobile: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: "user",
    },
    isBlocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    cart: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    address: {
      type: DataTypes.STRING,
    },
    wishlist: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    refreshToken: {
      type: DataTypes.STRING,
    },
    passwordChangedAt: {
      type: DataTypes.DATE,
    },
    passwordResetToken: {
      type: DataTypes.STRING,
    },
    passwordResetExpires: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: "User",
    timestamps: true,
    hooks: {
      beforeSave: async (user, options) => {
        if (user.changed("password")) {
          const salt = await bcrypt.genSaltSync(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeCreate: async (user, options) => {
        // Generate custom user ID
        const generateCustomId = () => {
          const randomBytes = crypto.randomBytes(12); // 12 bytes = 96 bits
          const randomString = randomBytes.toString("base64url").slice(0, 16); // Convert to a base64 string and take the first 16 characters
          const formattedString = randomString
            .replace(/(.{4})/g, "$1-")
            .slice(0, 19); // Add hyphens after every 4 characters
          return `USR-${formattedString.toUpperCase()}`;
        };

        // Ensure the ID is unique by checking the database
        let isUnique = false;
        while (!isUnique) {
          const newId = generateCustomId();
          const existingUser = await User.findOne({
            where: { user_id: newId },
          });
          if (!existingUser) {
            user.user_id = newId;
            isUnique = true;
          }
        }
      },
    },
  }
);

module.exports = User;
