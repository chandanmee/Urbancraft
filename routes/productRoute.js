// routes/users.js

const express = require("express");
const router = express.Router();
const connection = require("../config/dbConnect");
const {
  createProduct,
  getaProduct,
  getAllProducts,
  updateaProduct,
  deleteaProduct,
} = require("../controller/productCtrl");

const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

router.get("/:id", getaProduct);
router.get("/", getAllProducts);

router.post("/create", authMiddleware, isAdmin, createProduct);

router.put("/:id", authMiddleware, isAdmin, updateaProduct);
router.delete("/:id", authMiddleware, isAdmin, deleteaProduct);

module.exports = router;
