const Course = require('../models/Course');
const { generateJSON } = require('../services/gemini');

const generateFlashcards = async (req, res) => {
    try {
        const { courseId } = req.body;
        const course = await Course.findById(courseId).select('+contentOriginal');
        if (!course) return res.status(404).json({ error: "Course not found" });

        // Use full content
        const contentContext = course.contentOriginal;

        const prompt = `
        Create 5 flashcards from the following material.
        Focus on key terms, definitions, dates, or concepts.
        Return strictly valid JSON:
        [
            {
                "front": "Term or Question",
                "back": "Definition or Answer"
            }
        ]

        Material:
        ${contentContext}
        `;

        const flashcards = await generateJSON(prompt);
        res.json(flashcards);

    } catch (error) {
        console.error("Flashcard Error:", error);
        res.status(500).json({ error: "Failed to generate flashcards" });
    }
};

module.exports = { generateFlashcards };
