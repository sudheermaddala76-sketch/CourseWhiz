import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, FileText, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import DiagramCard from './diagram/DiagramCard';

const SummaryTab = ({ courseId, diagramItems, onRegenerateDiagram, onSimplifyDiagram, onRemoveDiagram, onToggleCollapseDiagram }) => {
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const generateSummary = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`https://coursewhiz-backend-xt2i.onrender.com/api/summary/${courseId}`);
            setSummary(response.data.summary);
        } catch (err) {
            console.error("Failed to generate summary", err);
            setError("Failed to generate summary. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!summary) {
            generateSummary();
        }
    }, [courseId]);


    const summaryDiagrams = diagramItems.filter((item) => item.anchorId === 'summary-root');

    return (
        <div className="p-6 text-white h-[600px] overflow-y-auto custom-scrollbar">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold flex items-center text-primary">
                        <FileText className="w-6 h-6 mr-3" />
                        Course Summary
                    </h2>
                    <button
                        onClick={generateSummary}
                        disabled={loading}
                        className="flex items-center px-4 py-2 bg-secondary border border-gray-700 hover:border-primary rounded-lg transition-all text-sm font-medium"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2 text-yellow-500" />}
                        Regenerate
                    </button>
                </div>

                {loading && !summary && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <Loader2 className="w-12 h-12 animate-spin mb-4 text-primary" />
                        <p>Generative AI is extracting key insights...</p>
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-red-900/20 border border-red-800 text-red-200 rounded-xl mb-6">
                        {error}
                    </div>
                )}

                {summary && (
                    <div className="prose prose-invert max-w-none">
                        <div
                            data-selection-context="true"
                            data-diagram-anchor-id="summary-root"
                            className="bg-secondary/50 p-8 rounded-2xl border border-gray-800 leading-relaxed text-gray-300"
                        >
                            <ReactMarkdown>{summary}</ReactMarkdown>
                            {summaryDiagrams.length > 0 && (
                                <div className="mt-6 space-y-2 w-full max-w-[650px] mx-auto">
                                    {summaryDiagrams.map((item) => (
                                        <DiagramCard
                                            key={item.id}
                                            item={item}
                                            onRegenerate={onRegenerateDiagram}
                                            onSimplify={onSimplifyDiagram}
                                            onRemove={onRemoveDiagram}
                                            onToggleCollapse={onToggleCollapseDiagram}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SummaryTab;
