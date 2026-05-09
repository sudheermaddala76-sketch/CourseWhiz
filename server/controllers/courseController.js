const mongoose = require('mongoose');
const Course = require('../models/Course');
const { getPineconeClient } = require('../config/pinecone');
const { getEmbedding } = require('../services/gemini');
const { splitText } = require('../utils/textSplitter');
const { v4: uuidv4 } = require('uuid');
const createCourse = async (req, res) => {
    try {
        const { title, description, content, pdfFilename, userId } = req.body;
        console.log(`[CreateCourse] Received title: ${title}, content length: ${content ? content.length : 0}, pdfFilename: ${pdfFilename}, userId: ${userId}`);

        if (!title || !content) {
            return res.status(400).json({ error: "Title and Content are required" });
        }
        
        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }

        // 1. Check DB Connection
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ error: "Database not connected. Please check server logs." });
        }

        // 2. Create Course in MongoDB
        // Generate a namespace ID for Pinecone
        const namespace = uuidv4();

        const newCourse = new Course({
            title,
            description,
            contentOriginal: content,
            pdfFilename,
            pineconeNamespace: namespace,
            userId
        });

        await newCourse.save();

        // 2. Process Content (Ingestion)
        // Background process usually, but doing inline for MVP simplicity (or use setImmediate)

        const processIngestion = async () => {
            try {
                console.log(`[Ingest] Starting ingestion for course ${newCourse._id}`);
                console.log(`[Ingest] Target Pinecone Namespace: ${namespace}`); // CRITICAL LOG

                const chunks = splitText(content);
                console.log(`[Ingest] Split content into ${chunks.length} chunks`);

                if (chunks.length === 0) {
                    console.warn("[Ingest] Warning: No chunks created from content. Skipping Pinecone.");
                    return;
                }

                const pinecone = await getPineconeClient();
                if (!pinecone) {
                    console.error("[Ingest] Error: Pinecone client not available");
                    return;
                }
                const indexName = process.env.PINECONE_INDEX || 'coursewhiz';
                console.log(`[Ingest] Using Pinecone Index: ${indexName}`);

                const index = pinecone.index(indexName);

                const vectors = [];
                for (let i = 0; i < chunks.length; i++) {
                    const chunk = chunks[i];
                    const embedding = await getEmbedding(chunk);

                    if (!embedding) {
                        console.error(`[Ingest] Failed to generate embedding for chunk ${i}`);
                        continue;
                    }

                    vectors.push({
                        id: `${newCourse._id}_${i}`,
                        values: embedding,
                        metadata: {
                            text: chunk,
                            courseId: newCourse._id.toString(),
                            chunkIndex: i
                        }
                    });
                }

                console.log(`[Ingest] Generated ${vectors.length} vectors. Starting upsert...`);

                // Pinecone batch upsert (limit is usually 100 or 2MB)
                const BATCH_SIZE = 50;
                for (let i = 0; i < vectors.length; i += BATCH_SIZE) {
                    const batch = vectors.slice(i, i + BATCH_SIZE);
                    console.log(`[Ingest] Upserting batch ${i / BATCH_SIZE + 1} (${batch.length} vectors) to namespace ${namespace}`);
                    await index.namespace(namespace).upsert(batch);
                }

                console.log(`[Ingest] SUCCESS: Ingestion complete for course ${newCourse._id} in namespace ${namespace}`);

            } catch (error) {
                console.error("[Ingest] CRITICAL FAILURE:", error);
                // Ideally update course status to 'failed'
            }
        };

        // Trigger ingestion asynchronously
        processIngestion();

        // 3. Update Global Index (Async)
        try {
            const pinecone = await getPineconeClient();
            if (pinecone) {
                const indexName = process.env.PINECONE_INDEX || 'coursewhiz';
                const index = pinecone.index(indexName);

                // Create a summary text for the course meta-index
                const metaText = `${title}: ${description || ''}`;
                const metaEmbedding = await getEmbedding(metaText);

                if (metaEmbedding) {
                    await index.namespace('global_course_index').upsert([{
                        id: newCourse._id.toString(),
                        values: metaEmbedding,
                        metadata: {
                            courseId: newCourse._id.toString(),
                            title: title,
                            description: description || ''
                        }
                    }]);
                    console.log(`[GlobalIndex] Added course ${newCourse._id} to global search index`);
                }
            }
        } catch (globalIndexError) {
            console.error("[GlobalIndex] Failed to update global index:", globalIndexError);
            // Non-critical failure for course creation, so we log and continue
        }

        res.status(201).json(newCourse);

    } catch (error) {
        console.error("Error creating course:", error);
        res.status(500).json({ error: error.message || "Server Error" });
    }
};

