const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/dbConnect");

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
    tableName: "Categories", // Ensure table name is correctly referenced
    timestamps: true,
  }
);

module.exports = Category;
