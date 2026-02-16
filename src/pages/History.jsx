import React, { useState, useEffect } from 'react';
import {
    History, Search, Filter, ArrowUpRight, CheckCircle2, XCircle,
    Clock, User, Users, FileText, Activity, ShieldCheck, Mail, Phone,
    X, ClipboardCheck, BookOpen, Eye, Calendar, UserCheck, Loader2
} from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import PageWrapper from '../components/PageWrapper';

const HistoryPage = ({ auth, onLogout }) => {
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('Todos');
    const [selectedApplicant, setSelectedApplicant] = useState(null);

    useEffect(() => {
        fetchApplicants();
    }, []);

    const fetchApplicants = async () => {
        setLoading(true);
        try {
            const res = await api.get('/applicants');
            setApplicants(res.data);
        } catch (error) {
            toast.error('Error al cargar historial');
        } finally {
            setLoading(false);
        }
    };

    const filteredApplicants = applicants.filter(app => {
        const matchesSearch = app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.rut.includes(searchTerm);

        if (filter === 'Todos') return matchesSearch;
        if (filter === 'Aprobados') return matchesSearch && app.status === 'Contratado';
        if (filter === 'No Aprobados') return matchesSearch && app.status === 'Rechazado';
        if (filter === 'En Proceso') return matchesSearch && !['Contratado', 'Rechazado'].includes(app.status);
        return matchesSearch;
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Contratado': return 'bg-emerald-100 text-emerald-600';
            case 'Rechazado': return 'bg-red-100 text-red-600';
            default: return 'bg-indigo-100 text-indigo-600';
        }
    };

    const FullAuditModal = ({ applicant, onClose }) => {
        if (!applicant) return null;

        const Section = ({ title, icon: Icon, children }) => (
            <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
                    <Icon size={18} className="text-slate-400" />
                    <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">{title}</h4>
                </div>
                {children}
            </div>
        );

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="p-8 bg-slate-900 text-white flex justify-between items-start">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-3xl bg-emerald-500 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-emerald-500/20">
                                {applicant.fullName.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-3xl font-black tracking-tighter uppercase">{applicant.fullName}</h3>
                                <div className="flex items-center gap-3 mt-1 text-slate-400 font-bold text-sm uppercase tracking-widest">
                                    <span>{applicant.rut}</span>
                                    <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                                    <span>{applicant.position}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${getStatusStyle(applicant.status)} bg-opacity-20`}>{applicant.status}</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                            {/* Personal & Interview */}
                            <div className="space-y-8">
                                <Section title="Información de Contacto" icon={Mail}>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><p className="text-[10px] font-black text-slate-400 uppercase">Email</p><p className="font-bold text-slate-800">{applicant.email}</p></div>
                                        <div><p className="text-[10px] font-black text-slate-400 uppercase">Teléfono</p><p className="font-bold text-slate-800">{applicant.phone}</p></div>
                                    </div>
                                </Section>

                                <Section title="Hito 1: Entrevista" icon={Calendar}>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center bg-white p-3 rounded-2xl border border-slate-100">
                                            <span className="text-xs font-bold text-slate-500">Resultado</span>
                                            <span className={`text-xs font-black uppercase px-3 py-1 rounded-full ${applicant.interview?.result === 'OK' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                                {applicant.interview?.result || 'Pendiente'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-600 leading-relaxed italic">"{applicant.interview?.notes || 'Sin observaciones'}"</p>
                                    </div>
                                </Section>

                                <Section title="Hito 2: Evaluaciones" icon={Activity}>
                                    <div className="space-y-4">
                                        <div className="p-4 bg-white rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-black text-indigo-500 uppercase mb-2">Psicolaboral</p>
                                            <div className="flex justify-between text-xs font-bold mb-1">
                                                <span className="text-slate-500">Puntaje:</span>
                                                <span className="text-slate-800">{applicant.tests?.psychological?.score || 0}%</span>
                                            </div>
                                            <p className="text-[10px] text-slate-400 italic">{applicant.tests?.psychological?.comments || 'Sin comentarios'}</p>
                                        </div>
                                        <div className="p-4 bg-white rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-black text-purple-500 uppercase mb-2">Técnica Profesional</p>
                                            <div className="flex justify-between text-xs font-bold">
                                                <span className="text-slate-500">Nivel:</span>
                                                <span className="text-slate-800">{applicant.tests?.professional?.knowledgeLevel || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Section>
                            </div>

                            {/* Documents & Accreditation */}
                            <div className="space-y-8">
                                <Section title="Documentación Validada" icon={FileText}>
                                    <div className="space-y-2">
                                        {(applicant.documents || []).map((doc, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-2.5 bg-white border border-slate-100 rounded-xl">
                                                <span className="text-[11px] font-bold text-slate-700 truncate w-2/3">{doc.docType}</span>
                                                <div className="flex items-center gap-2">
                                                    {doc.url && <a href={doc.url} target="_blank" rel="noreferrer" className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg"><Eye size={14} /></a>}
                                                    <span className={`p-1.5 rounded-lg ${doc.status === 'OK' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                                        {doc.status === 'OK' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Section>

                                <Section title="Acreditación y Prevención" icon={ShieldCheck}>
                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                            <p className="text-[10px] font-black text-emerald-600 uppercase mb-2 flex items-center gap-2"><ClipboardCheck size={12} /> Exámenes Médicos</p>
                                            <div className="space-y-1">
                                                {(applicant.accreditation?.physicalExams || []).filter(e => e.status === 'Aprobado').map((e, i) => (
                                                    <div key={i} className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                                                        <span>{e.name}</span>
                                                        <CheckCircle2 size={12} className="text-emerald-500" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </Section>

                                <Section title="Decisión Final Gerencia" icon={UserCheck}>
                                    <div className="bg-slate-900 p-5 rounded-2xl text-white">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-[10px] font-black text-slate-500 uppercase">Estado</span>
                                            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${applicant.hiring?.managerApproval === 'Aprobado' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                                                {applicant.hiring?.managerApproval || 'Pendiente'}
                                            </span>
                                        </div>
                                        {applicant.hiring?.approvedBy && (
                                            <p className="text-[11px] font-bold mb-1">Aprobado por: <span className="text-emerald-400">{applicant.hiring.approvedBy}</span></p>
                                        )}
                                        <p className="text-xs text-slate-400 italic">"{applicant.hiring?.managerNote || 'Sin notas del reclutador'}"</p>
                                    </div>
                                </Section>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <PageWrapper
            className="space-y-8 animate-in fade-in duration-500"
            title="AUDITORÍA MAESTRA DEL SISTEMA"
            subtitle="Historial completo y auditoría de procesos"
            icon={History}
            auth={auth}
            onLogout={onLogout}
            headerActions={
                <div className="relative w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar por Nombre, RUT o Cargo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-6 py-2.5 bg-white/10 border border-white/20 rounded-xl text-xs font-bold text-white placeholder:text-white/50 focus:bg-white/20 outline-none transition-all"
                    />
                </div>
            }
        >

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-slate-50/30">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="flex p-1 bg-slate-200/50 rounded-2xl w-full md:w-auto">
                            {['Todos', 'Aprobados', 'No Aprobados', 'En Proceso'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`flex-1 md:flex-initial px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest bg-white px-4 py-2 rounded-xl border border-slate-100">
                        <Users size={16} /> {filteredApplicants.length} Registros
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">
                                <th className="px-10 py-6">Postulante</th>
                                <th className="px-10 py-6">Cargo y Proyecto</th>
                                <th className="px-10 py-6">Última Actividad</th>
                                <th className="px-10 py-6">Estado Actual</th>
                                <th className="px-10 py-6">Resultado</th>
                                <th className="px-10 py-6 text-right">Detalle</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader2 size={32} className="animate-spin text-slate-300" />
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sincronizando Archivos...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredApplicants.map(app => (
                                <tr key={app._id} className="hover:bg-slate-50 transition-colors group border-transparent hover:border-slate-200">
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xs font-black">
                                                {app.fullName.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-extrabold text-slate-900 text-sm uppercase tracking-tight">{app.fullName}</span>
                                                <span className="text-[10px] font-bold text-slate-400">{app.rut}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-slate-800 uppercase tracking-tight">{app.position}</span>
                                            <span className="text-[10px] font-bold text-slate-400">ID: {app.projectId?.projectName || 'General'}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6 text-xs font-bold text-slate-500">
                                        {new Date(app.updatedAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-10 py-6">
                                        <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest border-2 ${getStatusStyle(app.status)} border-current bg-opacity-0`}>
                                            {app.status}
                                        </span>
                                    </td>
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-2">
                                            {app.status === 'Contratado' ? (
                                                <div className="flex items-center gap-2 text-emerald-600">
                                                    <CheckCircle2 size={16} />
                                                    <span className="text-xs font-black uppercase tracking-widest">Aprobado</span>
                                                </div>
                                            ) : app.status === 'Rechazado' ? (
                                                <div className="flex items-center gap-2 text-red-500">
                                                    <XCircle size={16} />
                                                    <span className="text-xs font-black uppercase tracking-widest">Desestimado</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-indigo-500">
                                                    <Clock size={16} />
                                                    <span className="text-xs font-black uppercase tracking-widest">En Curso</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-10 py-6 text-right">
                                        <button
                                            onClick={() => setSelectedApplicant(app)}
                                            className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 active:scale-95"
                                        >
                                            <ArrowUpRight size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Expediente Completo */}
            {selectedApplicant && (
                <FullAuditModal
                    applicant={selectedApplicant}
                    onClose={() => setSelectedApplicant(null)}
                />
            )}
        </PageWrapper>
    );
};

export default HistoryPage;
