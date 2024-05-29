const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/dbConnect");
const Category = require("./categoryModel");

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      unique: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: true,
      },
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    brand: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sold: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    images: {
      type: DataTypes.JSON,
    },
    color: {
      type: DataTypes.JSON,
    },
    tags: {
      type: DataTypes.JSON,
    },
    ratings: {
      type: DataTypes.JSON,
    },
    totalrating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    categoryId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      references: {
        model: "Categories", // Name of the target model
        key: "categoryId", // Key in the target model that this column references
      },
    },
  },
  {
    timestamps: true,
  }
);

// Create the table if it doesn't exist
Product.sync();

Product.belongsTo(Category, { foreignKey: "categoryId" });
Category.hasMany(Product, { foreignKey: "categoryId" });

module.exports = Product;
