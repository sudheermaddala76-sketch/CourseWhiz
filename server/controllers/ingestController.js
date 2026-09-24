const mult = require('multer');
const { extractTextFromFile } = require('../services/gemini');
const path = require('path');
const fs = require('fs');

const extractTextFromPDF = async (buffer) => {
    const { PDFParse } = require('pdf-parse');
    const parser = new PDFParse({ data: buffer });

    try {
        const result = await parser.getText();
        return result?.text || '';
    } finally {
        if (parser && typeof parser.destroy === 'function') {
            await parser.destroy();
        }
    }
};

const normalizeMimeType = (mimetype, fileName = '') => {
    const lowerName = (fileName || '').toLowerCase();

    if (mimetype && mimetype !== 'application/octet-stream') {
        return mimetype;
    }

    if (lowerName.endsWith('.pdf')) {
        return 'application/pdf';
    }

    if (lowerName.match(/\.(png|jpg|jpeg|gif|webp|bmp)$/)) {
        return `image/${lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg') ? 'jpeg' : lowerName.split('.').pop()}`;
    }

    return mimetype || 'application/octet-stream';
};

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

        const { mimetype, path: filePath, filename, originalname } = req.file;
        const normalizedMimeType = normalizeMimeType(mimetype, originalname);
        let text = "";

        // Read file into buffer since pdf-parse and gemini expect a buffer
        const buffer = fs.readFileSync(filePath);

        const isPdf = normalizedMimeType === 'application/pdf' || (originalname || '').toLowerCase().endsWith('.pdf');
        const isImage = normalizedMimeType.startsWith('image/');

        if (isPdf) {
            try {
                text = await extractTextFromPDF(buffer);

                if (!text || text.trim().length < 30) {
                    console.log("PDF parsed locally but text is empty/too short. Likely scanned or image-based. Triggering Gemini OCR fallback.");
                    throw new Error("Scanned PDF detected (low text content)");
                }

                console.log(`[Ingest] Extracted text from PDF. Length: ${text.length}`);
            } catch (pdfError) {
                console.warn("Local PDF parse failed, falling back to Gemini OCR:", pdfError.message);
                try {
                    const geminiText = await extractTextFromFile(buffer, normalizedMimeType, 'pdf');
                    text = geminiText;
                    console.log(`[Ingest] Extracted text from PDF (Gemini OCR). Length: ${text ? text.length : 0}`);
                } catch (geminiError) {
                    console.error("Gemini PDF extraction also failed:", geminiError);
                    return res.status(400).json({
                        error: "Failed to process PDF. Local parse error: " + pdfError.message + ". Remote parse error: " + geminiError.message
                    });
                }
            }
        } else if (isImage) {
            text = await extractTextFromFile(buffer, normalizedMimeType, 'image');
            console.log(`[Ingest] Extracted text from Image. Length: ${text ? text.length : 0}`);
        } else if (normalizedMimeType === 'text/plain') {
            text = buffer.toString('utf-8');
        } else {
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
