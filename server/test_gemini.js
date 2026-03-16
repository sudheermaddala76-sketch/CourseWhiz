
const { getEmbedding, generateContent } = require('./services/gemini');
const { GoogleGenAI } = require('@google/genai');
const dotenv = require('dotenv');

dotenv.config();

// Override the functions to inspect raw behavior if needed, or just use them
// detailed logging

async function test() {
    console.log("Testing Gemini Service with @google/genai...");

    if (!process.env.GEMINI_API_KEY) {
        console.error("GEMINI_API_KEY is missing!");
        return;
    }

    const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // 1. Test Embedding
    console.log("\n--- Testing Embedding ---");
    try {
        const response = await client.models.embedContent({
            model: 'text-embedding-004',
            contents: 'Hello world'
            // Simplified contents as per likely SDK capability
        });
        console.log("Embedding Response Keys:", Object.keys(response));
        if (response.embeddings) {
            console.log("response.embeddings found. Length:", response.embeddings.length);
            if (response.embeddings[0].values) {
                console.log("Values length:", response.embeddings[0].values.length);
            } else {
                console.log("No values in embedding[0]", JSON.stringify(response.embeddings[0]));
            }
        } else {
            console.log("No embeddings in response:", JSON.stringify(response, null, 2));
        }
    } catch (error) {
        console.error("Embedding Error:", error);
    }

    // 2. Test Generation
    console.log("\n--- Testing Generation ---");
    try {
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'Hello, are you working?'
        });

        console.log("Generation Response Keys:", Object.keys(response));
        console.log("response.text type:", typeof response.text);
        if (typeof response.text === 'string') {
            console.log("response.text content:", response.text);
        } else if (typeof response.text === 'function') {
            console.log("response.text() content:", response.text());
        }

        if (response.candidates) {
            console.log("Candidates found:", response.candidates.length);
        }

    } catch (error) {
        console.error("Generation Error:", error);
    }
}

test();
