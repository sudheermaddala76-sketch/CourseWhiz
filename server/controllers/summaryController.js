const Course = require('../models/Course');
const { generateContent } = require('../services/gemini');

const getSummary = async (req, res) => {
    try {
        const { courseId } = req.params;
        const course = await Course.findById(courseId).select('+contentOriginal');

        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        const prompt = `
        You are an expert tutor. Create a comprehensive and structured summary of the following course content.
        Use bullet points and headers to make it easy to read.
        
        Course Title: ${course.title}
        
        Content:
        ${course.contentOriginal}
        `;

        const summary = await generateContent(prompt);
        res.json({ summary });

    } catch (error) {
        console.error("Error generating summary:", error);
        // Return explicit error to client for debugging
        res.status(500).json({ error: error.message || "Failed to generate summary" });
    }
};

module.exports = { getSummary };
