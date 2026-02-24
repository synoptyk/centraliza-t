import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Users,
    Building2,
    ArrowRight,
    Zap,
    ShieldCheck,
    Briefcase,
    ChevronRight,
    CircleDashed
} from 'lucide-react';
import API_URL from '../config/api';

const SelectionPortal = () => {
    const { companyId } = useParams();
    const navigate = useNavigate();
    const [companyName, setCompanyName] = useState('Nuestra Agencia');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCompany = async () => {
            if (!companyId || companyId === 'undefined' || companyId === 'null') {
                setError('ID de Agencia no válido');
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`${API_URL}/api/companies/${companyId}/public`);
                setCompanyName(response.data.name);
            } catch (err) {
                console.error('Error fetching company:', err);
                setError('No pudimos encontrar la agencia asociada a este link');
            } finally {
                setLoading(false);
            }
        };
        fetchCompany();
    }, [companyId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
                <CircleDashed className="text-indigo-500 animate-spin" size={48} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-6 text-center">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-rose-600/10 blur-[120px] rounded-full -z-10"></div>
                <div className="max-w-md w-full bg-white/5 backdrop-blur-xl rounded-[40px] border border-white/10 p-12">
                    <div className="w-20 h-20 bg-rose-500/20 rounded-[28px] flex items-center justify-center mx-auto mb-8 text-rose-400">
                        <Users size={40} />
                    </div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tight mb-4 text-white">Portal no disponible</h2>
                    <p className="text-slate-400 font-medium mb-8 leading-relaxed">
                        {error}. Por favor verifica el link o contacta a tu ejecutivo de cuenta.
                    </p>
                    <button
                        onClick={() => window.location.href = 'https://centralizat.cl'}
                        className="w-full py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                        Ir a Inicio
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f172a] text-white flex flex-col font-sans selection:bg-indigo-500/30 overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full -z-10"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full -z-10"></div>

            <div className="max-w-6xl mx-auto w-full px-6 flex-1 flex flex-col justify-center py-20">
                {/* Header */}
                <div className="text-center space-y-6 mb-16 animate-in fade-in slide-in-from-top-10 duration-1000">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em]">
                        <Zap size={14} /> Centro de Captación
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none italic uppercase">
                        BIENVENIDO A <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{companyName}</span>
                    </h1>
                    <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                        Selecciona tu perfil para continuar con el proceso de vinculación.
                    </p>
                </div>

                {/* Selection Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full">

                    {/* Candidate Card */}
                    <button
                        onClick={() => navigate(`/portal-profesional/${companyId}`)}
                        className="group relative bg-white/5 backdrop-blur-xl rounded-[40px] border-2 border-white/5 p-10 text-left transition-all duration-500 hover:border-indigo-500/50 hover:bg-white/[0.08] hover:-translate-y-2 hover:shadow-[0_40px_80px_-20px_rgba(79,70,229,0.3)] animate-in fade-in slide-in-from-left-20 duration-1000 delay-300"
                    >
                        <div className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center mb-8 shadow-xl shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-500">
                            <Users size={40} className="text-white" />
                        </div>
                        <h3 className="text-3xl font-black uppercase italic tracking-tight mb-4 group-hover:text-indigo-400 transition-colors">Soy Postulante</h3>
                        <p className="text-slate-400 font-medium leading-relaxed mb-8">
                            Regístrate en nuestra cartera profesional para acceder a las mejores vacantes y oportunidades laborales.
                        </p>
                        <div className="flex items-center gap-3 text-indigo-400 font-black text-xs uppercase tracking-widest">
                            Empezar Registro <ChevronRight size={16} className="group-hover:translate-x-2 transition-transform" />
                        </div>
                    </button>

                    {/* Company Card */}
                    <button
                        onClick={() => navigate(`/portal-empresarial/${companyId}`)}
                        className="group relative bg-white/5 backdrop-blur-xl rounded-[40px] border-2 border-white/5 p-10 text-left transition-all duration-500 hover:border-purple-500/50 hover:bg-white/[0.08] hover:-translate-y-2 hover:shadow-[0_40px_80px_-20px_rgba(168,85,247,0.3)] animate-in fade-in slide-in-from-right-20 duration-1000 delay-500"
                    >
                        <div className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center mb-8 shadow-xl shadow-purple-500/20 group-hover:scale-110 transition-transform duration-500">
                            <Building2 size={40} className="text-white" />
                        </div>
                        <h3 className="text-3xl font-black uppercase italic tracking-tight mb-4 group-hover:text-purple-400 transition-colors">Soy Empresa</h3>
                        <p className="text-slate-400 font-medium leading-relaxed mb-8">
                            Solicita la búsqueda de personal especializado para tus proyectos y optimiza tus procesos de contratación.
                        </p>
                        <div className="flex items-center gap-3 text-purple-400 font-black text-xs uppercase tracking-widest">
                            Solicitar Personal <ChevronRight size={16} className="group-hover:translate-x-2 transition-transform" />
                        </div>
                    </button>

                </div>

                {/* Trust Badges */}
                <div className="mt-24 flex flex-wrap justify-center gap-12 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={24} />
                        <span className="font-black text-[10px] uppercase tracking-widest">Seguridad Chile</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Briefcase size={24} />
                        <span className="font-black text-[10px] uppercase tracking-widest">Gestión de Talentos</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Zap size={24} />
                        <span className="font-black text-[10px] uppercase tracking-widest">Respuesta Inmediata</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="py-10 border-t border-white/5 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-600">
                    CENTRALIZA-T | ECOSYSTEM v5.0
                </p>
            </div>
        </div>
    );
};

export default SelectionPortal;
