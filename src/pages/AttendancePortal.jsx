import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Clock,
    MapPin,
    ShieldCheck,
    Zap,
    Coffee,
    LogOut,
    History,
    Loader2,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import API_URL from '../config/api';

const AttendancePortal = ({ auth }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState(null);
    const [history, setHistory] = useState([]);
    const [view, setView] = useState('dashboard'); // 'dashboard' or 'history'

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        fetchHistory();
        return () => clearInterval(timer);
    }, []);

    const fetchHistory = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/api/attendance/my-history`, {
                headers: { Authorization: `Bearer ${auth.token}` }
            });
            setHistory(data);
        } catch (err) {
            console.error('Error fetching history:', err);
        }
    };

    const handleMark = async (type) => {
        setLoading(true);

        // Request geolocation
        if (!navigator.geolocation) {
            toast.error('La geolocalización no es compatible con este navegador');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const coordinates = [position.coords.longitude, position.coords.latitude];
                setLocation(coordinates);

                try {
                    await axios.post(`${API_URL}/api/attendance/register`, {
                        type,
                        coordinates,
                        deviceInfo: {
                            platform: navigator.platform
                        }
                    }, {
                        headers: { Authorization: `Bearer ${auth.token}` }
                    });

                    toast.success(`Marca de ${type} registrada correctamente`);
                    fetchHistory();
                } catch (err) {
                    toast.error(err.response?.data?.message || 'Error al registrar marca');
                } finally {
                    setLoading(false);
                }
            },
            (err) => {
                toast.error('Error al obtener ubicación. Por favor activa el GPS.');
                setLoading(false);
            },
            { enableHighAccuracy: true }
        );
    };

    const buttonVariants = {
        hover: { scale: 1.02, transition: { duration: 0.2 } },
        tap: { scale: 0.98 }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-white p-6 font-sans relative overflow-hidden">
            {/* Background Aesthetics */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full -z-10"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full -z-10"></div>

            <div className="max-w-xl mx-auto space-y-8 pt-12">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em]">
                        <Zap size={14} /> Sistema de Control de Jornada
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter italic uppercase">
                        MARCAJE <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">CENTRALIZA-T</span>
                    </h1>
                </div>

                {/* Clock Card */}
                <div className="bg-white/5 backdrop-blur-xl rounded-[40px] border border-white/10 p-10 text-center shadow-2xl relative group">
                    <div className="absolute top-4 right-4 text-emerald-500/50 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                        <ShieldCheck size={14} /> Tiempo Real Protegido
                    </div>
                    <div className="text-6xl md:text-7xl font-black tracking-tight tabular-nums text-white group-hover:scale-105 transition-transform duration-700">
                        {currentTime.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                    <div className="text-slate-400 font-bold uppercase tracking-[0.2em] mt-2">
                        {currentTime.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </div>
                </div>

                {/* Main Actions */}
                <AnimatePresence mode="wait">
                    {view === 'dashboard' ? (
                        <motion.div
                            key="dashboard"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-2 gap-6"
                        >
                            {/* Entrada */}
                            <motion.button
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                                onClick={() => handleMark('Entrada')}
                                disabled={loading}
                                className="h-40 bg-gradient-to-br from-emerald-500/20 to-emerald-700/20 backdrop-blur-xl border-2 border-emerald-500/20 rounded-[32px] p-6 flex flex-col items-center justify-center gap-4 transition-all hover:border-emerald-500/50 group"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                                    {loading ? <Loader2 className="animate-spin" /> : <Clock size={32} />}
                                </div>
                                <span className="font-black uppercase tracking-widest text-xs">Entrada</span>
                            </motion.button>

                            {/* Salida */}
                            <motion.button
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                                onClick={() => handleMark('Salida')}
                                disabled={loading}
                                className="h-40 bg-gradient-to-br from-rose-500/20 to-rose-700/20 backdrop-blur-xl border-2 border-rose-500/20 rounded-[32px] p-6 flex flex-col items-center justify-center gap-4 transition-all hover:border-rose-500/50 group"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/20 group-hover:scale-110 transition-transform">
                                    {loading ? <Loader2 className="animate-spin" /> : <LogOut size={32} />}
                                </div>
                                <span className="font-black uppercase tracking-widest text-xs">Salida</span>
                            </motion.button>

                            {/* Colación Buttons */}
                            <motion.button
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                                onClick={() => handleMark('Inicio Colación')}
                                disabled={loading}
                                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[28px] p-4 flex items-center gap-4 transition-all hover:bg-white/10"
                            >
                                <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                                    <Coffee size={20} />
                                </div>
                                <span className="font-black uppercase tracking-widest text-[10px]">Ini. Colación</span>
                            </motion.button>

                            <motion.button
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                                onClick={() => handleMark('Fin Colación')}
                                disabled={loading}
                                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[28px] p-4 flex items-center gap-4 transition-all hover:bg-white/10"
                            >
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                                    <Zap size={20} />
                                </div>
                                <span className="font-black uppercase tracking-widest text-[10px]">Fin Colación</span>
                            </motion.button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="history"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white/5 backdrop-blur-xl rounded-[40px] border border-white/10 p-2 overflow-hidden"
                        >
                            <div className="max-h-[400px] overflow-y-auto px-6 py-6 space-y-4 custom-scrollbar">
                                {history.length > 0 ? history.map((mark, idx) => (
                                    <div key={mark._id || idx} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${mark.type === 'Entrada' ? 'bg-emerald-500/20 text-emerald-400' :
                                                    mark.type === 'Salida' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-500/20 text-slate-400'
                                                }`}>
                                                {mark.type === 'Entrada' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                                            </div>
                                            <div>
                                                <p className="font-black uppercase tracking-widest text-[10px]">{mark.type}</p>
                                                <p className="text-slate-400 text-[10px] font-medium">{new Date(mark.timestamp).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-500">{new Date(mark.timestamp).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-12 text-slate-500">
                                        <History size={48} className="mx-auto mb-4 opacity-20" />
                                        <p className="font-black uppercase tracking-widest text-xs">Sin registros recientes</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => setView('dashboard')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${view === 'dashboard' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-500 hover:text-white'}`}
                    >
                        <Zap size={14} /> Marcaje
                    </button>
                    <button
                        onClick={() => setView('history')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${view === 'history' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-500 hover:text-white'}`}
                    >
                        <History size={14} /> Historial
                    </button>
                </div>

                {/* Footer Disclaimer */}
                <div className="text-center space-y-2 opacity-30 pt-8">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em]">SISTEMA AUDITADO DT CHILE</p>
                    <div className="flex justify-center gap-4">
                        <span className="text-[8px] font-bold">GPS: ACTIVO</span>
                        <span className="text-[8px] font-bold">HASH: VERIFICADO</span>
                        <span className="text-[8px] font-bold">SSL: 256-BIT</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendancePortal;
