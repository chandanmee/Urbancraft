const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const asyncHandler = require("express-async-handler");
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
    product.title = req.body.title;
    product.slug = slugify(req.body.title, { lower: true });
    product.description = req.body.description;
    product.price = req.body.price;
    product.category = req.body.category;
    product.brand = req.body.brand;
    product.quantity = req.body.quantity;
    product.color = req.body.color;
    product.tags = req.body.tags;

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
module.exports = {
  createProduct,
  getaProduct,
  getAllProducts,
  updateaProduct,
  deleteaProduct,
};
