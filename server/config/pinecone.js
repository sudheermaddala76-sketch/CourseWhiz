const { Pinecone } = require('@pinecone-database/pinecone');
const dotenv = require('dotenv');

dotenv.config();

let pineconeInstance = null;

const getPineconeClient = async () => {
    if (pineconeInstance) {
        return pineconeInstance;
    }

    if (!process.env.PINECONE_API_KEY) {
        console.warn("PINECONE_API_KEY not found in .env");
        return null;
    }

    try {
        pineconeInstance = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY,
        });
        return pineconeInstance;
    } catch (error) {
        console.error("Error initializing Pinecone client:", error);
        return null;
    }
};

module.exports = { getPineconeClient };
