const express = require('express');
const { ingestFile, upload } = require('./controllers/ingestController');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

const app = express();
app.post('/api/ingest', (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (err) return res.status(400).json({ error: err.message });
        next();
    });
}, ingestFile);

const server = app.listen(3002, async () => {
    try {
        fs.writeFileSync('test.txt', 'Hello world');
        const form = new FormData();
        form.append('file', fs.createReadStream('test.txt'));
        const res = await axios.post('http://localhost:3002/api/ingest', form, { headers: form.getHeaders() });
        fs.writeFileSync('out2.txt', 'SUCCESS: ' + JSON.stringify(res.data));
    } catch (e) {
        fs.writeFileSync('out2.txt', 'ERROR: ' + JSON.stringify(e.response ? e.response.data : e.message));
    } finally {
        server.close();
        process.exit(0);
    }
});
