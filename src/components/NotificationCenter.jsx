import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import {
    Bell, X, Info, Clock, AlertTriangle, CheckCircle2,
    ChevronRight, Loader2, MailCheck
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const NotificationCenter = ({ auth }) => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    const unreadCount = notifications.filter(n => !n.readBy.includes(auth._id)).length;

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await api.get('/notifications');
            setNotifications(res.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            await api.put(`/api/notifications/${id}/read`);
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, readBy: [...n.readBy, auth._id] } : n)
            );
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const getTypeStyles = (type) => {
        switch (type) {
            case 'APPROVAL': return { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-400/10' };
            case 'PENDING': return { icon: Clock, color: 'text-rose-400', bg: 'bg-rose-400/10' };
            case 'ALERT': return { icon: Info, color: 'text-sky-400', bg: 'bg-sky-400/10' };
            default: return { icon: CheckCircle2, color: 'text-indigo-400', bg: 'bg-indigo-400/10' };
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Trigger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-3 rounded-2xl transition-all relative group shadow-xl ring-1 ring-white/5 ${isOpen ? 'bg-indigo-600 text-white shadow-indigo-600/40' : 'bg-slate-900/50 text-slate-400 hover:text-white hover:bg-white/[0.05]'
                    }`}
            >
                <Bell size={22} className={`${unreadCount > 0 ? 'animate-bounce' : ''}`} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 border-2 border-[#020617] text-[10px] font-black text-white rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-4 w-80 max-h-[500px] bg-[#0a0f1d] border border-white/10 rounded-3xl shadow-[0_40px_100px_-15px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-4 backdrop-blur-3xl z-50">
                    {/* Header */}
                    <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <div className="flex items-center gap-3">
                            <h3 className="font-black text-[11px] uppercase tracking-[0.2em] text-white">Ecosistema Notificaciones</h3>
                            {unreadCount > 0 && (
                                <span className="text-[9px] bg-indigo-600 px-2 py-0.5 rounded-full font-black text-white">{unreadCount} Pendientes</span>
                            )}
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                            <X size={16} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto sidebar-scrollbar p-3 space-y-2">
                        {loading && notifications.length === 0 ? (
                            <div className="py-10 flex flex-col items-center justify-center gap-3 text-slate-600">
                                <Loader2 className="animate-spin" size={24} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Sincronizando...</span>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="py-10 text-center space-y-2">
                                <MailCheck size={32} className="mx-auto text-slate-800" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-700">Sin notificaciones nuevas</p>
                            </div>
                        ) : (
                            notifications.map((notif) => {
                                const styles = getTypeStyles(notif.type);
                                const isRead = notif.readBy.includes(auth._id);
                                return (
                                    <div
                                        key={notif._id}
                                        onClick={() => !isRead && handleMarkAsRead(notif._id)}
                                        className={`p-4 rounded-2xl transition-all border group relative overflow-hidden ${isRead
                                            ? 'bg-transparent border-white/5 opacity-60'
                                            : 'bg-white/[0.03] border-white/10 hover:border-indigo-500/30 cursor-pointer shadow-lg'
                                            }`}
                                    >
                                        <div className="flex gap-4 relative z-10">
                                            <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${styles.bg}`}>
                                                <styles.icon size={18} className={styles.color} />
                                            </div>
                                            <div className="space-y-1 flex-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className={`text-[10px] font-black uppercase tracking-wider ${isRead ? 'text-slate-400' : 'text-white'}`}>
                                                        {notif.title}
                                                    </span>
                                                    {!isRead && <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>}
                                                </div>
                                                <p className={`text-[11px] leading-relaxed ${isRead ? 'text-slate-600' : 'text-slate-300'}`}>
                                                    {notif.message}
                                                </p>
                                                <div className="flex items-center justify-between pt-1">
                                                    <div className="flex items-center gap-1.5 text-slate-600 text-[8px] font-black uppercase tracking-tighter">
                                                        <Clock size={10} />
                                                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: es })}
                                                    </div>
                                                    {notif.projectId && (
                                                        <span className="text-[8px] text-indigo-400/50 font-black uppercase tracking-tighter truncate max-w-[80px]">
                                                            {notif.projectId.name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-white/5 bg-white/[0.01]">
                        <button className="w-full text-center text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 hover:text-indigo-400 transition-colors">
                            Ver historial completo
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
