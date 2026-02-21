import React, { useState } from 'react';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import {
    Lock, Mail, Loader2, Building2, Eye, EyeOff,
    ClipboardList, Zap, BrainCircuit, Search,
    FileCheck, Users, ArrowRight, UserPlus,
    CreditCard
} from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';

const LoginPage = ({ setAuth }) => {
    const navigate = useNavigate();
    const [isRegistering, setIsRegistering] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Login State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Register State
    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regCompanyName, setRegCompanyName] = useState('');
    const [regRut, setRegRut] = useState('');

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
                navigate('/dashboard');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Credenciales incorrectas');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/auth/register-trial', {
                name: regName,
                email: regEmail,
                password: regPassword,
                companyName: regCompanyName,
                rut: regRut
            });

            // Auto login after registration
            sessionStorage.setItem('centralizat_user', JSON.stringify(data));
            setAuth(data);
            toast.success(`¡Felicidades! Tu cuenta Free Trial ha sido creada.`);
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error en el registro');
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
        <div className="min-h-screen w-full flex flex-col bg-[#020617] relative overflow-hidden font-sans">
            <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} light={false} />

            {/* AMBIENT BACKGROUND SYSTEM */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[100px]"></div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="relative z-10 flex-1 flex items-center justify-center p-6 md:p-12 mt-20">
                <div className="w-full max-w-[1300px] max-h-[850px] flex flex-col lg:flex-row glass-executive rounded-[40px] border border-white/10 shadow-2xl overflow-hidden">

                    {/* LEFT: INFORMATION PANEL */}
                    <div className="hidden lg:flex lg:w-[45%] p-14 flex-col justify-between bg-slate-950/40 border-r border-white/5">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                                <Zap size={14} className="text-indigo-400" />
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Digital Governance v5.0</span>
                            </div>
                            <h2 className="text-4xl font-black text-white leading-tight uppercase italic tracking-tighter">
                                {isRegistering ? 'Comienza tu Viaje Digital Gratis' : 'Acceso al Núcleo de Operaciones'}
                            </h2>
                            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                                {isRegistering
                                    ? 'Crea tu cuenta empresarial en segundos y experimenta el poder de la gestión centralizada sin costos iniciales.'
                                    : 'Ingrese sus credenciales de seguridad para gestionar sus proyectos y capital humano con precisión quirúrgica.'}
                            </p>
                        </div>

                        {/* FLOW MAP (Simplified for login) */}
                        <div className="grid grid-cols-2 gap-6 my-10">
                            {platformFlow.slice(0, 4).map((step, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-all">
                                    <div className={`p-3 rounded-xl bg-slate-900 border border-white/10 ${step.color}`}>
                                        <step.icon size={20} />
                                    </div>
                                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">{step.name}</span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-8 border-t border-white/10">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.5em]">SYSTEM ENCRYPTION: ACTIVE</p>
                        </div>
                    </div>

                    {/* RIGHT: FORMS AREA */}
                    <div className="flex-1 p-8 md:p-16 flex flex-col justify-center bg-slate-950/20">
                        <div className="w-full max-w-[420px] mx-auto space-y-10">

                            {/* Form Header */}
                            <div className="flex flex-col gap-2">
                                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                                    {isRegistering ? 'CREAR CUENTA TRIAL' : 'INICIAR SESIÓN'}
                                </h3>
                                <div className="h-1 w-20 bg-indigo-600 rounded-full"></div>
                            </div>

                            {/* Forms Toggle Area */}
                            <div className="min-h-[400px]">
                                {isRegistering ? (
                                    /* REGISTER FORM */
                                    <form onSubmit={handleRegister} className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest ml-4">Nombre Completo</label>
                                                <input
                                                    type="text"
                                                    value={regName}
                                                    onChange={(e) => setRegName(e.target.value)}
                                                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-xs font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/40"
                                                    placeholder="Ej: Mauro Rossi"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest ml-4">Email Corporativo</label>
                                                <input
                                                    type="email"
                                                    value={regEmail}
                                                    onChange={(e) => setRegEmail(e.target.value)}
                                                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-xs font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/40"
                                                    placeholder="ej: mando@empresa.cl"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest ml-4">Nombre Empresa</label>
                                                <input
                                                    type="text"
                                                    value={regCompanyName}
                                                    onChange={(e) => setRegCompanyName(e.target.value)}
                                                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-xs font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/40"
                                                    placeholder="Nombre Fantasía"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest ml-4">RUT Empresa</label>
                                                <input
                                                    type="text"
                                                    value={regRut}
                                                    onChange={(e) => setRegRut(e.target.value)}
                                                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-xs font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/40"
                                                    placeholder="77.666.555-4"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest ml-4">Contraseña Maestra</label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={regPassword}
                                                    onChange={(e) => setRegPassword(e.target.value)}
                                                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-xs font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/40"
                                                    placeholder="••••••••"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                                                >
                                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-white hover:text-slate-950 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/20"
                                        >
                                            {loading ? <Loader2 className="animate-spin" size={20} /> : <>Activar Free Trial <UserPlus size={18} /></>}
                                        </button>
                                    </form>
                                ) : (
                                    /* LOGIN FORM */
                                    <form onSubmit={handleLogin} className="space-y-8">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest ml-4">Identificador Usuario</label>
                                            <div className="relative">
                                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="w-full pl-16 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white text-xs font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/40"
                                                    placeholder="ej: mando@centralizat.cl"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center px-4">
                                                <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Contraseña Acceso</label>
                                                <button
                                                    type="button"
                                                    onClick={() => navigate('/forgot-password')}
                                                    className="text-[8px] font-black text-slate-500 uppercase tracking-widest hover:text-indigo-400"
                                                >
                                                    ¿Olvidaste tu clave?
                                                </button>
                                            </div>
                                            <div className="relative">
                                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="w-full pl-16 pr-16 py-5 bg-white/5 border border-white/10 rounded-2xl text-white text-xs font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/40"
                                                    placeholder="••••••••"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                                                >
                                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                </button>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-white text-slate-950 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.4em] hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-3 shadow-2xl"
                                        >
                                            {loading ? <Loader2 className="animate-spin" size={20} /> : <>Ingresar al Sistema <ArrowRight size={18} /></>}
                                        </button>
                                    </form>
                                )}
                            </div>

                            {/* Toggler */}
                            <div className="text-center pt-6">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">
                                    {isRegistering ? '¿Ya tienes una cuenta corporativa?' : '¿Quieres digitalizar tu operación?'}
                                </p>
                                <button
                                    onClick={() => setIsRegistering(!isRegistering)}
                                    className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] hover:text-white transition-colors flex items-center gap-2 mx-auto decoration-indigo-600/30 decoration-2 underline-offset-8 underline"
                                >
                                    {isRegistering ? 'VOLVER AL LOGIN' : 'PRUEBA NUESTRA VERSIÓN FREE TRIAL'}
                                    {isRegistering ? <ArrowRight size={14} /> : <Zap size={14} />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating decoration */}
            <div className="absolute top-20 right-20 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl"></div>
        </div>
    );
};

export default LoginPage;
