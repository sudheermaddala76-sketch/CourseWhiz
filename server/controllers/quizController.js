const Course = require('../models/Course');
const { getPineconeClient } = require('../config/pinecone');
const { generateJSON, generateContent, getEmbedding } = require('../services/gemini');

const generateQuiz = async (req, res) => {
    try {
        const { courseId } = req.body;
        const course = await Course.findById(courseId).select('+contentOriginal');
        if (!course) return res.status(404).json({ error: "Course not found" });

        // Use full content for better context
        const contentContext = course.contentOriginal;

        const prompt = `
        Based on the following study material, generate a quiz with 5 multiple choice questions.
        Return strictly valid JSON in the following format:
        [
            {
                "question": "Question text",
                "options": ["A", "B", "C", "D"],
                "correctAnswer": "The correct option text"
            }
        ]

        Material:
        ${contentContext}
        `;

        const quiz = await generateJSON(prompt);
        res.json(quiz);

    } catch (error) {
        console.error("Quiz Generation Error:", error);
        res.status(500).json({ error: "Failed to generate quiz" });
    }
};

const gradeAnswer = async (req, res) => {
    try {
        const { courseId, question, userAnswer } = req.body;
        // For grading, we might need context. 
        // If we don't store context with the question, we might need to RAG it again or use general validation against the course topically.
        // Let's generic RAG for the question to get context.

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ error: "Course not found" });

        // RAG for Context
        const embedding = await getEmbedding(question);
        const pinecone = await getPineconeClient();
        const indexName = process.env.PINECONE_INDEX || 'coursewhiz';
        const index = pinecone.index(indexName);
        const queryResponse = await index.namespace(course.pineconeNamespace).query({
            vector: embedding,
            topK: 2,
            includeMetadata: true
        });
        const context = queryResponse.matches.map(m => m.metadata.text).join("\n");

        const prompt = `
        Grade the student's answer based on the context provided.
        Assign a score from 0 to 10.
        Provide feedback explaining why it is correct or incorrect.

        Context:
        ${context}

        Question: ${question}
        Student Answer: ${userAnswer}

        Output JSON:
        {
            "score": 0,
            "feedback": "Feedback text"
        }
        `;

        const grading = await generateJSON(prompt);
        res.json(grading);

    } catch (error) {
        console.error("Grading Error:", error);
        res.status(500).json({ error: "Failed to grade answer" });
    }
};

module.exports = { generateQuiz, gradeAnswer };
