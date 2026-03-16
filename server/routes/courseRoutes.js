const express = require('express');
const router = express.Router();
const { createCourse, getCourses, getCourseById, searchCourses } = require('../controllers/courseController');

router.post('/', createCourse);
router.get('/search', searchCourses);
router.get('/', getCourses);
router.get('/:id', getCourseById);
router.delete('/:id', require('../controllers/courseController').deleteCourse);

module.exports = router;
