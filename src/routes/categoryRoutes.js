const express = require('express');
const router = express.Router();
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');

// Routes mapped to /api/categories
router
  .route('/')
  .post(createCategory)
  .get(getAllCategories);

router
  .route('/:id')
  .get(getCategoryById)
  .put(updateCategory)
  .patch(updateCategory)
  .delete(deleteCategory);

module.exports = router;

