import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Save, ArrowLeft, Loader2, Upload } from 'lucide-react';

const NewCourse = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        content: '',
        pdfFilename: ''
    });
    const [loading, setLoading] = useState(false);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        console.log("File selected:", file);
        if (!file) return;

        setLoading(true);
        const data = new FormData();
        data.append('file', file);

        try {
            // Ingest file
            const response = await axios.post('https://coursewhiz-backend-xt2i.onrender.com/api/ingest', data);

            setFormData(prev => ({
                ...prev,
                content: prev.content + "\n\n" + response.data.text,
                pdfFilename: response.data.filename || prev.pdfFilename
            }));

        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload file: " + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const payload = {
                ...formData,
                userId: user?.id
            };
            await axios.post('https://coursewhiz-backend-xt2i.onrender.com/api/courses', payload);
            navigate('/');
        } catch (error) {
            console.error("Failed to create course", error);
            alert("Failed to create course: " + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <button onClick={() => navigate('/')} className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
            </button>

            <h1 className="text-3xl font-bold text-white mb-8">Create New Course</h1>

            <form onSubmit={handleSubmit} className="space-y-6 bg-secondary p-8 rounded-2xl border border-gray-800">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Course Title
                    </label>
                    <input
                        type="text"
                        required
                        className="w-full px-4 py-3 bg-background border border-gray-700 text-white rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors"
                        placeholder="e.g. History 101 - The French Revolution"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Description
                    </label>
                    <input
                        type="text"
                        className="w-full px-4 py-3 bg-background border border-gray-700 text-white rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors"
                        placeholder="Short description..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Study Material (Text Content)
                    </label>
                    <div className="text-xs text-gray-500 mb-2">
                        Paste your notes, article, or documentation here. The AI will learn from this.
                    </div>
                    <textarea
                        required
                        rows={12}
                        className="w-full px-4 py-3 bg-background border border-gray-700 text-white rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors font-mono text-sm leading-relaxed"
                        placeholder="Paste text content here..."
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    />
                </div>

                <div className="flex justify-end pt-4 space-x-4">
                    <div className="flex items-center">
                        <label className="cursor-pointer flex items-center px-4 py-3 bg-secondary border border-gray-700 hover:border-primary text-gray-300 rounded-xl transition-colors">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5 mr-2" />}
                            <span className="text-sm font-medium">Upload File (PDF/Img)</span>
                            <input
                                type="file"
                                className="hidden"
                                accept=".pdf,image/*,.txt"
                                onChange={handleFileChange}
                                disabled={loading}
                            />
                        </label>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center px-8 py-3 bg-primary hover:bg-cyan-400 text-black rounded-xl font-semibold transition-colors disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5 mr-2" />
                                Create Course
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NewCourse;
