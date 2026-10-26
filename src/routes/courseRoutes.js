const express = require('express');
const router = express.Router();
const {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} = require('../controllers/courseController');

// Routes mapped to /api/courses
router
  .route('/')
  .post(createCourse)
  .get(getAllCourses);

router
  .route('/:id')
  .get(getCourseById)
  .put(updateCourse)
  .patch(updateCourse)
  .delete(deleteCourse);

module.exports = router;

