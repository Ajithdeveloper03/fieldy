import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Chatbot() {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I'm your Fieldy AI Assistant. How can I help you today?", sender: 'ai' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSend = (overrideText = null) => {
        const textToSend = typeof overrideText === 'string' ? overrideText : inputValue;
        if (!textToSend.trim()) return;

        const newUserMsg = { id: Date.now(), text: textToSend, sender: 'user' };
        setMessages(prev => [...prev, newUserMsg]);
        setInputValue('');
        setIsTyping(true);

        // Simulate AI response
        setTimeout(() => {
            const aiResponse = generateAIResponse(newUserMsg.text);
            setMessages(prev => [...prev, { id: Date.now() + 1, text: aiResponse.text, action: aiResponse.action, sender: 'ai' }]);
            setIsTyping(false);
        }, 1000);
    };

    const generateAIResponse = (input) => {
        const lowerInput = input.toLowerCase();
        if (lowerInput.includes('farmer') || lowerInput.includes('pending')) {
            return {
                text: "You have 12 pending farmers waiting for approval.",
                action: { label: "Go to Approvals", url: "/admin/pending-farmers" }
            };
        } else if (lowerInput.includes('task') || lowerInput.includes('schedule')) {
            return {
                text: "There are 5 tasks scheduled for today. Officer John Doe is assigned to Sector 4.",
                action: { label: "View Tasks", url: "/admin/tasks" }
            };
        } else if (lowerInput.includes('alert') || lowerInput.includes('emergency')) {
            return {
                text: "There are no active critical alerts at the moment. System is running optimally.",
                action: { label: "Check Alerts Monitor", url: "/admin/alerts" }
            };
        } else {
            return { text: "I can help you with checking pending farmers, daily tasks, or system alerts. What would you like to know?" };
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    const suggestions = [
        "Check pending farmers",
        "Today's tasks",
        "System alerts"
    ];

    return (
        <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="bg-white border border-gray-100 shadow-2xl rounded-2xl w-80 sm:w-96 mb-4 flex flex-col overflow-hidden transition-all duration-300 transform origin-bottom-right animate-in slide-in-from-bottom-5">
                    {/* Header */}
                    <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Fieldy AI</h3>
                                <p className="text-[10px] text-slate-300">{t('Always here to help')}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="text-slate-300 hover:text-white transition-colors p-1"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="p-4 h-80 overflow-y-auto bg-slate-50 flex flex-col space-y-3">
                        {messages.map((msg) => (
                            <div 
                                key={msg.id} 
                                className={`flex items-end space-x-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {msg.sender === 'ai' && (
                                    <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Bot className="w-4 h-4 text-slate-600" />
                                    </div>
                                )}
                                <div 
                                    className={`px-4 py-2 rounded-2xl text-sm max-w-[75%] ${
                                        msg.sender === 'user' 
                                        ? 'bg-slate-900 text-white rounded-br-sm' 
                                        : 'bg-white border border-gray-100 text-slate-800 shadow-sm rounded-bl-sm flex flex-col space-y-2'
                                    }`}
                                >
                                    <span>{msg.text}</span>
                                    {msg.action && (
                                        <a href={msg.action.url} className="inline-block mt-2 text-center text-xs bg-green-50 text-green-700 font-bold py-1.5 px-3 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
                                            {msg.action.label}
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex items-end space-x-2 justify-start">
                                <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Bot className="w-4 h-4 text-slate-600" />
                                </div>
                                <div className="px-4 py-3 rounded-2xl bg-white border border-gray-100 shadow-sm rounded-bl-sm">
                                    <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggestions Area */}
                    {!isTyping && (
                        <div className="px-3 py-2 bg-slate-50 flex gap-2 overflow-x-auto border-t border-gray-100 scrollbar-hide snap-x">
                            {suggestions.map((suggestion, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSend(suggestion)}
                                    className="snap-start whitespace-nowrap text-xs bg-white border border-green-200 text-green-700 hover:bg-green-50 px-3 py-1.5 rounded-full transition-colors flex-shrink-0 font-medium shadow-sm"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="p-3 bg-white border-t border-gray-100 flex items-center space-x-2">
                        <input 
                            type="text" 
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={t('Ask me anything...')}
                            className="flex-1 bg-slate-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all"
                        />
                        <button 
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isTyping}
                            className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Send className="w-4 h-4 ml-1" />
                        </button>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-xl shadow-slate-900/30 hover:bg-slate-800 hover:scale-105 transition-all duration-300"
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
            </button>
        </div>
    );
}
