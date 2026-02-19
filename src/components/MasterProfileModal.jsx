import React from 'react';
import {
    X, User, Mail, Phone, Calendar,
    BrainCircuit, FileText, ShieldCheck,
    CheckCircle2, Clock, MapPin,
    ChevronRight, Award, ExternalLink
} from 'lucide-react';

const MasterProfileModal = ({ applicant, onClose }) => {
    if (!applicant) return null;

    const Section = ({ title, icon: Icon, children, color = "blue" }) => (
        <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
                <div className={`p-2 rounded-xl bg-${color}-50 text-${color}-600`}>
                    <Icon size={18} />
                </div>
                <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-500">{title}</h4>
            </div>
            {children}
        </div>
    );

    const StatusBadge = ({ status }) => {
        const colors = {
            'Postulando': 'bg-slate-100 text-slate-600',
            'En Entrevista': 'bg-indigo-100 text-indigo-600',
            'En Test': 'bg-purple-100 text-purple-600',
            'Carga Documental': 'bg-amber-100 text-amber-600',
            'Acreditación': 'bg-emerald-100 text-emerald-600',
            'Contratado': 'bg-emerald-500 text-white',
            'Rechazado': 'bg-red-500 text-white',
        };
        return (
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${colors[status] || 'bg-slate-100 text-slate-500'}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}></div>

            {/* Modal */}
            <div className="relative bg-slate-50 w-full max-w-5xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
                {/* Header */}
                <div className="bg-white p-8 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-3xl bg-slate-900 text-white flex items-center justify-center text-2xl font-black">
                            {applicant.fullName.charAt(0)}
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">{applicant.fullName}</h3>
                                <StatusBadge status={applicant.status} />
                            </div>
                            <p className="text-slate-400 font-bold text-sm tracking-tight mt-0.5">{applicant.position} • {applicant.rut}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 bg-slate-100 text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                        {/* Contact Info */}
                        <Section title="Contacto" icon={User} color="blue">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                                    <Mail size={14} className="text-slate-400" /> {applicant.email}
                                </div>
                                <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                                    <Phone size={14} className="text-slate-400" /> {applicant.phone}
                                </div>
                                <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                                    <MapPin size={14} className="text-slate-400" /> {applicant.address || 'No registrada'}
                                </div>
                            </div>
                        </Section>

                        {/* Interview Details */}
                        <Section title="Entrevista" icon={Calendar} color="indigo">
                            {applicant.interview?.result ? (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <span className="text-[10px] font-black text-slate-400 uppercase">Resultado</span>
                                        <span className={`text-[10px] font-black uppercase ${applicant.interview.result === 'OK' ? 'text-emerald-500' : 'text-red-500'}`}>{applicant.interview.result}</span>
                                    </div>
                                    <p className="text-xs font-medium text-slate-500 italic leading-relaxed">"{applicant.interview.notes || 'Sin anotaciones'}"</p>
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400 font-bold italic">Pendiente de entrevista</p>
                            )}
                        </Section>

                        {/* Test Results */}
                        <Section title="Tests y Evaluaciones" icon={BrainCircuit} color="purple">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Psicolaboral</span>
                                    <span className="text-xs font-black text-purple-600">{applicant.tests?.psychological?.score || 0}%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Profesional</span>
                                    <span className="text-xs font-black text-indigo-600">{applicant.tests?.professional?.score || 0}%</span>
                                </div>
                            </div>
                        </Section>

                        {/* Document Checklist */}
                        <Section title="Expediente PDF" icon={FileText} color="amber">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between bg-amber-50 p-3 rounded-xl border border-amber-100">
                                    <span className="text-[10px] font-black text-amber-600 uppercase">Documentos OK</span>
                                    <span className="text-sm font-black text-slate-900">{applicant.documents?.filter(d => d.status === 'OK').length || 0} / {applicant.documents?.length || 0}</span>
                                </div>
                                {applicant.documents?.length > 0 && (
                                    <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter overflow-hidden truncate">
                                        Último: {applicant.documents[applicant.documents.length - 1].docType}
                                    </div>
                                )}
                            </div>
                        </Section>

                        {/* Accreditation */}
                        <Section title="Prevención y Acreditación" icon={ShieldCheck} color="emerald">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1 p-2 bg-slate-50 rounded-xl border border-slate-100">
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Físicos</span>
                                    <span className="text-xs font-bold text-slate-700">{applicant.accreditation?.physicalExams?.filter(e => e.status === 'Aprobado').length || 0} Aprob.</span>
                                </div>
                                <div className="flex flex-col gap-1 p-2 bg-slate-50 rounded-xl border border-slate-100">
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Online</span>
                                    <span className="text-xs font-bold text-slate-700">{applicant.accreditation?.onlineExams?.filter(e => e.status === 'Aprobado').length || 0} Aprob.</span>
                                </div>
                            </div>
                        </Section>

                        {/* Final Approval Hands */}
                        <Section title="Estatus Contratación" icon={CheckCircle2} color="slate">
                            <div className="space-y-2">
                                <div className={`p-3 rounded-xl border text-[10px] font-black uppercase text-center ${applicant.workerData?.validationStatus === 'Aprobado' ? 'bg-emerald-100 border-emerald-200 text-emerald-700' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
                                    {applicant.workerData?.validationStatus || 'Por Validar'}
                                </div>
                                <div className="flex items-center justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">
                                    <span>Gerencia:</span>
                                    <span className={applicant.hiring?.managerApproval === 'Aprobado' ? 'text-emerald-500' : 'text-slate-400'}>{applicant.hiring?.managerApproval || 'Pendiente'}</span>
                                </div>
                            </div>
                        </Section>
                    </div>

                    {/* Timeline / Audit Trail */}
                    <div className="mt-8 bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <History size={150} />
                        </div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6">Auditoría del Proceso</h4>

                        <div className="space-y-6 relative">
                            {/* Vertical Line */}
                            <div className="absolute left-[19px] top-2 bottom-2 w-[2px] bg-slate-800"></div>

                            {/* History Items */}
                            {(applicant.history && applicant.history.length > 0) ? (
                                [...applicant.history].reverse().map((log, i) => (
                                    <div key={i} className="flex gap-4 relative">
                                        <div className="w-10 h-10 rounded-full bg-slate-900 border-2 border-indigo-500 flex items-center justify-center shrink-0 z-10 shadow-lg shadow-indigo-500/20">
                                            <CheckCircle2 size={16} className="text-indigo-400" />
                                        </div>
                                        <div className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/5 hover:bg-white/10 transition-colors">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">{log.status}</span>
                                                <span className="text-[9px] font-bold text-slate-500">{new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <p className="text-xs text-slate-300 mb-2">{log.comments}</p>
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center text-[8px] font-black">
                                                    {(log.changedBy || 'S').charAt(0)}
                                                </div>
                                                <span className="text-[9px] text-slate-500 uppercase font-black tracking-wider">{log.changedBy || 'Sistema'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4 text-slate-600 italic text-xs">Sin historial registrado</div>
                            )}

                            {/* Initial State Mock (if empty) */}
                            {(!applicant.history || applicant.history.length === 0) && (
                                <div className="flex gap-4 relative">
                                    <div className="w-10 h-10 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center shrink-0 z-10">
                                        <Clock size={16} className="text-slate-500" />
                                    </div>
                                    <div className="flex-1 text-slate-500 text-xs italic pt-2">
                                        Registro inicial (Sin datos de auditoría previos)
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="bg-white p-6 border-t border-slate-100 flex justify-end gap-4">
                    <button className="px-8 py-3.5 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2">
                        <FileText size={16} /> Ver Expediente Maestro
                    </button>
                    <button onClick={onClose} className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all">
                        Cerrar CENTRALIZAT View
                    </button>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default MasterProfileModal;
