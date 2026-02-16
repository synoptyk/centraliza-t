import React, { useState } from 'react';
import api from '../../utils/api';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Loader2, Building2, ArrowRight, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/forgotpassword', { email });
            setSent(true);
            toast.success('Correo de recuperación enviado');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al enviar correo');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-full flex items-center justify-center p-4 md:p-8 bg-[#020617] relative overflow-hidden font-sans">
            {/* AMBIENT BACKGROUND */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/assets/login-bg-vortex.png"
                    alt=""
                    className="absolute top-1/2 left-1/2 w-[160%] h-[160%] max-w-none object-cover opacity-30 animate-spin-slow pointer-events-none"
                    onError={(e) => e.target.style.display = 'none'}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/80 to-slate-950 backdrop-blur-[1px]"></div>
            </div>

            <div className="relative z-10 w-full max-w-[500px] p-10 glass-executive rounded-[40px] border border-white/10 shadow-[0_0_100px_rgba(99,102,241,0.1)] flex flex-col items-center text-center">

                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-600 to-fuchsia-600 flex items-center justify-center shadow-2xl shadow-indigo-500/40 ring-2 ring-white/10 mb-8">
                    <Building2 className="text-white" size={32} />
                </div>

                <h2 className="text-2xl font-black text-white tracking-tight uppercase italic mb-2">Recuperar Acceso</h2>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-10 max-w-[300px]">
                    Ingresa tu correo corporativo para recibir instrucciones.
                </p>

                {!sent ? (
                    <form onSubmit={handleSubmit} className="w-full space-y-8">
                        <div className="space-y-3 text-left">
                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em] ml-4">Correo Corporativo</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-7 flex items-center pointer-events-none text-slate-500 group-focus-within:text-white transition-colors">
                                    <Mail size={20} />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-16 pr-8 py-5 bg-white/5 border-2 border-white/10 rounded-[30px] text-white placeholder-slate-700 focus:outline-none focus:ring-8 focus:ring-indigo-500/10 focus:border-indigo-500/40 transition-all text-base font-bold shadow-2xl"
                                    placeholder="ej: usuario@centralizat.cl"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-slate-950 py-5 rounded-[30px] font-black text-[12px] uppercase tracking-[0.4em] hover:bg-gradient-to-r hover:from-white hover:to-indigo-50 hover:shadow-[0_20px_50px_-10px_rgba(99,102,241,0.5)] active:scale-95 transition-all flex items-center justify-center gap-4 shadow-2xl relative overflow-hidden group"
                        >
                            {loading ? (
                                <Loader2 size={24} className="animate-spin text-indigo-600" />
                            ) : (
                                <>
                                    Enviar Instrucciones
                                    <ArrowRight size={20} className="transition-transform group-hover:translate-x-2" />
                                </>
                            )}
                        </button>
                    </form>
                ) : (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[30px] p-8 w-full animate-in fade-in zoom-in duration-500">
                        <p className="text-emerald-400 font-bold text-sm mb-4">¡Correo Enviado!</p>
                        <p className="text-slate-400 text-xs leading-relaxed">
                            Revisa tu bandeja de entrada. Hemos enviado un enlace temporal para restablecer tu contraseña.
                        </p>
                    </div>
                )}

                <button
                    onClick={() => navigate('/login')}
                    className="mt-10 flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] hover:text-white transition-colors group"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    Volver al Inicio
                </button>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
