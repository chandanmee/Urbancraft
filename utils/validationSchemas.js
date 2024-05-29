const Joi = require("joi");

const createUserSchema = Joi.object({
  firstname: Joi.string().min(1).max(50).required(),
  lastname: Joi.string().min(1).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  mobile: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .optional(),
});

const loginUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

const updateUserSchema = Joi.object({
  firstname: Joi.string().min(1).max(50).optional(),
  lastname: Joi.string().min(1).max(50).optional(),
  mobile: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .optional(), // Example for a 10-digit mobile number
}).unknown(false); // Disallow unknown fields

const updatePasswordSchema = Joi.object({
  existingPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required(), // Adjust minimum password length as needed
});

const createProductSchema = Joi.object({
  title: Joi.string().min(1).max(100).required(),
  description: Joi.string().min(1).required(),
  price: Joi.number().min(0).required(),
  image: Joi.string().uri().required(),
  category: Joi.string().min(1).required(),
  brand: Joi.string().min(1).required(),
  quantity: Joi.number().min(0).required(),
  color: Joi.array().items(Joi.string().min(1)).optional(),
  tags: Joi.array().items(Joi.string().min(1)).optional(),
  ratings: Joi.array().items(Joi.number().min(1).max(5)).optional(),
  totalrating: Joi.number().min(1).max(5).optional(),
  sold: Joi.number().min(0).optional(),
  // Add other fields as needed
});

//scehema for updating a product
const updateProductSchema = Joi.object({
  title: Joi.string().min(1).max(100).optional(),
  description: Joi.string().min(1).optional(),
  price: Joi.number().min(0).optional(),
  image: Joi.string().uri().optional(),
  category: Joi.string().min(1).optional(),
  brand: Joi.string().min(1).optional(),
  quantity: Joi.number().min(0).optional(),
  color: Joi.array().items(Joi.string().min(1)).optional(),
  tags: Joi.array().items(Joi.string().min(1)).optional(),
  ratings: Joi.array().items(Joi.number().min(1).max(5)).optional(),
  totalrating: Joi.number().min(1).max(5).optional(),
  sold: Joi.number().min(0).optional(),
  // Add other fields as needed
});

const createCategorySchema = Joi.object({
  name: Joi.string().min(1).max(50).required(),
});

module.exports = {
  createUserSchema,
  loginUserSchema,
  updateUserSchema,
  updatePasswordSchema,
  createProductSchema,
  createCategorySchema,
  updateProductSchema,
};
