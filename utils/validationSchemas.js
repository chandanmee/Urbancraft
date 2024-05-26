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

module.exports = {
  createUserSchema,
  loginUserSchema,
  updateUserSchema,
  updatePasswordSchema,
};
