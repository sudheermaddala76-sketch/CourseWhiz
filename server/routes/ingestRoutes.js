const express = require('express');
const router = express.Router();
const { ingestFile, upload } = require('../controllers/ingestController');

router.post('/', (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            console.error("Multer Error:", err);
            return res.status(400).json({ error: err.message });
        }
        next();
    });
}, ingestFile);

module.exports = router;
