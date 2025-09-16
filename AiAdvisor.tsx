import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { analyzeCropImage } from '../services/geminiService';
import { getProactiveAlerts } from '../services/mockApiService';
import type { ChatMessage, CropHealthAnalysis, ProactiveAlert } from '../types';
import { Card } from './common/Card';
import { Bot, User, SendHorizontal, Paperclip, MessageSquare, AlertTriangle, Lightbulb, Package, Zap } from 'lucide-react';
import { Spinner } from './common/Spinner';

// Mock key handling for development as in geminiService.ts
if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. Using a placeholder for AI Chat.");
  process.env.API_KEY = "mock-api-key-for-development";
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

type Tab = 'chat' | 'insights';

const alertIconMap: Record<ProactiveAlert['type'], React.ReactNode> = {
    'Disease Risk': <Lightbulb className="text-yellow-500" />,
    'Weather Warning': <AlertTriangle className="text-red-500" />,
    'Low Stock': <Package className="text-orange-500" />,
    'Nutrient Deficiency': <Lightbulb className="text-purple-500" />,
    // FIX: Added missing 'System Anomaly' to the alertIconMap.
    'System Anomaly': <Zap className="text-blue-500" />,
};
const alertColorMap: Record<ProactiveAlert['severity'], string> = {
    'High': 'border-red-500',
    'Medium': 'border-yellow-500',
    'Low': 'border-blue-500',
};