const searchCourses = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            // Fallback to get all courses if no query
            return getCourses(req, res);
        }

        const embedding = await getEmbedding(query);
        const pinecone = await getPineconeClient();
        if (!pinecone) return res.status(503).json({ error: "Search service unavailable" });

        const indexName = process.env.PINECONE_INDEX || 'coursewhiz';
        const index = pinecone.index(indexName);

        // Query Global Index
        const searchResults = await index.namespace('global_course_index').query({
            vector: embedding,
            topK: 10,
            includeMetadata: true
        });

        // Extract Course IDs
        const courseIds = searchResults.matches.map(match => match.metadata.courseId);

        if (courseIds.length === 0) return res.json([]);

        // Fetch full course objects from DB, preserving order (approximation)
        // Since Mongo doesn't preserve order of $in easily, we might just fetch and sort in code if order matters strictly by relevance.
        // For MVP, just fetching is fine.
        const filter = { _id: { $in: courseIds } };
        const { userId } = req.query;
        if (userId) filter.userId = userId;
        const courses = await Course.find(filter);

        // Re-order based on search result relevance
        const orderedCourses = courseIds.map(id => courses.find(c => c._id.toString() === id)).filter(Boolean);

        res.json(orderedCourses);

    } catch (error) {
        console.error("Search Error:", error);
        res.status(500).json({ error: "Search Failed" });
    }
};

const getCourses = async (req, res) => {
    try {
        const { userId } = req.query;
        
        if (!userId) {
            return res.status(400).json({ error: "User ID is required to fetch courses" });
        }

        const courses = await Course.find({ userId }).sort({ createdAt: -1 });
        res.json(courses);
    } catch (error) {
        console.error("Error fetching courses:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ error: "Course not found" });
        res.json(course);
    } catch (error) {
        console.error("Error fetching course:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Find Course
        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }

        // 2. Delete Vectors from Pinecone (if namespace exists)
        if (course.pineconeNamespace) {
            try {
                const pinecone = await getPineconeClient();
                if (pinecone) {
                    const indexName = process.env.PINECONE_INDEX || 'coursewhiz';
                    const index = pinecone.index(indexName);
                    // Delete all vectors in the namespace
                    await index.namespace(course.pineconeNamespace).deleteAll();
                    console.log(`Deleted Pinecone namespace: ${course.pineconeNamespace}`);
                }
            } catch (pineconeError) {
                console.error("Error deleting from Pinecone:", pineconeError);
                // Continue with DB deletion even if Pinecone fails (best effort)
            }
        }

        // 3. Delete from MongoDB
        await Course.findByIdAndDelete(id);

        // 4. Remove from Global Index
        try {
            const pinecone = await getPineconeClient();
            if (pinecone) {
                const indexName = process.env.PINECONE_INDEX || 'coursewhiz';
                const index = pinecone.index(indexName);
                await index.namespace('global_course_index').deleteOne(id);
                console.log(`[GlobalIndex] Removed course ${id} from global search index`);
            }
        } catch (globalIndexError) {
            console.error("[GlobalIndex] Failed to remove from global index:", globalIndexError);
        }

        res.json({ message: "Course deleted successfully" });

    } catch (error) {
        console.error("Error deleting course:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

module.exports = { createCourse, getCourses, getCourseById, deleteCourse, searchCourses };
