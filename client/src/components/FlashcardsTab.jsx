import React, { useState } from 'react';
import axios from 'axios';
import { Layers, RotateCw, Loader2, Play } from 'lucide-react';

const FlashcardsTab = ({ courseId }) => {
    const [cards, setCards] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    const generateCards = async () => {
        setLoading(true);
        setCards(null);
        setCurrentIndex(0);
        setIsFlipped(false);
        try {
            const response = await axios.post('http://localhost:3001/api/flashcards', { courseId });
            setCards(response.data);
        } catch (error) {
            console.error("Flashcard Gen Error", error);
            alert("Failed to generate flashcards");
        } finally {
            setLoading(false);
        }
    };

    const nextCard = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex(prev => (prev + 1) % cards.length);
        }, 150);
    };

    const prevCard = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex(prev => (prev - 1 + cards.length) % cards.length);
        }, 150);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
                <p className="text-gray-400">Extracting key concepts...</p>
            </div>
        );
    }

    if (!cards) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-secondary">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-6">
                    <Layers className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Master the details</h3>
                <p className="text-gray-400 mb-8 max-w-sm">
                    Generate flashcards to memorize definitions, dates, and formulas.
                </p>
                <button
                    onClick={generateCards}
                    className="flex items-center px-6 py-3 bg-primary hover:bg-cyan-400 text-black rounded-xl font-semibold transition-colors shadow-lg"
                >
                    <Play className="w-5 h-5 mr-2" />
                    Generate Flashcards
                </button>
            </div>
        );
    }

    const currentCard = cards[currentIndex];

    return (
        <div className="h-full flex flex-col items-center justify-center p-8 bg-secondary">
            <div className="w-full max-w-2xl">
                <div className="flex justify-between items-center mb-6 text-sm text-gray-400 cursor-default">
                    <span>Card {currentIndex + 1} of {cards.length}</span>
                    <button onClick={generateCards} className="flex items-center hover:text-primary transition-colors">
                        <RotateCw className="w-4 h-4 mr-1" /> Regenerate
                    </button>
                </div>

                {/* Card */}
                <div
                    className="group relative h-96 w-full perspective-1000 cursor-pointer"
                    onClick={() => setIsFlipped(!isFlipped)}
                >
                    <div className={`relative h-full w-full transition-all duration-500 transform-style-3d shadow-2xl rounded-2xl ${isFlipped ? 'rotate-y-180' : ''
                        }`}>
                        {/* Front */}
                        <div className="absolute inset-0 backface-hidden bg-background rounded-2xl p-8 flex flex-col items-center justify-center text-center border-2 border-gray-800 hover:border-primary/50 transition-colors">
                            <span className="text-xs uppercase tracking-wider text-gray-500 mb-6 font-semibold">Question / Term</span>
                            <h2 className="text-3xl font-bold text-white leading-tight">{currentCard.front}</h2>
                            <p className="absolute bottom-6 text-sm text-gray-500 animate-pulse">Click to flip</p>
                        </div>

                        {/* Back */}
                        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-primary text-black rounded-2xl p-8 flex flex-col items-center justify-center text-center border-2 border-primary">
                            <span className="text-xs uppercase tracking-wider text-cyan-900/60 mb-6 font-semibold">Answer / Definition</span>
                            <h2 className="text-2xl font-semibold leading-relaxed">{currentCard.back}</h2>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex justify-center items-center mt-10 space-x-6">
                    <button
                        onClick={prevCard}
                        className="px-6 py-2.5 bg-background border border-gray-800 text-white rounded-xl shadow-sm hover:bg-gray-800 transition-colors"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setIsFlipped(!isFlipped)}
                        className="px-6 py-2.5 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors"
                    >
                        {isFlipped ? "Show Question" : "Show Answer"}
                    </button>
                    <button
                        onClick={nextCard}
                        className="px-6 py-2.5 bg-background border border-gray-800 text-white rounded-xl shadow-sm hover:bg-gray-800 transition-colors"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FlashcardsTab;
