const Course = require('../models/Course');
const { getPineconeClient } = require('../config/pinecone');
const { getEmbedding, generateContent } = require('../services/gemini');

const chatWithCourse = async (req, res) => {
    try {
        const { courseId, message } = req.body;

        if (!courseId || !message) {
            return res.status(400).json({ error: "courseId and message are required" });
        }

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ error: "Course not found" });

        const namespace = course.pineconeNamespace;

        // 1. Embed the query
        const queryEmbedding = await getEmbedding(message);

        // 2. Query Pinecone
        const pinecone = await getPineconeClient();
        if (!pinecone) return res.status(500).json({ error: "Vector DB unavailable" });

        const indexName = process.env.PINECONE_INDEX || 'coursewhiz';
        const index = pinecone.index(indexName);
        const queryResponse = await index.namespace(namespace).query({
            vector: queryEmbedding,
            topK: 3,
            includeMetadata: true
        });

        // 3. Construct Context
        const contexts = queryResponse.matches.map(match => match.metadata.text).join("\n\n");

        if (!contexts) {
            // Fallback if no context found (optional)
            return res.json({ answer: "I couldn't find relevant information in the course material." });
        }

        // 4. Generate Answer
        const prompt = `
        You are a helpful study assistant. Answer the user's question based ONLY on the following context from the course material.
        If the answer is not in the context, say "I cannot find the answer in the detailed course material."
        
        Context:
        ${contexts}
        
        Question: ${message}
        
        Answer:
        `;

        const answer = await generateContent(prompt);

        res.json({ answer });

    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

module.exports = { chatWithCourse };
