import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, User, Bot, Loader2 } from 'lucide-react';

const ChatTab = ({ courseId }) => {
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Hello! I am ready to help you study this material. Ask me anything!' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:3001/api/chat', {
                courseId,
                message: userMessage
            });

            setMessages(prev => [...prev, { role: 'bot', text: response.data.answer }]);
        } catch (error) {
            console.error("Chat Error", error);
            setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-secondary">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-primary ml-2 text-black' : 'bg-gray-700 mr-2 text-primary'}`}>
                                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                            </div>
                            <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                ? 'bg-primary text-black rounded-br-none font-medium'
                                : 'bg-background border border-gray-800 text-gray-200 rounded-bl-none shadow-sm'
                                }`}>
                                {msg.text}
                            </div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="flex max-w-[80%] flex-row">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-700 mr-2 flex items-center justify-center text-primary">
                                <Bot className="w-5 h-5" />
                            </div>
                            <div className="p-4 bg-background border border-gray-800 rounded-2xl rounded-bl-none shadow-sm">
                                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 bg-secondary border-t border-gray-800">
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a question about your notes..."
                        className="flex-1 px-4 py-3 bg-background border border-gray-800 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none text-white transition-colors"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="px-4 py-2 bg-primary hover:bg-cyan-400 disabled:opacity-50 text-black rounded-xl transition-colors flex items-center justify-center"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatTab;
