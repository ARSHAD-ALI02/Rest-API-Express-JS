const Course = require('../models/Course');
const Category = require('../models/Category');

// @desc    Create a new course
// @route   POST /api/courses
exports.createCourse = async (req, res) => {
  try {
    const { title, description, price, category } = req.body || {};

    if (!title || title.trim() === '') {
      return res.status(400).json({
        error: 'Course title is required',
        message: 'Course title is required',
      });
    }

    if (!category) {
      return res.status(400).json({
        error: 'Category ID is required',
        message: 'Category ID is required',
      });
    }

    // Verify category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({
        error: 'Referenced category not found',
        message: 'Referenced category not found',
      });
    }

    const course = await Course.create({
      title: title.trim(),
      description,
      price,
      category,
    });

    const populatedCourse = await course.populate('category');

    return res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: populatedCourse,
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        error: 'Invalid Category ID format',
        message: 'Invalid Category ID format',
      });
    }
    return res.status(500).json({
      error: 'Server error while creating course',
      message: error.message,
    });
  }
};

// @desc    Get all courses (optional filter by category: ?category=id)
// @route   GET /api/courses
exports.getAllCourses = async (req, res) => {
  try {
    const filter = {};
    if (req.query && req.query.category) {
      filter.category = req.query.category;
    }

    const courses = await Course.find(filter)
      .populate('category', 'name description')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Server error while fetching courses',
      message: error.message,
    });
  }
};

// @desc    Get single course by ID
// @route   GET /api/courses/:id
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('category', 'name description');

    // Screenshot 5 Requirement: If MongoDB returns null, return res.status(404)
    if (!course) {
      return res.status(404).json({
        error: 'Course not found',
        message: 'Course not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        error: 'Course not found',
        message: 'Course not found',
      });
    }
    return res.status(500).json({
      error: 'Server error while fetching course',
      message: error.message,
    });
  }
};

// @desc    Update a course by ID
// @route   PUT /api/courses/:id
exports.updateCourse = async (req, res) => {
  try {
    const { title, description, price, category } = req.body || {};

    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(404).json({
          error: 'Referenced category not found',
          message: 'Referenced category not found',
        });
      }
    }

    const updatedData = {};
    if (title !== undefined) updatedData.title = title.trim();
    if (description !== undefined) updatedData.description = description;
    if (price !== undefined) updatedData.price = price;
    if (category !== undefined) updatedData.category = category;

    const course = await Course.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
      runValidators: true,
    }).populate('category', 'name description');

    if (!course) {
      return res.status(404).json({
        error: 'Course not found',
        message: 'Course not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: course,
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        error: 'Course not found',
        message: 'Course not found',
      });
    }
    return res.status(500).json({
      error: 'Server error while updating course',
      message: error.message,
    });
  }
};

// @desc    Delete a course by ID
// @route   DELETE /api/courses/:id
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      return res.status(404).json({
        error: 'Course not found',
        message: 'Course not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Course deleted successfully',
      data: course,
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        error: 'Course not found',
        message: 'Course not found',
      });
    }
    return res.status(500).json({
      error: 'Server error while deleting course',
      message: error.message,
    });
  }
};
