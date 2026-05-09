const express = require('express');
const router = express.Router();
const { chatWithCourse, getChatHistory, clearChatHistory, generateSelectedTextDiagrams } = require('../controllers/chatController');

router.post('/', chatWithCourse);
router.post('/diagram', generateSelectedTextDiagrams);
router.get('/:courseId', getChatHistory);
router.delete('/:courseId', clearChatHistory);

module.exports = router;
