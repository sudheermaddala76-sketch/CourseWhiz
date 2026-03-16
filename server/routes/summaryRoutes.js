const express = require('express');
const router = express.Router();
const { getSummary } = require('../controllers/summaryController');

router.post('/:courseId', getSummary);

module.exports = router;
