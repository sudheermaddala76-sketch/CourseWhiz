const { GoogleGenAI } = require('@google/genai');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const logFile = path.join(__dirname, 'gemini_debug_log.txt');
const log = (msg) => {
    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] ${msg}\n`;
    console.log(msg);
    fs.appendFileSync(logFile, line);
};

async function test() {
    log("Starting Gemini 2.5 Flash Debug...");

    if (!process.env.GEMINI_API_KEY) {
        log("ERROR: GEMINI_API_KEY missing");
        return;
    }

    try {
        const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        log("Client initialized. Attempting generateContent with gemini-2.5-flash...");

        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                role: 'user',
                parts: [{ text: "Hello, reply with 'Working'" }]
            }
        });

        log("GenerateContent response received.");
        if (response.text) {
            const text = typeof response.text === 'function' ? response.text() : response.text;
            log(`Response Text: ${text}`);
        } else {
            log("Response structure unexpected: " + JSON.stringify(response));
        }

    } catch (error) {
        log(`CRITICAL ERROR: ${error.message}`);
        if (error.response) {
            log(`Error Response: ${JSON.stringify(error.response)}`);
        }

        try {
            log("Attempting to list available models...");
            const models = await client.models.list();
            log("Available Models:");
            for await (const model of models) {
                log(`- ${model.name}`);
            }
        } catch (listError) {
            log(`Failed to list models: ${listError.message}`);
        }
    }
}

test();
