import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Video, Paperclip, User, ShieldCheck, PhoneOff } from 'lucide-react';
import io from 'socket.io-client';
import api from '../utils/api';
import toast from 'react-hot-toast';

// Initialize Socket outside component to prevent multiple connections
const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5005');

const ChatBubble = ({ auth }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('internal'); // 'internal' or 'support'
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);

    // Determine Rooms
    // Determine Rooms
    const companyId = auth?.companyId?._id || auth?.companyId;
    // If no companyId (e.g. SuperAdmin), use a placeholder or handle specifically. 
    // For now, preventing 'undefined' string.
    const internalRoom = companyId ? `company_${companyId}` : null;
    const supportRoom = companyId ? `support_${companyId}` : null;

    useEffect(() => {
        if (!auth) return;

        socket.on('connect', () => setIsConnected(true));
        socket.on('disconnect', () => setIsConnected(false));

        // Join both rooms if they exist
        if (internalRoom) socket.emit('join_room', internalRoom);
        if (supportRoom) socket.emit('join_room', supportRoom);

        // Listen for messages
        socket.on('receive_message', (data) => {
            // Only add if it belongs to current active view or show notification
            // For now, simpler logic: just append if it matches current room context
            // In a real app, you'd handle notifications for the inactive tab
            if (
                (data.target === 'internal' && activeTab === 'internal') ||
                (data.target === 'support' && activeTab === 'support')
            ) {
                setMessages((prev) => [...prev, data]);
            }
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('receive_message');
        };
    }, [auth, activeTab, internalRoom, supportRoom]);

    // Fetch history on tab change or open
    useEffect(() => {
        if (isOpen && auth) {
            const fetchHistory = async () => {
                try {
                    const room = activeTab === 'internal' ? internalRoom : supportRoom;
                    if (!room) return; // Don't fetch if no room defined
                    const res = await api.get(`/chat/${room}`);
                    setMessages(res.data);
                } catch (error) {
                    console.error('Error fetching chat history:', error);
                }
            };
            fetchHistory();
        }
    }, [isOpen, activeTab, auth, internalRoom, supportRoom]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        if (!internalRoom && !supportRoom) {
            toast.error('No se puede enviar mensaje sin una sala activa.');
            return;
        }

        const messageData = {
            room: activeTab === 'internal' ? internalRoom : supportRoom,
            senderId: auth._id,
            senderName: auth.name,
            companyId: companyId, // Use the safe variable derived earlier
            target: activeTab,
            content: newMessage,
            type: 'text',
            createdAt: new Date().toISOString() // Optimistic update
        };

        // Emit to Socket
        socket.emit('send_message', messageData);

        // Optimistic UI Update
        setMessages((prev) => [...prev, messageData]);
        setNewMessage('');

        // Save to DB
        try {
            await api.post('/chat', messageData);
        } catch (error) {
            console.error('Error saving message:', error);
            toast.error('Error al enviar mensaje');
        }
    };

    const handleVideoCall = () => {
        const roomName = `synoptik-meet-${Math.random().toString(36).substring(7)}`;
        const meetUrl = `https://meet.jit.si/${roomName}`;

        const messageData = {
            room: activeTab === 'internal' ? internalRoom : supportRoom,
            senderId: auth._id,
            senderName: auth.name,
            companyId: companyId,
            target: activeTab,
            content: meetUrl, // Content is the URL
            type: 'video_call',
            callStatus: 'active',
            createdAt: new Date().toISOString()
        };

        socket.emit('send_message', messageData);
        setMessages((prev) => [...prev, messageData]);

        // Save to DB
        api.post('/chat', messageData).catch(err => console.error(err));

        // Open for self
        window.open(meetUrl, '_blank');
    };

    const handleEndCall = async (msgId) => {
        try {
            await api.put(`/chat/${msgId}`, { callStatus: 'ended' });

            // Optimistic Update
            setMessages(prev => prev.map(msg =>
                msg._id === msgId ? { ...msg, callStatus: 'ended' } : msg
            ));

            toast.success('Llamada finalizada');
        } catch (error) {
            console.error('Error ending call:', error);
            toast.error('Error al finalizar llamada');
        }
    };

    if (!auth) return null;

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 p-4 rounded-full shadow-2xl transition-all z-50 ${isOpen ? 'bg-slate-900 rotate-90' : 'bg-indigo-600 hover:scale-110 hover:bg-indigo-500'} text-white`}
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
            </button>

            {/* Chat Window */}
            <div className={`fixed bottom-24 right-6 w-96 max-w-[90vw] bg-white rounded-[2rem] shadow-2xl border border-slate-100 flex flex-col transition-all duration-300 transform origin-bottom-right z-50 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
                {/* Header */}
                <div className="p-6 bg-slate-900 rounded-t-[2rem] text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-rose-500'}`}></div>
                            <h3 className="font-black text-lg uppercase tracking-tight">Chat Corporativo</h3>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex p-1 bg-white/10 rounded-xl">
                        <button
                            onClick={() => setActiveTab('internal')}
                            className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'internal' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            Mi Equipo
                        </button>
                        <button
                            onClick={() => setActiveTab('support')}
                            className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${activeTab === 'support' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            <ShieldCheck size={14} /> Soporte
                        </button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="h-96 overflow-y-auto p-4 bg-slate-50 space-y-4">
                    {messages.map((msg, idx) => {
                        const isMe = msg.senderId === auth._id;
                        const isVideo = msg.type === 'video_call';

                        return (
                            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${isMe ? 'bg-slate-900 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'}`}>
                                    {!isMe && <p className="text-[10px] font-bold text-indigo-500 mb-1">{msg.senderName}</p>}

                                    {isVideo ? (
                                        <div className="space-y-3">
                                            {msg.callStatus === 'ended' ? (
                                                <div className="p-3 bg-slate-100 text-slate-500 rounded-xl font-bold text-center border border-slate-200 flex flex-col items-center gap-1">
                                                    <PhoneOff size={20} />
                                                    <span className="text-xs uppercase tracking-wider">Llamada Finalizada</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <p className="font-bold flex items-center gap-2">
                                                        <Video size={16} className="text-emerald-500" />
                                                        Video Llamada Iniciada
                                                    </p>
                                                    <a
                                                        href={msg.content}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="block w-full py-2 bg-emerald-500 text-white text-center rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-200"
                                                    >
                                                        Unirse Ahora
                                                    </a>
                                                    {isMe && ( // Only sender can end call for now
                                                        <button
                                                            onClick={() => handleEndCall(msg._id)}
                                                            className="block w-full py-2 bg-red-100 text-red-600 text-center rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-red-200 transition-all"
                                                        >
                                                            Terminar Llamada
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                    )}

                                    <span className={`text-[9px] block mt-2 font-bold ${isMe ? 'text-slate-400' : 'text-slate-300'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="p-4 bg-white rounded-b-[2rem] border-t border-slate-100 flex gap-2 items-center">
                    <button
                        type="button"
                        onClick={handleVideoCall}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        title="Iniciar Video Llamada"
                    >
                        <Video size={20} />
                    </button>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Escribe un mensaje..."
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:border-indigo-500 outline-none transition-all"
                    />
                    <button
                        type="submit"
                        className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!newMessage.trim()}
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </>
    );
};

export default ChatBubble;
