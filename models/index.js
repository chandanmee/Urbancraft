const { sequelize, syncDatabase } = require("../config/dbConnect");
const { DataTypes } = require("sequelize");

// Import models directly
const Category = require("./categoryModel");
const Product = require("./productModel");
const User = require("./userModel");
const Wishlist = require("./wishlistModel");
const Cart = require("./cartModel");

// Set up associations
User.belongsToMany(Product, { through: Wishlist, foreignKey: "userId" });
Product.belongsToMany(User, { through: Wishlist, foreignKey: "productId" });

Cart.belongsTo(User, { foreignKey: "userId" });
Cart.belongsTo(Product, { foreignKey: "productId" });

User.hasMany(Cart, { foreignKey: "userId" });
Product.hasMany(Cart, { foreignKey: "productId" });


// Sync models with the database
syncDatabase().then(() => {
  console.log("Database & tables created!");
});

module.exports = {
  sequelize,
  User,
  Category,
  Product,
  Wishlist,
  Cart,
  syncDatabase,
};
