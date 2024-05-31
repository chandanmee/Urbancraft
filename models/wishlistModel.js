const { sequelize } = require("../config/dbConnect");
const { DataTypes } = require("sequelize");
const Wishlist = sequelize.define(
  "Wishlist",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      unique: true,
    },
    // Define the foreign key columns with appropriate names
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "userId", // Specify the field name in the database
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "productId", // Specify the field name in the database
    },
  },
  {
    sequelize,
    modelName: "Wishlist",
  }
);
module.exports = Wishlist;
