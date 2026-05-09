const express = require('express');
const { generateDiagram } = require('../controllers/diagramController');

const router = express.Router();

router.post('/', generateDiagram);

module.exports = router;
