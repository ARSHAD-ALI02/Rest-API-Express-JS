const Category = require('../models/Category');

// @desc    Create a new category
// @route   POST /api/categories
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body || {};

    // Screenshot 4 Requirement: Check if user forgot to send category name
    if (!name || name.trim() === '') {
      return res.status(400).json({
        error: 'Name is required',
        message: 'Name is required',
      });
    }

    const existingCategory = await Category.findOne({ name: name.trim() });
    if (existingCategory) {
      return res.status(400).json({
        error: 'Category already exists',
        message: 'Category already exists',
      });
    }

    const category = await Category.create({ name: name.trim(), description });
    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Server error while creating category',
      message: error.message,
    });
  }
};

// @desc    Get all categories
// @route   GET /api/categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Server error while fetching categories',
      message: error.message,
    });
  }
};

// @desc    Get single category by ID
// @route   GET /api/categories/:id
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        error: 'Category not found',
        message: 'Category not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        error: 'Category not found',
        message: 'Category not found',
      });
    }
    return res.status(500).json({
      error: 'Server error while fetching category',
      message: error.message,
    });
  }
};

// @desc    Update a category by ID
// @route   PUT /api/categories/:id
exports.updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body || {};

    if (name) {
      const duplicate = await Category.findOne({ name: name.trim(), _id: { $ne: req.params.id } });
      if (duplicate) {
        return res.status(400).json({
          error: 'Category name already in use by another category',
          message: 'Category name already in use by another category',
        });
      }
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name: name ? name.trim() : undefined, description },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        error: 'Category not found',
        message: 'Category not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category,
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        error: 'Category not found',
        message: 'Category not found',
      });
    }
    return res.status(500).json({
      error: 'Server error while updating category',
      message: error.message,
    });
  }
};

// @desc    Delete a category by ID
// @route   DELETE /api/categories/:id
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({
        error: 'Category not found',
        message: 'Category not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
      data: category,
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        error: 'Category not found',
        message: 'Category not found',
      });
    }
    return res.status(500).json({
      error: 'Server error while deleting category',
      message: error.message,
    });
  }
};
