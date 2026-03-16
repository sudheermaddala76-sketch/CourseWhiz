const mult = require('multer');
const { extractTextFromFile } = require('../services/gemini');
const pdf = require('pdf-parse');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Setup multer for disk storage
const storage = mult.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname.replace(/[^a-zA-Z0-9.]/g, '_'));
    }
});
const upload = mult({ storage: storage });

const ingestFile = async (req, res) => {
    try {
        console.log("Ingest request received");
        if (!req.file) {
            console.log("No file in request");
            return res.status(400).json({ error: "No file uploaded" });
        }
        console.log("File details:", req.file.originalname, req.file.mimetype, req.file.size);

        const { mimetype, path: filePath, filename } = req.file;
        let text = "";
        
        // Read file into buffer since pdf-parse and gemini expect a buffer
        const buffer = fs.readFileSync(filePath);

        if (mimetype === 'application/pdf') {
            try {
                const data = await pdf(buffer);
                text = data.text;

                // Check if PDF parse returned empty text (likely a scanned PDF)
                if (!text || text.trim().length < 50) { // arbitrary threshold for "empty"
                    console.log("PDF parsed locally but text is empty/too short. Likely scanned. Triggering fallback.");
                    throw new Error("Scanned PDF detected (low text content)");
                }

                console.log(`[Ingest] Extracted text from PDF. Length: ${text.length}`);
            } catch (pdfError) {
                console.warn("Local PDF parse failed, falling back to Gemini:", pdfError.message);
                try {
                    const geminiText = await extractTextFromFile(buffer, mimetype);
                    text = geminiText;
                    console.log(`[Ingest] Extracted text from PDF (Gemini). Length: ${text ? text.length : 0}`);
                } catch (geminiError) {
                    console.error("Gemini PDF extraction also failed:", geminiError);
                    return res.status(400).json({
                        error: "Failed to process PDF. Local parse error: " + pdfError.message + ". Remote parse error: " + geminiError.message
                    });
                }
            }
        } else if (mimetype.startsWith('image/')) {
            text = await extractTextFromFile(buffer, mimetype);
            console.log(`[Ingest] Extracted text from Image. Length: ${text ? text.length : 0}`);
        } else if (mimetype === 'text/plain') {
            text = buffer.toString('utf-8');
        } else {
            // Remove unsupported file
            fs.unlinkSync(filePath);
            return res.status(400).json({ error: "Unsupported file type" });
        }

        res.json({ text, filename });

    } catch (error) {
        console.error("Ingestion Error:", error);
        res.status(500).json({ error: error.message || "Failed to process file" });
    }
};

module.exports = { ingestFile, upload };
