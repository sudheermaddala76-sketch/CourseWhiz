import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, Book, Trash2 } from 'lucide-react';

const Dashboard = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');

    const fetchCourses = useCallback(async (query = '') => {
        setLoading(true);
        try {
            const url = query.trim()
                ? `http://localhost:3001/api/courses/search?query=${encodeURIComponent(query)}`
                : 'http://localhost:3001/api/courses';

            const response = await axios.get(url);
            setCourses(response.data);
        } catch (error) {
            console.error("Failed to fetch courses", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCourses(searchQuery);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery, fetchCourses]);

    const handleDelete = async (e, courseId) => {
        e.preventDefault();
        e.stopPropagation();

        if (window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
            try {
                await axios.delete(`http://localhost:3001/api/courses/${courseId}`);
                setCourses(courses.filter(c => c._id !== courseId));
            } catch (error) {
                console.error("Failed to delete course", error);
                alert("Failed to delete course");
            }
        }
    };

    return (
        <div>
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">My Courses</h1>
                    <p className="text-gray-400">Continue learning or create a new course to get started</p>
                </div>
                <Link
                    to="/new"
                    className="inline-flex items-center px-6 py-3 bg-primary hover:bg-cyan-400 text-black font-semibold rounded-lg transition-all transform hover:scale-105 shadow-[0_0_15px_rgba(0,229,255,0.3)]"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Course
                </Link>
            </div>

            {/* Search Bar */}
            <div className="mb-10">
                <div className="relative max-w-xl">
                    <input
                        type="text"
                        placeholder="Search courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-secondary border border-gray-800 text-white px-4 py-3 pl-10 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    />
                    <svg className="w-5 h-5 text-gray-500 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-secondary rounded-2xl animate-pulse"></div>
                    ))}
                </div>
            ) : courses.length === 0 ? (
                <div className="text-center py-20 bg-secondary rounded-2xl border border-gray-800">
                    <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Book className="w-10 h-10 text-gray-600" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No courses yet</h3>
                    <p className="text-gray-400 mb-8">Create your first course to start studying with AI.</p>
                    <Link
                        to="/new"
                        className="text-primary hover:text-cyan-300 font-medium">
                        Create a course &rarr;
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map(course => (
                        <div key={course._id} className="group flex flex-col bg-secondary border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all hover:shadow-xl hover:-translate-y-1">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-colors">
                                    <Book className="w-6 h-6" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-gray-500 font-mono">
                                        {new Date(course.createdAt).toLocaleDateString()}
                                    </span>
                                    <button
                                        onClick={(e) => handleDelete(e, course._id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-gray-800"
                                        title="Delete Course"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{course.title}</h3>
                            <p className="text-gray-400 text-sm line-clamp-2 mb-6 flex-1">
                                {course.description || "No description provided."}
                            </p>

                            <Link
                                to={`/course/${course._id}`}
                                className="flex items-center justify-between text-sm font-medium text-white hover:text-primary transition-colors mt-auto pt-4 border-t border-gray-800"
                            >
                                Start Learning
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
