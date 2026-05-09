const Course = require('../models/Course');
const Chat = require('../models/Chat');
const { getPineconeClient } = require('../config/pinecone');
const { getEmbedding, generateContent, generateJSON } = require('../services/gemini');

const chatWithCourse = async (req, res) => {
    try {
        const { courseId, message, userId } = req.body;

        if (!courseId || !message || !userId) {
            return res.status(400).json({ error: "courseId, userId, and message are required" });
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

        const prompt = `
        You are a helpful study assistant. Answer the user's question based on the provided input.
        
        STRICT RULES:
        - Do NOT mix multiple topics together.
        - If the input contains multiple concepts, separate them clearly.
        - Each concept must be explained independently.
        - Do NOT combine unrelated topics under one heading.
        - Keep explanations simple and student-friendly.
        - Base your answer primarily on the provided INPUT. If the INPUT lacks details, you may use your general knowledge, but you MUST explicitly state which parts are not from the provided PDF.
        - Keep your entire answer concise, between 200 and 500 words. Do not exceed 500 words.
        - Use bold text (**text**) to highlight key terms within your explanations.
        - Use proper Markdown spacing and formatting exactly as shown below.

        OUTPUT FORMAT MUST MATCH EXACTLY:

        For each concept:

        ### Definition
        Write a clear and short definition. Highlight **key terms** in bold.

        ---

        ### Construction / Components (if applicable)
        Introductory sentence (e.g., "An incremental encoder mainly consists of:"):
        1. **Component Name**
           - Description.
        2. **Component Name**
           - Description.

        ---

        ### Working Principle (if applicable)
        - Step 1 description with **key terms** bolded.
        - Step 2 description with **key terms** bolded.

        ---

        ### Key Points
        - Important notes
        - Applications or advantages

        ---

        ### Source Notes
        - *Explicitly list which parts of your answer were found directly in the PDF and which parts (if any) you generated from your general knowledge.*

        IMPORTANT:
        - Identify different topics automatically.
        - If two topics are unrelated, create separate sections.
        - Do NOT include unnecessary paragraphs.
        - Rewrite content cleanly instead of copying.
        - give one line spacing between each section.

        INPUT:
        ${contexts}
        
        User's Question: ${message}
        
        Answer:
        `;

        const answer = await generateContent(prompt);

        // Save to Chat History
        let chat = await Chat.findOne({ courseId, userId });
        if (!chat) {
            chat = new Chat({ courseId, userId, messages: [] });
        }
        
        chat.messages.push({ role: 'user', text: message });
        chat.messages.push({ role: 'bot', text: answer });
        await chat.save();

        res.json({ answer });

    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

const getChatHistory = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { userId } = req.query;

        if (!courseId || !userId) {
            return res.status(400).json({ error: "courseId and userId are required" });
        }

        const chat = await Chat.findOne({ courseId, userId });
        if (!chat) {
            return res.json([]);
        }

        res.json(chat.messages);
    } catch (error) {
        console.error("Get Chat History Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

const clearChatHistory = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { userId } = req.query;

        if (!courseId || !userId) {
            return res.status(400).json({ error: "courseId and userId are required" });
        }

        await Chat.findOneAndDelete({ courseId, userId });
        res.json({ message: "Chat history cleared" });
    } catch (error) {
        console.error("Clear Chat History Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

const generateSelectedTextDiagrams = async (req, res) => {
    try {
        const { courseId, userId, selectedText } = req.body;

        if (!courseId || !userId || !selectedText) {
            return res.status(400).json({ error: "courseId, userId, and selectedText are required" });
        }

        const cleanedSelection = selectedText.trim();
        if (cleanedSelection.length < 20) {
            return res.status(400).json({ error: "Please select a longer text snippet" });
        }

        const prompt = `
        You are a study diagram assistant.
        Create concise Mermaid diagrams that explain the selected study text.

        Strict instructions:
        - Return valid JSON only.
        - JSON must be an object with key "diagrams".
        - "diagrams" must be an array with 1 to 3 items.
        - Each item must include:
          - "title" (string, max 60 chars)
          - "explanation" (string, 1-2 lines)
          - "mermaid" (string, valid Mermaid flowchart syntax)
        - Use only "flowchart TD" style diagrams.
        - Keep each diagram simple and readable.
        - Do not include markdown code fences.
        - Ensure Mermaid node labels are short.

        Selected text:
        ${cleanedSelection}
        `;

        const result = await generateJSON(prompt);
        const diagrams = Array.isArray(result?.diagrams) ? result.diagrams : [];

        const safeDiagrams = diagrams
            .filter((diagram) =>
                typeof diagram?.title === 'string' &&
                typeof diagram?.explanation === 'string' &&
                typeof diagram?.mermaid === 'string'
            )
            .slice(0, 3);

        if (safeDiagrams.length === 0) {
            return res.status(422).json({ error: "Could not generate diagrams from selected text" });
        }

        res.json({ diagrams: safeDiagrams });
    } catch (error) {
        console.error("Generate Diagrams Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

module.exports = { chatWithCourse, getChatHistory, clearChatHistory, generateSelectedTextDiagrams };
