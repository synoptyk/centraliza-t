import React, { useState } from 'react';
import api from '../../utils/api';
import { useNavigate, useParams } from 'react-router-dom';
import { Lock, Loader2, Building2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const ResetPasswordPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { resettoken } = useParams();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Las contraseñas no coinciden');
            return;
        }

        setLoading(true);
        try {
            await api.put(`/auth/resetpassword/${resettoken}`, { password });
            toast.success('Contraseña actualizada exitosamente');
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al restablecer contraseña');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-full flex items-center justify-center p-4 md:p-8 bg-[#020617] relative overflow-hidden font-sans">
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

                <h2 className="text-2xl font-black text-white tracking-tight uppercase italic mb-2">Nueva Contraseña</h2>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-10 max-w-[300px]">
                    Establece una nueva clave segura para tu cuenta.
                </p>

                <form onSubmit={handleSubmit} className="w-full space-y-6">
                    <div className="space-y-3 text-left">
                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em] ml-4">Nueva Clave</label>
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

                    <div className="space-y-3 text-left">
                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em] ml-4">Confirmar Clave</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-7 flex items-center pointer-events-none text-slate-500 group-focus-within:text-white transition-colors">
                                <Lock size={20} />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="block w-full pl-16 pr-16 py-5 bg-white/5 border-2 border-white/10 rounded-[30px] text-white placeholder-slate-700 focus:outline-none focus:ring-8 focus:ring-indigo-500/10 focus:border-indigo-500/40 transition-all text-base font-bold shadow-2xl"
                                placeholder="••••••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-slate-950 py-5 rounded-[30px] font-black text-[12px] uppercase tracking-[0.4em] hover:bg-gradient-to-r hover:from-white hover:to-indigo-50 hover:shadow-[0_20px_50px_-10px_rgba(99,102,241,0.5)] active:scale-95 transition-all flex items-center justify-center gap-4 shadow-2xl relative overflow-hidden group mt-4"
                    >
                        {loading ? (
                            <Loader2 size={24} className="animate-spin text-indigo-600" />
                        ) : (
                            <>
                                Actualizar Contraseña
                                <ArrowRight size={20} className="transition-transform group-hover:translate-x-2" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
