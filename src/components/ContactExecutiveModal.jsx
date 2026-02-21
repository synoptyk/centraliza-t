import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, User, Mail, Phone, Send, Loader2, CheckCircle2, Globe } from 'lucide-react';
import { COUNTRIES, validateTaxId } from '../utils/intlUtils';
import InternationalInput from './InternationalInput';
import toast from 'react-hot-toast';
import api from '../utils/api';

const ContactExecutiveModal = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const [formData, setFormData] = useState({
        companyName: '',
        rutEmpresa: '',
        fullName: '',
        email: '',
        phone: '',
        country: 'CL'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateTaxId(formData.rutEmpresa, formData.country)) {
            const countryData = COUNTRIES.find(c => c.code === formData.country);
            return toast.error(`${countryData.taxIdName} inválido`);
        }

        setLoading(true);
        try {
            await api.post('/auth/contact-lead', formData);

            setSubmitted(true);
            toast.success('Solicitud enviada con éxito. Un ejecutivo te contactará pronto.');

            // Auto close after 3 seconds
            setTimeout(() => {
                onClose();
                setSubmitted(false);
                setFormData({ companyName: '', rutEmpresa: '', fullName: '', email: '', phone: '', country: 'CL' });
            }, 3000);

        } catch (error) {
            toast.error('Hubo un error al enviar la solicitud.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-[500px] bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-100"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition-colors"
                    >
                        <X size={24} />
                    </button>

                    <div className="p-10 md:p-14">
                        {!submitted ? (
                            <>
                                <div className="mb-10 text-center md:text-left">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-full mb-4">
                                        <Building2 size={12} className="text-indigo-600" />
                                        <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Atención Corporativa</span>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">Contactar Ejecutivo</h3>
                                    <p className="text-slate-500 text-sm mt-2">Completa los datos para agendar una sesión personalizada.</p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">País</label>
                                            <InternationalInput
                                                selectedCountry={formData.country}
                                                onCountryChange={(code) => setFormData({ ...formData, country: code })}
                                                value={COUNTRIES.find(c => c.code === formData.country).name}
                                                icon={Globe}
                                                onChange={() => { }}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Nombre Empresa</label>
                                            <div className="relative">
                                                <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 transition-all"
                                                    placeholder="Ej: InnovaTech SPA"
                                                    value={formData.companyName}
                                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InternationalInput
                                            label={COUNTRIES.find(c => c.code === formData.country).taxIdName}
                                            name="rutEmpresa"
                                            value={formData.rutEmpresa}
                                            onChange={(e) => setFormData({ ...formData, rutEmpresa: e.target.value })}
                                            selectedCountry={formData.country}
                                            icon={Building2}
                                        />
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Nombre y Apellido</label>
                                            <div className="relative">
                                                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 transition-all"
                                                    placeholder="Tu nombre completo"
                                                    value={formData.fullName}
                                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Email Corporativo</label>
                                            <div className="relative">
                                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                                <input
                                                    type="email"
                                                    required
                                                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 transition-all"
                                                    placeholder="mail@empresa.cl"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <InternationalInput
                                            label="Celular"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            selectedCountry={formData.country}
                                            isPhone={true}
                                            onCountryChange={(code) => setFormData({ ...formData, country: code })}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-[12px] uppercase tracking-[0.3em] hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 shadow-xl"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={20} /> : <>Enviar Solicitud <Send size={18} /></>}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="py-10 text-center space-y-6">
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto"
                                >
                                    <CheckCircle2 size={40} />
                                </motion.div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black text-slate-900 uppercase italic">¡Solicitud Registrada!</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">
                                        Hemos recibido tus datos. Un ejecutivo comercial de **Synoptyk** se pondrá en contacto contigo a la brevedad.
                                    </p>
                                </div>
                                <div className="pt-6">
                                    <button
                                        onClick={onClose}
                                        className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-slate-900 transition-colors"
                                    >
                                        Cerrar Ventana
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ContactExecutiveModal;
