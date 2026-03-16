const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    contentOriginal: {
        type: String, // The full text content
        select: false // Don't return full text by default in lists
    },
    pdfFilename: {
        type: String, // The filename of the uploaded PDF
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    pineconeNamespace: {
        type: String,
        required: true,
        unique: true
    }
});

module.exports = mongoose.model('Course', CourseSchema);
