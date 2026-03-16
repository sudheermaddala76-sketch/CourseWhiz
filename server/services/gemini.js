const { GoogleGenAI } = require('@google/genai');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

let genAI = null;

const getGeminiClient = () => {
    if (genAI) return genAI;

    if (!process.env.GEMINI_API_KEY) {
        console.warn("GEMINI_API_KEY not found in .env");
        return null;
    }

    try {
        genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        return genAI;
    } catch (error) {
        console.error("Error initializing Gemini Client:", error);
        return null;
    }
};

const getEmbedding = async (text) => {
    try {
        const client = getGeminiClient();
        if (!client) throw new Error("Gemini Client not initialized");

        const response = await client.models.embedContent({
            model: 'gemini-embedding-001',
            contents: {
                parts: [{ text: text }]
            }
        });
        const embeddingValues =
            response.embeddings?.[0]?.values ||
            response.embedding?.values ||
            response.values;

        if (!embeddingValues) {
            console.error("Unexpected embedding response structure:", JSON.stringify(response, null, 2));
            throw new Error("Invalid embedding response");
        }

        return embeddingValues;
    } catch (error) {
        console.error("Error generating embedding:", error);
        throw error;
    }
};

const generateContent = async (prompt, modelName = "gemini-2.5-flash") => {
    try {
        const client = getGeminiClient();
        if (!client) throw new Error("Gemini Client not initialized");

        const response = await client.models.generateContent({
            model: modelName,
            contents: { role: 'user', parts: [{ text: prompt }] }
        });

        if (response.text) {
            return typeof response.text === 'function' ? response.text() : response.text;
        }

        const candidate = response.candidates?.[0];
        const part = candidate?.content?.parts?.[0];

        if (part?.text) return part.text;

        console.error("Unexpected content response:", JSON.stringify(response, null, 2));
        throw new Error("No content text generated");

    } catch (error) {
        console.error("Error generating content:", error);
        try {
            fs.appendFileSync(path.join(__dirname, '../server_error.log'), `[${new Date().toISOString()}] GenContent Error: ${error.message}\nResponse: ${JSON.stringify(error.response || {})}\n`);
        } catch (e) { console.error("Log failed", e); }
        throw error;
    }
};

const generateJSON = async (prompt, modelName = "gemini-2.5-flash") => {
    try {
        const client = getGeminiClient();
        if (!client) throw new Error("Gemini Client not initialized");

        const response = await client.models.generateContent({
            model: modelName,
            contents: { role: 'user', parts: [{ text: prompt }] },
            config: {
                responseMimeType: 'application/json'
            }
        });

        let text = "";
        if (response.text) {
            text = typeof response.text === 'function' ? response.text() : response.text;
        } else {
            text = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
        }

        text = text.replace(/```json\n?|\n?```/g, "").trim();

        try {
            return JSON.parse(text);
        } catch (parseError) {
            console.error("JSON Parse Error:", parseError);
            console.error("Failed JSON text:", text);
            throw new Error("Invalid JSON response from Gemini");
        }

    } catch (error) {
        console.error("Error generating JSON:", error);
        throw error;
    }
};

const extractTextFromFile = async (fileBuffer, mimeType) => {
    try {
        const client = getGeminiClient();
        if (!client) throw new Error("Gemini Client not initialized");

        const base64Data = fileBuffer.toString('base64');

        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: base64Data
                        }
                    },
                    {
                        text: "Extract all text from this file verbatim. Return only the text, no conversational filler."
                    }
                ]
            }
        });

        if (response.text) {
            return typeof response.text === 'function' ? response.text() : response.text;
        }
        return response.candidates?.[0]?.content?.parts?.[0]?.text || "";

    } catch (error) {
        console.error("Error extracting text from file:", error);
        throw error;
    }
};

module.exports = { getGeminiClient, getEmbedding, generateContent, generateJSON, extractTextFromFile };
