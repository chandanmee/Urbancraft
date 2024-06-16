const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/dbConnect");
const Product = require("./productModel");

const ProductImage = sequelize.define(
  "ProductImage",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      unique: true,
    },
    imagePath: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // Add the productId column to reference the Product it belongs to
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

ProductImage.belongsTo(Product, { foreignKey: "productId" });
Product.hasMany(ProductImage, { foreignKey: "productId" });

module.exports = ProductImage;
