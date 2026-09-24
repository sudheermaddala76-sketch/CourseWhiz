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

const executeWithRetryAndFallback = async (preferredModel, requestFn) => {
    const candidateModels = Array.from(new Set([
        preferredModel,
        "gemini-3.6-flash",
        "gemini-3-flash-preview"
    ])).filter(Boolean);

    let lastError = null;
    for (const model of candidateModels) {
        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                return await requestFn(model);
            } catch (err) {
                lastError = err;
                const msg = err.message || '';
                const isOverloaded = err.status === 503 || msg.includes('503') || msg.includes('high demand') || msg.includes('UNAVAILABLE');
                const isRateLimit = err.status === 429 || msg.includes('429');

                if (isOverloaded || isRateLimit) {
                    console.warn(`Model ${model} hit ${isOverloaded ? '503 (high demand)' : '429 (rate limit)'} on attempt ${attempt + 1}. Retrying...`);
                    await new Promise(r => setTimeout(r, 1200 * (attempt + 1)));
                    continue;
                }
                // Non-transient error for this model, try next candidate model
                break;
            }
        }
    }
    throw lastError;
};

const generateContent = async (prompt, modelName = "gemini-3.6-flash") => {
    try {
        const client = getGeminiClient();
        if (!client) throw new Error("Gemini Client not initialized");

        const response = await executeWithRetryAndFallback(modelName, (model) =>
            client.models.generateContent({
                model: model,
                contents: { role: 'user', parts: [{ text: prompt }] }
            })
        );

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

const generateJSON = async (prompt, modelName = "gemini-3.6-flash") => {
    try {
        const client = getGeminiClient();
        if (!client) throw new Error("Gemini Client not initialized");

        const response = await executeWithRetryAndFallback(modelName, (model) =>
            client.models.generateContent({
                model: model,
                contents: { role: 'user', parts: [{ text: prompt }] },
                config: {
                    responseMimeType: 'application/json'
                }
            })
        );

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

const extractTextFromFile = async (fileBuffer, mimeType, fileKind = 'auto') => {
    try {
        const client = getGeminiClient();
        if (!client) throw new Error("Gemini Client not initialized");

        const base64Data = fileBuffer.toString('base64');
        const kind = fileKind === 'pdf' ? 'pdf' : fileKind === 'image' ? 'image' : (mimeType || '').includes('pdf') ? 'pdf' : (mimeType || '').startsWith('image/') ? 'image' : 'file';

        const prompt = kind === 'pdf'
            ? "Extract all visible text from every page of this PDF in reading order. If the PDF is scanned or contains images, perform OCR and include the extracted text. Preserve headings, paragraphs, and page order. Return only the extracted text, with no extra commentary."
            : kind === 'image'
                ? "Extract all visible text from this image or scanned document. If text is embedded in graphics or scanned pages, read it carefully and return the extracted text in reading order. Return only the text, with no extra commentary."
                : "Extract all text from this file verbatim. If the file contains scanned or image-based content, read the text from the images as well. Return only the extracted text, with no extra commentary.";

        const response = await executeWithRetryAndFallback("gemini-3.6-flash", (model) =>
            client.models.generateContent({
                model: model,
                contents: {
                    parts: [
                        {
                            inlineData: {
                                mimeType: mimeType,
                                data: base64Data
                            }
                        },
                        {
                            text: prompt
                        }
                    ]
                }
            })
        );

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
