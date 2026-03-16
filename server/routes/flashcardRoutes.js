const express = require('express');
const router = express.Router();
const { generateFlashcards } = require('../controllers/flashcardController');

router.post('/', generateFlashcards);

module.exports = router;
