// const Product = require("../models/productModel");
// const Category = require("../models/categoryModel");
// const User = require("../models/userModel");
const { sequelize } = require("../config/dbConnect");
const asyncHandler = require("express-async-handler");
const { User, Product, Wishlist, Category, Cart } = require("../models");
const slugify = require("slugify");
const {
  createProductSchema,
  updateProductSchema,
} = require("../utils/validationSchemas");

//create a product
const createProduct = asyncHandler(async (req, res) => {
  const { title, description, price, category, brand, quantity, color, tags } =
    req.body;

  // Validate the request body
  const { error } = createProductSchema.validate(req.body);
  if (error) {
    res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
    return;
  }

  try {
    // Check if the category exists
    const existingCategory = await Category.findOne({
      where: { name: category },
    });
    if (!existingCategory) {
      res.status(400).json({
        success: false,
        message: "Category does not exist",
      });
      return;
    }

    // Create the product
    const product = await Product.create({
      title,
      slug: slugify(title, { lower: true }),
      description,
      price,
      category,
      brand,
      quantity,
      color,
      tags,
      categoryId: existingCategory.categoryId, // Assign categoryId from existing category
    });

    res.status(201).json({
      success: true,
      data: {
        productId: product.id,
        title: product.title,
        slug: product.slug,
        description: product.description,
        price: product.price,
        category: product.category,
        brand: product.brand,
        quantity: product.quantity,
        color: product.color,
        tags: product.tags,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

//get a product
const getaProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (product) {
    res.json({
      success: true,
      product: product,
    });
  } else {
    res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }
});

//get all product
const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.findAll();
  res.json({
    success: true,
    products: products,
  });
});

//Update a product
const updateaProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  const { error } = updateProductSchema.validate(req.body);
  if (error) {
    res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
    return;
  }
  if (product) {
    // Update fields only if they are provided in the request body
    const fieldsToUpdate = [
      "title",
      "description",
      "price",
      "category",
      "brand",
      "quantity",
      "color",
      "tags",
    ];
    fieldsToUpdate.forEach((field) => {
      if (req.body.hasOwnProperty(field)) {
        product[field] = req.body[field];
      }
    });

    // Update the slug if the title is provided and is a string
    if (typeof req.body.title === "string") {
      product.slug = slugify(req.body.title, { lower: true });
    }

    // Save the updated product
    const updatedProduct = await product.save();
    res.json({
      success: true,
      product: updatedProduct,
    });
  } else {
    res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }
});

//delete a product
const deleteaProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (product) {
    await product.destroy();
    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } else {
    res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }
});

//wishlist a product by user
const addToWishlist = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { productId } = req.body;
    console.log(user_id);

    // Check if the user exists
    const user = await User.findOne({ where: { user_id: user_id } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if the product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if the product is already in the user's wishlist
    const wishlistEntry = await Wishlist.findOne({
      where: { userId: user.id, productId: product.id },
    });
    if (wishlistEntry) {
      return res.status(400).json({
        success: false,
        message: "Product already in wishlist",
      });
    }

    // Add product to user's wishlist
    await Wishlist.create({ userId: user.id, productId: product.id });

    // Send success response
    return res.status(200).json({
      success: true,
      message: "Product added to wishlist",
    });
  } catch (error) {
    // Handle unexpected errors
    console.error("Error adding product to wishlist:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//remove from wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { productId } = req.body;

    // Check if the user exists
    const user = await User.findOne({ where: { user_id: user_id } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if the product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if the product is in the user's wishlist
    const wishlistEntry = await Wishlist.findOne({
      where: { userId: user.id, productId: product.id },
    });
    if (!wishlistEntry) {
      return res.status(404).json({
        success: false,
        message: "Product not in wishlist",
      });
    }

    // Remove product from user's wishlist
    await wishlistEntry.destroy();

    // Send success response
    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
    });
  } catch (error) {
    // Handle unexpected errors
    console.error("Error removing product from wishlist:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//add a product to cart

const addToCart = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { user_id } = req.user;
    const { productId, quantity } = req.body;

    // Validate quantity
    const quantityToAdd = parseInt(quantity, 10);
    if (isNaN(quantityToAdd) || quantityToAdd <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid quantity",
      });
    }

    // Fetch user and product in parallel
    const [user, product] = await Promise.all([
      User.findOne({ where: { user_id: user_id } }, { transaction }),
      Product.findByPk(productId, { transaction }),
    ]);

    if (!user) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!product) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if the product is already in the user's cart
    const cartItem = await Cart.findOne({
      where: { userId: user.id, productId: product.id },
      transaction,
    });

    if (cartItem) {
      // Product is already in the cart, update its quantity
      cartItem.quantity += quantityToAdd;
      await cartItem.save({ transaction });
    } else {
      // Product is not in the cart, add it
      await Cart.create(
        { userId: user.id, productId: product.id, quantity: quantityToAdd },
        { transaction }
      );
    }

    await transaction.commit();
    return res.status(200).json({
      success: true,
      message: "Product added to cart",
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error adding product to cart:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Remove a product from the cart
const removeFromCart = asyncHandler(async (req, res) => {
  const { user_id } = req.user;
  const { productId } = req.body;
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

    // Find the product
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Find the cart item
    const cartItem = await Cart.findOne({
      where: { userId: user.id, productId: product.id },
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Product not in cart",
      });
    }

    // Remove the cart item
    await cartItem.destroy();

    return res.status(200).json({
      success: true,
      message: "Product removed from cart",
    });
  } catch (error) {
    console.error("Error removing product from cart:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

module.exports = {
  createProduct,
  getaProduct,
  getAllProducts,
  updateaProduct,
  deleteaProduct,
  addToWishlist,
  removeFromWishlist,
  addToCart,
  removeFromCart,
};
