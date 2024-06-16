const Category = require("../models/categoryModel");
const asyncHandler = require("express-async-handler");
const { createCategorySchema } = require("../utils/validationSchemas");
const fs = require("fs");
const path = require("path");

// Function to create directory recursively
const mkdirSyncRecursive = (directory) => {
  const pathParts = directory.split("/");
  for (let i = 1; i <= pathParts.length; i++) {
    const segment = pathParts.slice(0, i).join("/");
    if (!fs.existsSync(segment)) {
      fs.mkdirSync(segment);
    }
  }
};

// Create a category
const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  // Validate the request body
  const { error } = createCategorySchema.validate(req.body);
  if (error) {
    res.status(400);
    throw new Error(error.details[0].message);
  }

  // Check if the category already exists
  const categoryExists = await Category.findOne({ where: { name } });
  if (categoryExists) {
    res.status(400);
    throw new Error("Category already exists");
  }

  // Create the category
  const category = await Category.create({ name });
  if (category) {
    // Create directory for uploads/products/categoryName
    const categoryFolderPath = path.join(
      __dirname,
      `../uploads/products/${category.name}`
    );
    mkdirSyncRecursive(categoryFolderPath);

    res.status(201).json({
      categoryId: category.categoryId,
      name: category.name,
    });
  } else {
    res.status(400);
    throw new Error("Invalid category data");
  }
});

module.exports = { createCategory };
