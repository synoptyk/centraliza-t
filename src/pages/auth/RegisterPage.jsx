import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Rocket, Shield, Mail, Smartphone, Building2, User, Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../config/api';
import { COUNTRIES, validateTaxId } from '../../utils/intlUtils';
import InternationalInput from '../../components/InternationalInput';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const planId = searchParams.get('plan');

    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState({
        nombreEmpresa: '',
        rutEmpresa: '',
        nombreUsuario: '',
        rutUsuario: '',
        email: '',
        celular: '',
        password: '',
        confirmPassword: '',
        country: 'CL'
    });

    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            return toast.error('Las contraseñas no coinciden');
        }

        if (!validateTaxId(formData.rutEmpresa, formData.country)) {
            const countryData = COUNTRIES.find(c => c.code === formData.country);
            return toast.error(`${countryData.taxIdName} de Empresa inválido`);
        }

        if (!validateTaxId(formData.rutUsuario, formData.country)) {
            const countryData = COUNTRIES.find(c => c.code === formData.country);
            return toast.error(`${countryData.taxIdName} de Administrador inválido`);
        }

        if (!validateEmail(formData.email)) {
            return toast.error('Correo electrónico inválido');
        }

        setLoading(true);
        try {
            const response = await api.post('/auth/register-trial', {
                ...formData,
                planId
            });

            if (response.data.success) {
                setIsSuccess(true);
                toast.success('Solicitud enviada con éxito');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al procesar el registro');
        } finally {
            setLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 font-sans">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-12 text-center"
                >
                    <div className="w-20 h-20 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-8">
                        <CheckCircle2 className="text-indigo-500" size={40} />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-tighter">¡Solicitud Recibida!</h2>
                    <p className="text-slate-400 leading-relaxed mb-10 text-sm">
                        Tu registro se ha procesado correctamente. Por seguridad, todas las altas requieren una **autorización manual** de nuestro equipo.
                        <br /><br />
                        Pronto recibirás un contacto de **Synoptyk** para activar tu ecosistema.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full py-5 bg-indigo-600 hover:bg-white hover:text-indigo-600 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-indigo-600/20"
                    >
                        Volver al Inicio
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-indigo-500/30">
            <div className="max-w-6xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-20 items-center">

                {/* Information Column */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-10"
                >
                    <div className="flex items-center gap-3 mb-10 cursor-pointer" onClick={() => navigate('/')}>
                        <ArrowLeft className="text-indigo-500" />
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Volver</span>
                    </div>

                    <div className="space-y-6">
                        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-600/30">
                            <Rocket className="text-white" size={32} />
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter leading-none uppercase">
                            Activa tu <span className="text-indigo-500">Ecosistema</span> Centraliza-T
                        </h1>
                        <p className="text-slate-400 text-lg leading-relaxed max-w-md">
                            Estás a un paso de profesionalizar tu gestión empresarial con tecnología de vanguardia.
                        </p>
                    </div>

                    <div className="space-y-8 py-10">
                        <div className="flex gap-6 items-start">
                            <div className="mt-1 p-3 bg-white/5 rounded-xl border border-white/10">
                                <Shield className="text-indigo-500" size={20} />
                            </div>
                            <div>
                                <h4 className="font-black uppercase text-xs tracking-widest text-white mb-2">Protocolo de Seguridad</h4>
                                <p className="text-slate-500 text-sm leading-relaxed">Verificamos manualmente cada identidad para garantizar un entorno blindado.</p>
                            </div>
                        </div>
                        <div className="flex gap-6 items-start">
                            <div className="mt-1 p-3 bg-white/5 rounded-xl border border-white/10">
                                <Building2 className="text-indigo-500" size={20} />
                            </div>
                            <div>
                                <h4 className="font-black uppercase text-xs tracking-widest text-white mb-2">Estructura Corporativa</h4>
                                <p className="text-slate-500 text-sm leading-relaxed">Centraliza múltiples empresas y proyectos bajo una misma inteligencia.</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Form Column */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-10 lg:p-14 shadow-2xl relative overflow-hidden"
                >
                    {/* Decorative Gradient */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 blur-[100px] -z-10" />

                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">País de Residencia</label>
                                <InternationalInput
                                    selectedCountry={formData.country}
                                    onCountryChange={(code) => setFormData({ ...formData, country: code })}
                                    value={COUNTRIES.find(c => c.code === formData.country).name}
                                    icon={Globe}
                                    onChange={() => { }} // Disabled as it's a dropdown
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <InternationalInput
                                    label={`${COUNTRIES.find(c => c.code === formData.country).taxIdName} Empresa`}
                                    name="rutEmpresa"
                                    value={formData.rutEmpresa}
                                    onChange={handleChange}
                                    selectedCountry={formData.country}
                                    icon={Building2}
                                />
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Razon Social</label>
                                    <div className="relative group">
                                        <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                        <input
                                            type="text"
                                            name="nombreEmpresa"
                                            placeholder="Empresa SpA"
                                            onChange={handleChange}
                                            className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-white font-medium"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                            <InternationalInput
                                label={`${COUNTRIES.find(c => c.code === formData.country).taxIdName} Administrador`}
                                name="rutUsuario"
                                value={formData.rutUsuario}
                                onChange={handleChange}
                                selectedCountry={formData.country}
                                icon={User}
                            />
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nombre Completo</label>
                                <div className="relative group">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                    <input
                                        type="text"
                                        name="nombreUsuario"
                                        placeholder="Juan Perez"
                                        onChange={handleChange}
                                        className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-white font-medium"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Corporativo</label>
                                <div className="relative group">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="contacto@empresa.com"
                                        onChange={handleChange}
                                        className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-white font-medium"
                                        required
                                    />
                                </div>
                            </div>
                            <InternationalInput
                                label="Celular contacto"
                                name="celular"
                                value={formData.celular}
                                onChange={handleChange}
                                selectedCountry={formData.country}
                                isPhone={true}
                                onCountryChange={(code) => setFormData({ ...formData, country: code })}
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Contraseña</label>
                                <div className="relative group">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="••••••••"
                                        onChange={handleChange}
                                        className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-white font-medium"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Confirmar</label>
                                <div className="relative group">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="••••••••"
                                        onChange={handleChange}
                                        className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-white font-medium"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-indigo-600 hover:bg-white hover:text-indigo-600 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-indigo-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-wait"
                        >
                            {loading ? 'Procesando Solicitud...' : 'Solicitar Alta de Cuenta'}
                        </button>

                        <p className="text-center text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                            Al solicitar el alta, aceptas nuestras políticas de seguridad y términos de uso.
                        </p>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default RegisterPage;
