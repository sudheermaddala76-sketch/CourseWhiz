import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, MessageSquare, CheckSquare, Layers, Loader2, FileText } from 'lucide-react';
import ChatTab from '../components/ChatTab';
import QuizTab from '../components/QuizTab';
import FlashcardsTab from '../components/FlashcardsTab';
import SummaryTab from '../components/SummaryTab';
import PdfViewerTab from '../components/PdfViewerTab';
import TextSelectionHandler from '../components/diagram/TextSelectionHandler';

const CourseDetails = () => {
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('study');
    const [diagramItems, setDiagramItems] = useState([]);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/api/courses/${id}`);
                setCourse(response.data);
            } catch (error) {
                console.error("Failed to fetch course", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    if (!course) {
        return <div className="text-center py-12">Course not found</div>;
    }

    const addOrUpdateDiagram = (diagramId, updates) => {
        setDiagramItems((prev) => prev.map((item) => (item.id === diagramId ? { ...item, ...updates } : item)));
    };

    const requestDiagram = async ({ text, action = 'generate', previousDiagram = null, existingId = null, anchorId }) => {
        const normalizedText = text.trim();
        const selectionKey = `${anchorId}-${normalizedText.toLowerCase()}`;

        const duplicate = diagramItems.find((item) => item.selectionKey === selectionKey);
        if (!existingId && duplicate) return;

        const diagramId = existingId || `diagram-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

        if (existingId) {
            addOrUpdateDiagram(diagramId, { loading: true, error: '' });
        } else {
            setDiagramItems((prev) => [
                ...prev,
                {
                    id: diagramId,
                    anchorId,
                    text: normalizedText,
                    selectionKey,
                    loading: true,
                    error: '',
                    collapsed: false,
                    diagram: null
                }
            ]);
        }

        try {
            const response = await axios.post('http://localhost:3001/api/generate-diagram', {
                text: normalizedText,
                action,
                previousDiagram
            });

            addOrUpdateDiagram(diagramId, {
                loading: false,
                error: '',
                collapsed: false,
                diagram: response.data?.diagram || null
            });
        } catch (error) {
            console.error('Generate Diagram Error:', error);
            addOrUpdateDiagram(diagramId, {
                loading: false,
                error: error.response?.data?.error || 'Could not generate diagram.',
                diagram: null
            });
        }
    };

    const handleGenerateFromSelection = async ({ text, anchorId }) => {
        await requestDiagram({ text, anchorId });
    };

    const handleRegenerate = async (diagramId) => {
        const current = diagramItems.find((item) => item.id === diagramId);
        if (!current) return;
        await requestDiagram({
            text: current.text,
            action: 'regenerate',
            previousDiagram: current.diagram,
            existingId: current.id,
            anchorId: current.anchorId
        });
    };

    const handleSimplify = async (diagramId) => {
        const current = diagramItems.find((item) => item.id === diagramId);
        if (!current) return;
        await requestDiagram({
            text: current.text,
            action: 'simplify',
            previousDiagram: current.diagram,
            existingId: current.id,
            anchorId: current.anchorId
        });
    };

    const handleRemoveDiagram = (diagramId) => {
        setDiagramItems((prev) => prev.filter((item) => item.id !== diagramId));
    };

    const handleToggleCollapse = (diagramId) => {
        setDiagramItems((prev) =>
            prev.map((item) =>
                item.id === diagramId ? { ...item, collapsed: !item.collapsed } : item
            )
        );
    };

    return (
        <div className="h-full flex flex-col">
            <div className="mb-8">
                <Link to="/" className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Dashboard
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">{course.title}</h1>
                        <p className="text-gray-400 mt-2 text-lg">{course.description}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 bg-secondary p-1 rounded-xl mb-6 w-fit border border-gray-800">
                <button
                    onClick={() => setActiveTab('study')}
                    className={`flex items-center px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'study'
                        ? 'bg-primary text-black shadow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }`}
                >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Chat & Study
                </button>
                <button
                    onClick={() => setActiveTab('quiz')}
                    className={`flex items-center px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'quiz'
                        ? 'bg-primary text-black shadow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }`}
                >
                    <CheckSquare className="w-4 h-4 mr-2" />
                    Quiz
                </button>
                <button
                    onClick={() => setActiveTab('flashcards')}
                    className={`flex items-center px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'flashcards'
                        ? 'bg-primary text-black shadow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }`}
                >
                    <Layers className="w-4 h-4 mr-2" />
                    Flashcards
                </button>
                <button
                    onClick={() => setActiveTab('summary')}
                    className={`flex items-center px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'summary'
                        ? 'bg-primary text-black shadow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }`}
                >
                    <FileText className="w-4 h-4 mr-2" />
                    Summary
                </button>
                <button
                    onClick={() => setActiveTab('pdf')}
                    className={`flex items-center px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'pdf'
                        ? 'bg-primary text-black shadow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }`}
                >
                    <FileText className="w-4 h-4 mr-2" />
                    View PDF
                </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 min-h-0 bg-secondary rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
                {activeTab === 'study' && (
                    <ChatTab
                        courseId={id}
                        diagramItems={diagramItems}
                        onRegenerateDiagram={handleRegenerate}
                        onSimplifyDiagram={handleSimplify}
                        onRemoveDiagram={handleRemoveDiagram}
                        onToggleCollapseDiagram={handleToggleCollapse}
                    />
                )}
                {activeTab === 'quiz' && <QuizTab courseId={id} />}
                {activeTab === 'flashcards' && <FlashcardsTab courseId={id} />}
                {activeTab === 'summary' && (
                    <SummaryTab
                        courseId={id}
                        diagramItems={diagramItems}
                        onRegenerateDiagram={handleRegenerate}
                        onSimplifyDiagram={handleSimplify}
                        onRemoveDiagram={handleRemoveDiagram}
                        onToggleCollapseDiagram={handleToggleCollapse}
                    />
                )}
                {activeTab === 'pdf' && (
                    <PdfViewerTab
                        pdfFilename={course.pdfFilename}
                        diagramItems={diagramItems}
                        onRegenerateDiagram={handleRegenerate}
                        onSimplifyDiagram={handleSimplify}
                        onRemoveDiagram={handleRemoveDiagram}
                        onToggleCollapseDiagram={handleToggleCollapse}
                    />
                )}
            </div>
            <TextSelectionHandler onGenerate={handleGenerateFromSelection} />
        </div>
    );
};

export default CourseDetails;
