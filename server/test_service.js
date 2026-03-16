
const { getEmbedding, generateContent } = require('./services/gemini');
const dotenv = require('dotenv');

dotenv.config();

async function test() {
    console.log("Testing Updated Gemini Service...");

    try {
        console.log("1. Testing Embedding...");
        const embedding = await getEmbedding("Hello world");
        console.log("Embedding success. Length:", embedding.length);
        if (embedding.length > 0) console.log("Embedding[0]:", embedding[0]);
    } catch (error) {
        console.error("Embedding Failed:", error);
    }

    try {
        console.log("2. Testing Generation...");
        const answer = await generateContent("What is the capital of France?");
        console.log("Generation success. Answer:", answer);
    } catch (error) {
        console.error("Generation Failed:", error);
    }
}

test();
