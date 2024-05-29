const sequelize = require("../config/database");
const Category = require("./categoryModel");
const Product = require("./productModel");

// Sync models with the database
sequelize.sync().then(() => {
  console.log("Database & tables created!");
});

module.exports = {
  Category,
  Product,
};
