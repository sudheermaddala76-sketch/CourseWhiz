const express = require('express');
const router = express.Router();
const { generateQuiz, gradeAnswer } = require('../controllers/quizController');

router.post('/generate', generateQuiz);
router.post('/grade', gradeAnswer);

module.exports = router;