export const AiAdvisor: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: 'initial-1', sender: 'ai', text: 'Hello! I am Agri-AI. How can I help you with your farm today? You can ask me about crop diseases, fertilization strategies, or upload an image for analysis.' }
    ]);
    const [userInput, setUserInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>('chat');
    const [alerts, setAlerts] = useState<ProactiveAlert[]>([]);
    const chatRef = useRef<Chat | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Initialize chat
        chatRef.current = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
            systemInstruction: "You are Agri-AI, an expert agricultural assistant. Provide concise, helpful, and accurate information to farmers. Format your responses clearly, using bullet points or numbered lists where appropriate. Be friendly and professional.",
          },
        });
        
        getProactiveAlerts().then(setAlerts);
    }, []);

    useEffect(() => {
        // Scroll to bottom
        chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages]);
    
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = (reader.result as string).split(',')[1];
            try {
                const analysis = await analyzeCropImage(base64String, file.type);
                const aiMessage: ChatMessage = {
                    id: Date.now().toString(),
                    sender: 'ai',
                    text: `Here is the analysis of the image you uploaded:`,
                    imageAnalysis: analysis
                };
                setMessages(prev => [...prev, aiMessage]);
            } catch (error) {
                console.error("Image analysis failed:", error);
                 const errorMessage: ChatMessage = { id: Date.now().toString(), sender: 'ai', text: 'Sorry, I was unable to analyze that image. Please try another one.' };
                 setMessages(prev => [...prev, errorMessage]);
            } finally {
                setLoading(false);
            }
        };
        reader.readAsDataURL(file);

        // Reset file input
        e.target.value = '';
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || loading) return;

        const userMessage: ChatMessage = { id: Date.now().toString(), sender: 'user', text: userInput };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = userInput;
        setUserInput('');
        setLoading(true);

        const aiMessageId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, { id: aiMessageId, sender: 'ai', text: '' }]);

        try {
            if (process.env.API_KEY === "mock-api-key-for-development") {
                const mockResponse = "This is a mocked streaming response for your question: '" + currentInput + "'.";
                let streamedText = "";
                const streamInterval = setInterval(() => {
                    if (streamedText.length < mockResponse.length) {
                        streamedText += mockResponse.substring(streamedText.length, streamedText.length + 3);
                        setMessages(prev => prev.map(msg => msg.id === aiMessageId ? { ...msg, text: streamedText } : msg));
                    } else {
                        clearInterval(streamInterval);
                        setLoading(false);
                    }
                }, 30);
                return;
            }
            
            const response = await chatRef.current?.sendMessageStream({ message: currentInput });
            if (!response) throw new Error("Failed to send message.");

            let fullText = "";
            for await (const chunk of response) {
                fullText += chunk.text;
                setMessages(prev => prev.map(msg => msg.id === aiMessageId ? { ...msg, text: fullText } : msg));
            }

        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => prev.map(msg => msg.id === aiMessageId ? { ...msg, text: 'Sorry, I encountered an error. Please try again.' } : msg));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full max-h-[calc(100vh-4rem)]">
            <h1 className="text-3xl font-bold text-on-surface mb-4">AI Advisor</h1>
             <div className="border-b border-gray-200 mb-4">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button onClick={() => setActiveTab('chat')} className={`flex items-center space-x-2 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'chat' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}><MessageSquare size={16}/><span>Live Chat</span></button>
                    <button onClick={() => setActiveTab('insights')} className={`flex items-center space-x-2 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'insights' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}><AlertTriangle size={16}/><span>Proactive Insights</span></button>
                </nav>
            </div>

            {activeTab === 'chat' ? (
                <Card className="flex-1 flex flex-col p-0">
                    <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg) => (
                            <ChatMessageBubble key={msg.id} message={msg} />
                        ))}
                        {loading && <LoadingBubble />}
                    </div>
                    <div className="border-t p-4 bg-surface">
                        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden"/>
                            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={loading} className="p-3 text-slate-500 hover:text-primary rounded-full hover:bg-slate-100 transition disabled:opacity-50" aria-label="Attach image">
                                <Paperclip size={20} />
                            </button>
                            <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="Ask Agri-AI anything..." className="flex-1 w-full py-2 px-4 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-primary" disabled={loading} />
                            <button type="submit" disabled={loading || !userInput.trim()} className="p-3 bg-primary text-white rounded-full hover:bg-primary-dark transition disabled:bg-slate-400 disabled:cursor-not-allowed" aria-label="Send message">
                                <SendHorizontal size={20} />
                            </button>
                        </form>
                    </div>
                </Card>
            ) : (
                <Card className="flex-1 overflow-y-auto p-4 space-y-4">
                    {alerts.map(alert => (
                         <div key={alert.id} className={`p-4 rounded-lg bg-slate-50 border-l-4 ${alertColorMap[alert.severity]}`}>
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 text-slate-500 mt-1">{alertIconMap[alert.type]}</div>
                                <div className="flex-1">
                                    <p className="font-bold text-on-surface">{alert.title}</p>
                                    <p className="text-sm text-slate-600 mt-1">{alert.message}</p>
                                    <p className="text-sm text-primary-dark font-semibold mt-2 bg-green-50 p-2 rounded-md">{alert.recommendation}</p>
                                </div>
                            </div>
                         </div>
                    ))}
                </Card>
            )}
        </div>
    );
};

const ChatMessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isUser = message.sender === 'user';
    return (
        <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-slate-200' : 'bg-primary/20'}`}>
                {isUser ? <User className="text-slate-600" size={20}/> : <Bot className="text-primary" size={20}/>}
            </div>
            <div className={`max-w-md lg:max-w-xl p-3 rounded-lg text-sm ${isUser ? 'bg-primary text-white' : 'bg-slate-100 text-on-surface'}`}>
                <div className="whitespace-pre-wrap">{message.text}</div>
                {message.imageAnalysis && <ImageAnalysisResult analysis={message.imageAnalysis} />}
            </div>
        </div>
    )
};

const ImageAnalysisResult: React.FC<{ analysis: CropHealthAnalysis }> = ({ analysis }) => (
    <div className="mt-2 pt-2 border-t border-slate-200">
        <p className="font-bold">Image Analysis Result:</p>
        <p><strong>Condition:</strong> {analysis.condition} (Confidence: {(analysis.confidence * 100).toFixed(0)}%)</p>
        <p className="text-xs italic mt-1">{analysis.description}</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
            {analysis.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
        </ul>
    </div>
);

const LoadingBubble = () => (
    <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center"><Bot className="text-primary" size={20} /></div>
        <div className="p-3 rounded-lg bg-slate-100 flex items-center space-x-2">
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
        </div>
    </div>
);