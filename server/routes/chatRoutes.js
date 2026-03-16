const express = require('express');
const router = express.Router();
const { chatWithCourse } = require('../controllers/chatController');

router.post('/', chatWithCourse);

module.exports = router;
