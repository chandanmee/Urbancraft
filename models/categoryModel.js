const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbConnect");

const Category = sequelize.define(
  "Category",
  {
    categoryId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Create the table if it doesn't exist
Category.sync();

module.exports = Category;
