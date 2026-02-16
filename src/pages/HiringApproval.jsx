import React, { useState, useEffect } from 'react';
import {
    FileCheck, User, Mail, Send, CheckCircle2, XCircle,
    Clock, Search, ExternalLink, ShieldCheck, DollarSign,
    ShoppingCart, CreditCard, Building2, UserCheck, Loader2
} from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import usePermissions from '../hooks/usePermissions';
import PageWrapper from '../components/PageWrapper';

const HiringApproval = ({ onOpenRECLUTANDO, auth, onLogout }) => {
    const [applicants, setApplicants] = useState([]);
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const [loading, setLoading] = useState(true);
    const { canUpdate } = usePermissions('contratacion');
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState({ managers: [] });
    const [selectedManager, setSelectedManager] = useState('');

    useEffect(() => {
        fetchAwaitingApproval();
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const res = await api.get('/config');
            setConfig(res.data);
            if (res.data.managers?.length > 0) {
                setSelectedManager(res.data.managers[0].name);
            }
        } catch (error) {
            console.error('Error fetching config');
        }
    };

    const fetchAwaitingApproval = async () => {
        setLoading(true);
        try {
            const res = await api.get('/applicants');
            const filtered = res.data.filter(app =>
                app.workerData?.validationStatus === 'Enviado para Aprobación' ||
                app.status === 'Contratado'
            );
            setApplicants(filtered);
        } catch (error) {
            toast.error('Error al cargar datos de aprobación');
        } finally {
            setLoading(false);
        }
    };

    const handleHiringDecision = async (status, reason = '') => {
        if (!selectedApplicant) return;
        if (!selectedManager && status === 'Aprobado') {
            toast.error('Seleccione un aprobador');
            return;
        }
        setSaving(true);
        try {
            const payload = {
                status: status === 'Aprobado' ? 'Contratado' : 'Rechazado',
                workerData: {
                    ...selectedApplicant.workerData,
                    validationStatus: status === 'Aprobado' ? 'Aprobado' : 'Rechazado'
                },
                hiring: {
                    ...selectedApplicant.hiring,
                    managerApproval: status,
                    approvedBy: selectedManager || 'Gerencia General',
                    managerNote: reason
                }
            };
            await api.put(`/applicants/${selectedApplicant._id}`, payload);
            toast.success(status === 'Aprobado' ? 'Contratación Finalizada con Éxito' : 'Postulante Desestimado');
            fetchAwaitingApproval();
            setSelectedApplicant(null);
        } catch (error) {
            toast.error('Error al procesar la decisión');
        } finally {
            setSaving(false);
        }
    };

    const Section = ({ title, icon: Icon, children }) => (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
                <Icon size={18} className="text-slate-400" />
                <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-500">{title}</h4>
            </div>
            {children}
        </div>
    );

    return (
        <PageWrapper
            className="space-y-8 animate-in fade-in duration-500"
            title="APROBACIÓN EJECUTIVA FINAL"
            subtitle="Revisión de gerencia para formalización de contrato"
            icon={FileCheck}
            auth={auth}
            onLogout={onLogout}
            headerActions={
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">Responsable Legal</span>
                    <select
                        value={selectedManager}
                        onChange={(e) => setSelectedManager(e.target.value)}
                        className="bg-transparent text-sm font-bold text-white outline-none cursor-pointer border-none focus:ring-0 [&>option]:text-slate-900"
                    >
                        {config.managers.map((m, i) => (
                            <option key={i} value={m.name}>{m.role}: {m.name}</option>
                        ))}
                    </select>
                </div>
            }
        >

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* List Sidebar */}
                <div className="lg:col-span-1 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden flex flex-col">
                    <div className="p-8 bg-slate-900 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Clock size={80} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Queue Status</span>
                            </div>
                            <h3 className="text-2xl font-black tracking-tight uppercase italic">{applicants.filter(a => a.status !== 'Contratado').length} Pendientes</h3>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                        {loading ? (
                            <div className="p-10 text-center flex flex-col items-center gap-3">
                                <div className="w-8 h-8 border-2 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sincronizando...</span>
                            </div>
                        ) : applicants.map(app => (
                            <div
                                key={app._id}
                                className={`w-full p-6 text-left transition-all hover:bg-slate-50 flex items-start justify-between group border-b border-slate-50 ${selectedApplicant?._id === app._id ? 'bg-indigo-50/50 border-r-4 border-indigo-600 shadow-inner' : ''}`}
                            >
                                <button
                                    onClick={() => setSelectedApplicant(app)}
                                    className="flex-1 min-w-0"
                                >
                                    <p className="font-black text-slate-900 text-sm uppercase truncate mb-1 group-hover:text-indigo-600 transition-colors tracking-tight">{app.fullName}</p>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter truncate">{app.position}</span>
                                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase ${app.status === 'Contratado' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                                {app.status}
                                            </span>
                                        </div>
                                        {app.hiring?.approvalToken && (
                                            <div className="flex items-center gap-1 text-[8px] font-black text-indigo-500 uppercase tracking-widest animate-pulse">
                                                <Mail size={8} /> Pendiente Remoto
                                            </div>
                                        )}
                                    </div>
                                </button>
                                <div className="flex gap-2 justify-end">
                                    {canUpdate && (
                                        <button
                                            onClick={() => handleUpdateStatus(app._id, 'Contratado')}
                                            className="px-4 py-2 bg-emerald-500 text-white text-xs font-bold rounded-xl hover:bg-emerald-600 transition-all shadow-md shadow-emerald-200 flex items-center gap-2"
                                        >
                                            <CheckCircle size={16} /> Contratar
                                        </button>
                                    )}
                                </div>
                                <button
                                    onClick={() => onOpenRECLUTANDO(app)}
                                    className="p-2 bg-white text-slate-300 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm opacity-0 group-hover:opacity-100 shrink-0"
                                >
                                    <ExternalLink size={14} />
                                </button>
                            </div>
                        ))}
                        {applicants.length === 0 && !loading && (
                            <div className="p-16 text-center">
                                <FileCheck size={40} className="mx-auto text-slate-100 mb-4" />
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-loose">No hay requerimientos en cola</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main View */}
                <div className="lg:col-span-3">
                    {selectedApplicant ? (
                        <div className="space-y-6">


                            {/* Rejection Modal */}
                            {saving && selectedManager === 'REJECTING' && (
                                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
                                    <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full animate-in zoom-in duration-300">
                                        <div className="text-center mb-6">
                                            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <XCircle size={32} />
                                            </div>
                                            <h3 className="text-xl font-black uppercase text-slate-800">Desestimar Candidato</h3>
                                            <p className="text-xs text-slate-400 font-bold mt-2">Esta acción finalizará el proceso de {selectedApplicant.fullName}.</p>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Motivo del Rechazo</label>
                                                <textarea
                                                    autoFocus
                                                    placeholder="Indique la razón principal (ej. Expectativa de renta, No cumple perfil técnico...)"
                                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-red-500 outline-none resize-none h-32"
                                                    id="rejectionReason"
                                                ></textarea>
                                            </div>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => { setSaving(false); setSelectedManager(config.managers[0]?.name || ''); }}
                                                    className="flex-1 py-3 bg-white text-slate-500 border border-slate-200 rounded-xl font-black text-xs uppercase hover:bg-slate-50 transition-all"
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const reason = document.getElementById('rejectionReason').value;
                                                        if (!reason) {
                                                            toast.error('Debe indicar un motivo');
                                                            return;
                                                        }
                                                        handleHiringDecision('Rechazado', reason);
                                                    }}
                                                    className="flex-1 py-3 bg-red-500 text-white rounded-xl font-black text-xs uppercase hover:bg-red-600 shadow-lg shadow-red-200 transition-all"
                                                >
                                                    Confirmar Rechazo
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Actions Header */}
                            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-8">
                                <div className="flex items-center gap-8">
                                    <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-3xl flex items-center justify-center text-3xl font-black">
                                        {selectedApplicant.fullName.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{selectedApplicant.fullName}</h3>
                                        <div className="flex items-center gap-4 mt-1">
                                            <span className="text-sm font-bold text-slate-400">{selectedApplicant.rut}</span>
                                            <span className="w-1.5 h-1.5 bg-slate-200 rounded-full"></span>
                                            <span className="text-sm font-bold text-indigo-600 uppercase tracking-widest">{selectedApplicant.position}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => { setSelectedManager('REJECTING'); setSaving(true); }}
                                        disabled={saving || selectedApplicant.status === 'Contratado'}
                                        className="px-8 py-3.5 bg-red-50 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest border border-red-100 hover:bg-red-100 transition-all disabled:opacity-30"
                                    >
                                        Rechazar
                                    </button>
                                    <button
                                        onClick={() => handleHiringDecision('Aprobado')}
                                        disabled={saving || selectedApplicant.status === 'Contratado'}
                                        className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all flex items-center gap-2 disabled:opacity-30"
                                    >
                                        {saving && selectedManager !== 'REJECTING' ? <Loader2 className="animate-spin" size={16} /> : <UserCheck size={18} />}
                                        Finalizar Contratación
                                    </button>
                                </div>
                            </div>

                            {/* Remote Approval Status Bar */}
                            {selectedApplicant.hiring?.approvalToken && (
                                <div className="bg-indigo-600 p-6 rounded-[2rem] text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg shadow-indigo-200">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                            <Mail className="animate-pulse" size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Seguimiento Remoto</p>
                                            <p className="text-sm font-bold">
                                                Enviado a {selectedApplicant.hiring.notifiedManagersCount || 0} gerentes el{' '}
                                                {selectedApplicant.hiring.notificationSentAt ? new Date(selectedApplicant.hiring.notificationSentAt).toLocaleString() : 'Recientemente'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const url = `${window.location.origin}/remote-approval?id=${selectedApplicant._id}&token=${selectedApplicant.hiring.approvalToken}`;
                                            navigator.clipboard.writeText(url);
                                            toast.success('Enlace de aprobación copiado al portapapeles');
                                        }}
                                        className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 transition-all flex items-center gap-2 shadow-sm"
                                    >
                                        <ExternalLink size={14} /> Copiar Enlace Directo
                                    </button>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Finance Details */}
                                <Section title="Remuneración y Banco" icon={CreditCard}>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-50 p-4 rounded-2xl">
                                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Sueldo Líquido</p>
                                            <p className="text-lg font-black text-slate-900">${parseInt(selectedApplicant.workerData?.financial?.liquidSalary || 0).toLocaleString()}</p>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-2xl">
                                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Banco</p>
                                            <p className="text-sm font-bold text-slate-700">{selectedApplicant.workerData?.financial?.bankData?.bank || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                                        <p className="text-[10px] font-black text-indigo-600 uppercase mb-1">Tipo de Cuenta</p>
                                        <p className="text-sm font-bold text-slate-800">{selectedApplicant.workerData?.financial?.bankData?.accountType || 'N/A'}</p>
                                        <p className="text-xs font-bold text-indigo-400 mt-0.5">N° {selectedApplicant.workerData?.financial?.bankData?.accountNumber || 'N/A'}</p>
                                    </div>
                                </Section>

                                {/* Logistics Details */}
                                <Section title="Equipamiento y Ropa" icon={ShoppingCart}>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { l: 'Polera', v: selectedApplicant.workerData?.logistics?.clothingSizes?.shirt },
                                            { l: 'Pantalón', v: selectedApplicant.workerData?.logistics?.clothingSizes?.pants },
                                            { l: 'Chaqueta', v: selectedApplicant.workerData?.logistics?.clothingSizes?.jacket },
                                            { l: 'Calzado', v: selectedApplicant.workerData?.logistics?.clothingSizes?.shoes },
                                        ].map((sz, i) => (
                                            <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">{sz.l}</span>
                                                <span className="text-xs font-black text-slate-800 underline decoration-indigo-500 decoration-2">{sz.v || '-'}</span>
                                            </div>
                                        ))}
                                    </div>
                                </Section>

                                {/* Prevision Details */}
                                <Section title="Previsión y Salud" icon={ShieldCheck}>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                                            <span className="text-[10px] font-black text-emerald-600 uppercase">AFP</span>
                                            <span className="text-sm font-black text-slate-800">{selectedApplicant.workerData?.prevision?.afp || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-purple-50 p-4 rounded-2xl border border-purple-100">
                                            <span className="text-[10px] font-black text-purple-600 uppercase">Salud</span>
                                            <span className="text-sm font-black text-slate-800">
                                                {selectedApplicant.workerData?.prevision?.healthSystem?.provider || 'Fonasa'}
                                                <span className="ml-2 opacity-50 font-medium">({selectedApplicant.workerData?.prevision?.healthSystem?.type})</span>
                                            </span>
                                        </div>
                                    </div>
                                </Section>

                                {/* Contract Details */}
                                <Section title="Vigencia" icon={Clock}>
                                    <div className="flex items-center gap-6">
                                        <div className="flex-1 p-4 bg-slate-900 rounded-2xl text-white">
                                            <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Inicio</p>
                                            <p className="text-sm font-bold">{selectedApplicant.workerData?.contract?.startDate ? new Date(selectedApplicant.workerData.contract.startDate).toLocaleDateString() : 'N/A'}</p>
                                        </div>
                                        <div className="flex-1 p-4 border border-slate-200 rounded-2xl">
                                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Tipo</p>
                                            <p className="text-sm font-bold text-slate-700">{selectedApplicant.workerData?.contract?.type || 'N/A'}</p>
                                        </div>
                                    </div>
                                </Section>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full min-h-[600px] flex flex-col items-center justify-center bg-white rounded-[3.5rem] border-2 border-dashed border-slate-100 text-slate-300">
                            <UserCheck size={80} className="mb-6 opacity-20" />
                            <h4 className="text-xl font-black uppercase tracking-tighter text-slate-500">Aprobaciones de Gerencia</h4>
                            <p className="text-sm font-bold text-slate-400">Seleccione un candidato para validar su ficha de colaborador.</p>
                        </div>
                    )}
                </div>
            </div>
        </PageWrapper >
    );
};

export default HiringApproval;
