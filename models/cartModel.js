const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/dbConnect");
const User = require("./userModel");
const Product = require("./productModel");

const Cart = sequelize.define("Cart", {
  userId: {
    type: DataTypes.CHAR(36),
    references: {
      model: User,
      key: "id",
    },
  },
  productId: {
    type: DataTypes.STRING(255),
    references: {
      model: Product,
      key: "id",
    },
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
});

Cart.belongsTo(Product, { foreignKey: "productId" });

User.hasMany(Cart, { foreignKey: "userId" });
Product.hasMany(Cart, { foreignKey: "productId" });

module.exports = Cart;
