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
        type: String,
        select: false
    },
    pdfFilename: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    pineconeNamespace: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

module.exports = mongoose.model('Course', CourseSchema);
