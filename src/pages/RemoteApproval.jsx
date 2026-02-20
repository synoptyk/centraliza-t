import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle2, XCircle, Loader2, ShieldCheck, Mail, Building2, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RemoteApproval = () => {
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('loading'); // Start in loading to fetch details
    const [message, setMessage] = useState('');
    const [note, setNote] = useState('');
    const [managerName, setManagerName] = useState('');
    const [applicant, setApplicant] = useState(null);
    const [error, setError] = useState(null);

    const id = searchParams.get('id');
    const token = searchParams.get('token');

    useEffect(() => {
        const fetchDetails = async () => {
            if (!id || !token) {
                setStatus('error');
                setMessage('Enlace incompleto: falta ID o Token.');
                return;
            }

            try {
                // Use relative path for API calls
                const response = await axios.get(`/api/applicants/${id}/remote-details?token=${token}`);
                setApplicant(response.data);
                setStatus('idle');
            } catch (err) {
                console.error('Fetch details error:', err);
                setStatus('error');
                setMessage(err.response?.data?.message || 'No se pudo cargar la información del postulante.');
            }
        };

        fetchDetails();
    }, [id, token]);

    const handleDecision = async (decision) => {
        if (!managerName) {
            alert('Por favor ingrese su nombre para registrar quién procesó la aprobación.');
            return;
        }

        setLoading(true);
        setStatus('loading');
        try {
            const response = await axios.post(`/api/applicants/${id}/remote-approval`, {
                token,
                decision,
                managerName,
                note
            });
            setStatus('success');
            setMessage(response.data.message);
        } catch (error) {
            setStatus('error');
            setMessage(error.response?.data?.message || 'Error al procesar la solicitud');
        } finally {
            setLoading(false);
        }
    };

    if (!id || !token) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
                <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 max-w-md">
                    <XCircle size={60} className="text-red-500 mx-auto mb-6" />
                    <h1 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Enlace Inválido</h1>
                    <p className="text-slate-500 mt-4 font-medium">Este enlace no contiene los parámetros de seguridad necesarios.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-6 overflow-hidden relative">
            {/* Background Accents */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600 rounded-full blur-[120px]"></div>
            </div>

            <div className="w-full max-w-2xl relative z-10">
                <AnimatePresence mode="wait">
                    {status === 'idle' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -20 }}
                            className="bg-white rounded-[4rem] p-10 md:p-16 text-slate-900 shadow-2xl shadow-indigo-500/10 border border-white/20 backdrop-blur-sm"
                        >
                            <div className="flex flex-col items-center text-center space-y-8">
                                <div className="w-20 h-20 rounded-3xl bg-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-200">
                                    <ShieldCheck size={40} className="text-white" />
                                </div>

                                <div>
                                    <h1 className="text-4xl font-black tracking-tighter uppercase italic text-slate-900">Validación Ejecutiva</h1>
                                    <p className="text-indigo-600 font-black text-[10px] uppercase tracking-[0.4em] mt-2 italic">Canal de Aprobación Centraliza-T</p>
                                </div>

                                {applicant && (
                                    <div className="w-full space-y-6">
                                        <div className="w-full bg-slate-50 p-8 rounded-[3rem] border-2 border-slate-100 flex flex-col md:flex-row items-center gap-6 text-left">
                                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                                <User className="text-indigo-600" size={32} />
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Postulante a Validar</p>
                                                <h3 className="text-xl font-bold text-slate-900">{applicant.name}</h3>
                                                <div className="flex items-center gap-3">
                                                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">{applicant.position}</span>
                                                    <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">{applicant.department || 'Operaciones'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Economic Proposal Section */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-slate-900 text-white p-6 rounded-[2.5rem] flex flex-col gap-1 items-center justify-center border border-white/10">
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Sueldo Líquido</p>
                                                <p className="text-2xl font-black italic tracking-tighter">${parseInt(applicant.salary || 0).toLocaleString('es-CL')}</p>
                                            </div>
                                            <div className="bg-indigo-50 border-2 border-indigo-100 p-6 rounded-[2.5rem] flex flex-col gap-1 items-center justify-center">
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Tipo Contrato</p>
                                                <p className="text-sm font-black text-indigo-900 uppercase">{applicant.contractType || 'Por definir'}</p>
                                            </div>
                                        </div>

                                        {applicant.bonuses && applicant.bonuses.length > 0 && (
                                            <div className="bg-emerald-50 border-2 border-emerald-100 p-6 rounded-[2.5rem] space-y-2">
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 text-center mb-2">Bonificaciones Adicionales</p>
                                                <div className="flex flex-wrap justify-center gap-2">
                                                    {applicant.bonuses.map((b, i) => (
                                                        <div key={i} className="bg-white px-4 py-2 rounded-xl border border-emerald-200 shadow-sm flex items-center gap-2">
                                                            <span className="text-[10px] font-bold text-slate-600 uppercase">{b.name}</span>
                                                            <span className="text-xs font-black text-emerald-600">${parseInt(b.amount || 0).toLocaleString('es-CL')}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="w-full space-y-6">
                                    <div className="space-y-4">
                                        <div className="relative group">
                                            <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                                            <input
                                                type="text"
                                                placeholder="Su Nombre Completo"
                                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl py-6 pl-16 pr-6 font-bold text-lg outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-inner"
                                                value={managerName}
                                                onChange={(e) => setManagerName(e.target.value)}
                                            />
                                        </div>

                                        <div className="relative group">
                                            <textarea
                                                placeholder="Observaciones adicionales (Opcional)"
                                                rows={3}
                                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl py-6 px-6 font-bold text-lg outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-inner resize-none"
                                                value={note}
                                                onChange={(e) => setNote(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                        <button
                                            onClick={() => handleDecision('Rechazado')}
                                            className="w-full py-6 bg-slate-100 text-slate-400 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-95"
                                        >
                                            Rechazar Candidato
                                        </button>
                                        <button
                                            onClick={() => handleDecision('Aprobado')}
                                            className="w-full py-6 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-slate-300 hover:bg-indigo-600 transition-all active:scale-95"
                                        >
                                            Confirmar Aprobación
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {status === 'loading' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center space-y-6"
                        >
                            <Loader2 size={80} className="animate-spin text-white mx-auto opacity-20" />
                            <p className="font-black uppercase tracking-[0.5em] text-[10px] text-indigo-400">Procesando Decisión...</p>
                        </motion.div>
                    )}

                    {status === 'success' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-[4rem] p-16 text-center text-slate-900 shadow-2xl"
                        >
                            <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-emerald-200">
                                <CheckCircle2 size={48} className="text-white" />
                            </div>
                            <h2 className="text-3xl font-black uppercase italic tracking-tight">{message}</h2>
                            <p className="text-slate-500 mt-4 font-bold">La plataforma ha sido actualizada correctamente. Ya puede cerrar esta ventana.</p>
                            <div className="mt-12 pt-12 border-t border-slate-100">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Centraliza-T Architecture</p>
                            </div>
                        </motion.div>
                    )}

                    {status === 'error' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-[4rem] p-16 text-center text-slate-900 shadow-2xl"
                        >
                            <div className="w-24 h-24 bg-rose-500 rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-rose-200">
                                <XCircle size={48} className="text-white" />
                            </div>
                            <h2 className="text-3xl font-black uppercase italic tracking-tight">ERROR</h2>
                            <p className="text-slate-500 mt-4 font-bold">{message}</p>
                            <button
                                onClick={() => setStatus('idle')}
                                className="mt-10 text-indigo-600 font-black text-xs uppercase tracking-widest underline decoration-2 underline-offset-8"
                            >
                                Intentar Nuevamente
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default RemoteApproval;
