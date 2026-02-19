import React, { useState } from 'react';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import {
    Lock, Mail, Loader2, Building2, Eye, EyeOff,
    ClipboardList, Zap, BrainCircuit, Search,
    FileCheck, Users, ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage = ({ setAuth }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/auth/login', { email, password });
            if (rememberMe) {
                localStorage.setItem('centralizat_user', JSON.stringify(data));
            } else {
                sessionStorage.setItem('centralizat_user', JSON.stringify(data));
            }
            setAuth(data);
            toast.success(`Bienvenido a CENTRALIZA-T, ${data.name}`);
            if (data.role === 'Ceo_Centralizat') {
                navigate('/admin/command-center');
            } else {
                navigate('/');
            }
        } catch (error) {
            console.error('Login Error:', error);
            if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                toast.error('El servidor está despertando... Por favor intente nuevamente en 10 segundos.');
            } else if (!error.response) {
                toast.error('Error de conexión con el servidor. Verifique su internet.');
            } else {
                toast.error(error.response?.data?.message || 'Credenciales incorrectas');
            }
        } finally {
            setLoading(false);
        }
    };

    const platformFlow = [
        { name: 'Gestión Proyecto', icon: ClipboardList, color: 'text-blue-400', glow: 'shadow-blue-500/20' },
        { name: 'Publicación', icon: Zap, color: 'text-amber-400', glow: 'shadow-amber-500/20' },
        { name: 'Evaluación Cognitiva', icon: BrainCircuit, color: 'text-purple-400', glow: 'shadow-purple-500/20' },
        { name: 'Filtro Estratégico', icon: Search, color: 'text-indigo-400', glow: 'shadow-indigo-500/20' },
        { name: 'Aprobación Final', icon: FileCheck, color: 'text-emerald-400', glow: 'shadow-emerald-500/20' },
        { name: 'Contratación Élite', icon: Users, color: 'text-rose-400', glow: 'shadow-rose-500/20' }
    ];

    return (
        <div className="h-screen w-full flex items-center justify-center p-4 md:p-8 bg-[#020617] relative overflow-hidden font-sans">

            {/* AMBIENT BACKGROUND SYSTEM */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/assets/login-bg-vortex.png"
                    alt=""
                    className="absolute top-1/2 left-1/2 w-[160%] h-[160%] max-w-none object-cover opacity-40 animate-spin-slow pointer-events-none"
                    onError={(e) => e.target.style.display = 'none'}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/60 to-slate-950 backdrop-blur-[1px]"></div>
            </div>

            {/* MAIN CONTAINER (ACCESSIBILITY OPTIMIZED) */}
            <div className="relative z-10 w-full max-w-[1400px] h-full max-h-[850px] flex flex-col lg:flex-row glass-executive rounded-[50px] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.7)] overflow-hidden">

                {/* LEFT: THE DYNAMIC FLOW MAP */}
                <div className="hidden lg:flex lg:w-[58%] p-14 flex-col justify-between relative bg-slate-950/60 border-r border-white/5">

                    {/* Header Branding */}
                    <div className="flex items-center gap-6 relative z-20">
                        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-600 to-fuchsia-600 flex items-center justify-center shadow-2xl shadow-indigo-500/40 ring-2 ring-white/10">
                            <Building2 className="text-white" size={32} />
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-white text-3xl font-black tracking-[0.4em] uppercase italic leading-none">CENTRALIZA-T</h1>
                            <div className="space-y-1 mt-2">
                                <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-2">
                                    <span className="w-6 h-px bg-indigo-500/30"></span> Ecosistema Inteligente
                                </p>
                                <p className="text-white text-[9px] font-black uppercase tracking-[0.4em] flex items-center gap-2">
                                    <span className="w-6 h-px bg-white/30"></span> EL FLUJO CONECTADO DEL ÉXITO
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* DYNAMIC FLOW MAP */}
                    <div className="relative flex-1 flex flex-col justify-center px-10">
                        {/* Title removed to avoid saturation, moved some to branding */}

                        {/* FLOW GRID */}
                        <div className="grid grid-cols-3 gap-y-16 gap-x-8 relative">
                            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" style={{ zIndex: 0 }}>
                                <path d="M 120 40 L 300 40 L 480 40 M 480 40 L 480 180 L 120 180 M 120 180 L 120 320 L 480 320"
                                    fill="none" stroke="white" strokeWidth="2" strokeDasharray="10 5" className="animate-[move-bg_20s_linear_infinite]" />
                            </svg>

                            {platformFlow.map((step, i) => (
                                <div key={i} className="flex flex-col items-center gap-5 relative z-10 group">
                                    <div className={`w-24 h-24 rounded-[32px] bg-slate-900/90 border border-white/10 flex items-center justify-center shadow-2xl ${step.glow} group-hover:scale-110 group-hover:bg-white/5 group-hover:border-white/20 transition-all duration-500 relative`}>
                                        <step.icon size={40} className={`${step.color} transition-all duration-500 group-hover:rotate-[360deg]`} />
                                        <div className="absolute -top-2 -right-2 w-7 h-7 bg-indigo-600 rounded-full border-2 border-[#020617] flex items-center justify-center text-[10px] font-black text-white shadow-xl">
                                            {i + 1}
                                        </div>
                                    </div>
                                    <div className="text-center space-y-1">
                                        <p className="text-xs font-black text-white uppercase tracking-widest italic group-hover:text-vibrant transition-colors">{step.name}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="flex items-center justify-between pt-10 border-t border-white/5 opacity-40">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.5em]">SYSTEM ACCESS LEVEL: OMEGA</span>
                    </div>
                </div>

                {/* RIGHT: THE LOGIN COMMAND CENTER (ENLARGED INPUTS) */}
                <div className="flex-1 p-8 md:p-14 lg:p-20 flex flex-col justify-center items-center relative bg-white/[0.04]">

                    {/* Orbital Decoration */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                        <div className="w-[600px] h-[600px] rounded-full border-[100px] border-white animate-spin-slow"></div>
                    </div>

                    <div className="w-full max-w-[440px] space-y-14 relative z-10">
                        <div className="space-y-4 text-center lg:text-left">
                            <div className="flex items-center justify-center lg:justify-start gap-4">
                                <div className="h-px w-10 bg-indigo-500/50"></div>
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">OPERACIONES ÉLITE</span>
                            </div>
                            <h3 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase italic leading-tight">
                                ACCESO AL <span className="text-vibrant">NÚCLEO</span>
                            </h3>
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.3em] leading-relaxed">
                                Ingrese credenciales de seguridad.
                            </p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-10">
                            {/* Email - ENLARGED */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em] ml-4">Identificador Usuario</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-7 flex items-center pointer-events-none text-slate-500 group-focus-within:text-white transition-colors">
                                        <Mail size={20} />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-16 pr-8 py-5 bg-white/5 border-2 border-white/10 rounded-[30px] text-white placeholder-slate-700 focus:outline-none focus:ring-8 focus:ring-indigo-500/10 focus:border-indigo-500/40 transition-all text-base font-bold shadow-2xl"
                                        placeholder="ej: mando@centralizat.cl"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password - ENLARGED */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center ml-4 pr-4">
                                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em]">Clave de Seguridad</label>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-7 flex items-center pointer-events-none text-slate-500 group-focus-within:text-white transition-colors">
                                        <Lock size={20} />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-16 pr-16 py-5 bg-white/5 border-2 border-white/10 rounded-[30px] text-white placeholder-slate-700 focus:outline-none focus:ring-8 focus:ring-indigo-500/10 focus:border-indigo-500/40 transition-all text-base font-bold shadow-2xl"
                                        placeholder="••••••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-7 flex items-center text-slate-600 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between ml-4 mr-4">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${rememberMe ? 'bg-indigo-600 border-indigo-600' : 'border-slate-600 group-hover:border-slate-400'}`}>
                                        {rememberMe && <FileCheck size={14} className="text-white" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    <span className={`text-[11px] font-bold uppercase tracking-wider transition-colors ${rememberMe ? 'text-white' : 'text-slate-500 group-hover:text-slate-400'}`}>Recordarme</span>
                                </label>

                                <button
                                    type="button"
                                    onClick={() => navigate('/forgot-password')}
                                    className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] hover:text-vibrant transition-colors border-b border-transparent hover:border-vibrant input-highlight"
                                >
                                    ¿Olvidaste tu contraseña?
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-white text-slate-950 py-6 rounded-[30px] font-black text-[13px] uppercase tracking-[0.6em] hover:bg-gradient-to-r hover:from-white hover:to-indigo-50 hover:shadow-[0_40px_100px_-20px_rgba(99,102,241,0.5)] active:scale-95 transition-all flex items-center justify-center gap-5 h-[80px] shadow-2xl relative overflow-hidden group/btn"
                            >
                                {loading ? (
                                    <Loader2 size={28} className="animate-spin text-indigo-600" />
                                ) : (
                                    <>
                                        Validar Acceso
                                        <ArrowRight size={22} className="transition-transform group-hover:translate-x-3 duration-500" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
