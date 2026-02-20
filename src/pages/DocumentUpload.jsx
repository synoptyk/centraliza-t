import React, { useState, useEffect } from 'react';
import { FileText, Upload, CheckCircle2, Search, Loader2, Eye, Check, X, Settings, BookOpen, ClipboardList, Send, Activity, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import PageWrapper from '../components/PageWrapper';
import usePermissions from '../hooks/usePermissions';
import MallaConfigTab from '../components/MallaConfigTab';

const DocumentUpload = ({ onOpenCENTRALIZAT, auth, onLogout }) => {
    const [applicants, setApplicants] = useState([]);
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const { canUpdate } = usePermissions('documentos');
    const [loading, setLoading] = useState(false);
    const [uploadingDoc, setUploadingDoc] = useState(null);
    const [activeTab, setActiveTab] = useState('contratacion'); // contratacion, prevencion, configuracion
    const [searchTerm, setSearchTerm] = useState('');
    const [projects, setProjects] = useState([]);

    // Remove hardcoded lists, we'll use applicant.contractDocuments

    useEffect(() => {
        fetchApplicants();
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await api.get('/projects');
            setProjects(res.data);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const fetchApplicants = async () => {
        setLoading(true);
        try {
            const res = await api.get('/applicants');
            const filtered = res.data.filter(app =>
                app.tests?.psycholaborTest?.status === 'Completado'
            );
            setApplicants(filtered);
            if (selectedApplicant) {
                const updated = filtered.find(a => a._id === selectedApplicant._id);
                setSelectedApplicant(updated);
            }
        } catch (error) {
            toast.error('Error al cargar postulantes');
        } finally {
            setLoading(false);
        }
    };

    const handleContractUpload = async (e, docType) => {
        if (!selectedApplicant) return;
        const file = e.target.files[0];
        if (!file || file.type !== 'application/pdf') {
            toast.error('Solo se permiten archivos PDF');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('docType', docType);

        setUploadingDoc(`contract-${docType}`);
        try {
            const res = await api.post(`/applicants/${selectedApplicant._id}/contract-docs`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSelectedApplicant(res.data);
            toast.success(`${docType} cargado correctamente`);
            fetchApplicants();
        } catch (error) {
            toast.error('Error al subir el documento');
        } finally {
            setUploadingDoc(null);
        }
    };

    const updateContractStatus = async (docId, newStatus, rejectionReason = '') => {
        try {
            const res = await api.put(`/applicants/${selectedApplicant._id}/contract-docs/${docId}/status`, {
                status: newStatus,
                rejectionReason
            });
            setSelectedApplicant(res.data);
            toast.success(`Estado actualizado a ${newStatus}`);
            fetchApplicants();
        } catch (error) {
            toast.error('Error al actualizar estado');
        }
    };

    const updatePreventionStatus = async (type, itemCode, status) => {
        try {
            const res = await api.put(`/applicants/${selectedApplicant._id}/prevention/${type}/${itemCode}/status`, {
                status,
                completionDate: status === 'Completado' ? new Date() : undefined
            });
            setSelectedApplicant(res.data);
            toast.success(`Estado actualizado a ${status}`);
            fetchApplicants();
        } catch (error) {
            toast.error('Error al actualizar estado');
        }
    };

    const handlePreventionUpload = async (e, type, itemCode) => {
        if (!selectedApplicant) return;
        const file = e.target.files[0];
        if (!file || file.type !== 'application/pdf') {
            toast.error('Solo se permiten archivos PDF');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        formData.append('itemCode', itemCode);

        setUploadingDoc(`prevention-${type}-${itemCode}`);
        try {
            const res = await api.post(`/applicants/${selectedApplicant._id}/prevention/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSelectedApplicant(res.data);
            toast.success('Documento cargado correctamente');
            fetchApplicants();
        } catch (error) {
            toast.error('Error al subir documento');
        } finally {
            setUploadingDoc(null);
        }
    };

    const assignPreventionCurriculum = async () => {
        if (!selectedApplicant) return;
        try {
            const res = await api.post(`/applicants/${selectedApplicant._id}/prevention/assign`);
            setSelectedApplicant(res.data);
            toast.success('Malla de prevención asignada exitosamente');
            fetchApplicants();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al asignar malla');
        }
    };

    const handleAssignBAT = async (type) => {
        if (!selectedApplicant) return;
        const loadingToast = toast.loading(`Asignando Estándar ${type}...`);
        try {
            const res = await api.post(`/applicants/${selectedApplicant._id}/prevention/bat/${type}`);
            setSelectedApplicant(res.data);
            toast.success(`Estándar ${type} asignado correctamente`, { id: loadingToast });
            fetchApplicants();
        } catch (error) {
            toast.error('Error al asignar estándar BAT', { id: loadingToast });
        }
    };

    const getContractDoc = (docType) => {
        return selectedApplicant?.contractDocuments?.find(d => d.docType === docType);
    };

    const getProgress = (app) => {
        if (!app) return { percentage: 0, total: 0, completed: 0, contract: { total: 0, completed: 0 }, prevention: { courses: { total: 0, completed: 0 }, exams: { total: 0, completed: 0 } } };
        const contractTotal = app.contractDocuments?.length || 0;
        const contractOK = app.contractDocuments?.filter(d => d.status === 'OK' || d.status === 'Verificado').length || 0;
        const coursesTotal = app.preventionDocuments?.courses?.length || 0;
        const coursesOK = app.preventionDocuments?.courses?.filter(c => c.status === 'Completado').length || 0;
        const examsTotal = app.preventionDocuments?.exams?.length || 0;
        const examsOK = app.preventionDocuments?.exams?.filter(e => e.status === 'Completado').length || 0;
        const total = contractTotal + coursesTotal + examsTotal;
        const completed = contractOK + coursesOK + examsOK;
        return {
            total, completed,
            percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
            contract: { total: contractTotal, completed: contractOK },
            prevention: {
                courses: { total: coursesTotal, completed: coursesOK },
                exams: { total: examsTotal, completed: examsOK }
            }
        };
    };

    const advanceStage = async () => {
        try {
            await api.put(`/applicants/${selectedApplicant._id}/status`, { status: 'Acreditación' });
            toast.success('Postulante avanzado a Acreditación');
            setSelectedApplicant(null);
            fetchApplicants();
        } catch (error) {
            toast.error('Error al avanzar de fase');
        }
    };

    const filteredApplicants = applicants.filter(app =>
        app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.rut.includes(searchTerm) ||
        app.position.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <PageWrapper
            className="space-y-8"
            title="CARGA DOCUMENTAL"
            subtitle="Gestión de documentación de contratación y prevención"
            icon={FileText}
            auth={auth}
            onLogout={onLogout}
        >
            <div className="space-y-6">
                {/* Global Tabs - Top Level Visibility */}
                <div className="bg-white p-2 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between">
                    <div className="flex p-1 bg-slate-50 rounded-2xl">
                        <button
                            onClick={() => setActiveTab('contratacion')}
                            className={`px-10 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'contratacion' ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-100/50' : 'text-slate-400 hover:text-indigo-600'}`}
                        >
                            <div className="flex items-center gap-2">
                                <FileText size={14} /> Contratación
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('prevencion')}
                            className={`px-10 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'prevencion' ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-100/50' : 'text-slate-400 hover:text-indigo-600'}`}
                        >
                            <div className="flex items-center gap-2">
                                <ShieldCheck size={14} /> Prevención
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('configuracion')}
                            className={`px-10 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'configuracion' ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'text-slate-400 hover:bg-slate-100'}`}
                        >
                            <Settings size={14} /> Configurar Mallas
                        </button>
                    </div>

                    <div className="pr-8 flex items-center gap-4 border-l border-slate-100 ml-4 py-2 pl-8">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Módulo</p>
                            <p className="text-xs font-black text-indigo-600 uppercase">Carga Documental</p>
                        </div>
                    </div>
                </div>

                <div className="h-[calc(100vh-220px)] flex flex-col md:flex-row gap-6">
                    {/* Sidebar: Postulantes */}
                    <div className="w-full md:w-80 flex flex-col gap-4">
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex-1 overflow-hidden flex flex-col">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <ClipboardList size={22} />
                                </div>
                                <h3 className="font-black text-slate-800 uppercase tracking-tight">Postulantes</h3>
                            </div>

                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Buscar..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-semibold"
                                />
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                                {filteredApplicants.map(app => (
                                    <button
                                        key={app._id}
                                        onClick={() => setSelectedApplicant(app)}
                                        className={`w-full p-4 rounded-2xl text-left transition-all border ${selectedApplicant?._id === app._id
                                            ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-100'
                                            : 'bg-white border-slate-100 hover:border-indigo-300 hover:bg-slate-50'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <p className={`font-black text-sm uppercase truncate ${selectedApplicant?._id === app._id ? 'text-white' : 'text-slate-800'}`}>
                                                {app.fullName}
                                            </p>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${selectedApplicant?._id === app._id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                {app.status}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${selectedApplicant?._id === app._id ? 'text-indigo-200' : 'text-indigo-600'}`}>
                                                {app.projectId?.name || 'Sin Proyecto'}
                                            </p>
                                            <p className={`text-xs font-bold ${selectedApplicant?._id === app._id ? 'text-indigo-100' : 'text-slate-400'}`}>
                                                {app.position}
                                            </p>
                                        </div>
                                        <div className="mt-3 bg-black/10 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className="bg-emerald-400 h-full transition-all duration-500"
                                                style={{ width: `${getProgress(app).percentage}%` }}
                                            />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col min-w-0">
                        {selectedApplicant || activeTab === 'configuracion' ? (
                            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-100">
                                {activeTab === 'configuracion' ? (
                                    <MallaConfigTab
                                        type="hiring"
                                        projects={projects}
                                        initialProject={selectedApplicant?.projectId?._id}
                                        initialPosition={selectedApplicant?.position}
                                    />
                                ) : (
                                    <>
                                        {/* Profile Header */}
                                        <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-[2.5rem] p-8 mb-8 text-white relative overflow-hidden group">
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center text-3xl font-black border border-white/20">
                                                        {selectedApplicant.fullName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h2 className="text-3xl font-black uppercase tracking-tight leading-none mb-2">{selectedApplicant.fullName}</h2>
                                                        <div className="flex flex-wrap items-center gap-3">
                                                            <span className="px-3 py-1 bg-white/20 rounded-lg text-[10px] font-black uppercase tracking-widest">{selectedApplicant.rut}</span>
                                                            <span className="px-3 py-1 bg-indigo-500/40 rounded-lg text-[10px] font-black uppercase tracking-widest">{selectedApplicant.position}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2 text-right">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">Progreso Total</span>
                                                        <span className="text-2xl font-black">{getProgress(selectedApplicant).percentage}%</span>
                                                    </div>
                                                    <div className="w-48 h-3 bg-white/10 rounded-full overflow-hidden border border-white/10 p-0.5">
                                                        <div className="h-full bg-gradient-to-r from-emerald-400 to-indigo-400 rounded-full transition-all duration-1000" style={{ width: `${getProgress(selectedApplicant).percentage}%` }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {activeTab === 'contratacion' && (
                                            <div className="space-y-6">
                                                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                                                    <div className="flex items-center justify-between mb-8">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">1</div>
                                                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Expediente de Contratación</h3>
                                                        </div>
                                                    </div>

                                                    {!selectedApplicant.contractDocuments?.length ? (
                                                        <div className="bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-3xl p-12 text-center">
                                                            <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                                                <FileText size={40} />
                                                            </div>
                                                            <h4 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-3">Requisitos no asignados</h4>
                                                            <p className="text-slate-600 font-bold mb-8 max-w-md mx-auto">
                                                                Debes asignar los requisitos de contratación configurados para el cargo {selectedApplicant.position}.
                                                            </p>
                                                            <button
                                                                onClick={assignPreventionCurriculum}
                                                                className="px-10 py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-widest text-sm hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all"
                                                            >
                                                                Asignar Requisitos de Cargo
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                                            {selectedApplicant.contractDocuments.map((doc) => {
                                                                return (
                                                                    <div key={doc._id || doc.docType} className={`group p-5 rounded-2xl border transition-all ${doc.status === 'OK' || doc.status === 'Verificado' ? 'bg-emerald-50 border-emerald-200' : doc.status === 'Rechazado' ? 'bg-red-50 border-red-200' : 'bg-white border-slate-100 hover:border-indigo-300'}`}>
                                                                        <div className="flex justify-between items-start gap-4">
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="font-bold text-slate-700 text-sm truncate uppercase tracking-tight">{doc.docType}</p>
                                                                                <span className={`text-[10px] font-black uppercase flex items-center gap-1.5 mt-1 ${doc.status === 'OK' || doc.status === 'Verificado' ? 'text-emerald-600' : doc.status === 'Rechazado' ? 'text-red-600' : 'text-indigo-600'}`}>
                                                                                    <Activity size={10} /> {doc.status}
                                                                                </span>
                                                                            </div>
                                                                            <div className="flex items-center gap-2">
                                                                                {doc.url && <a href={doc.url} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white text-slate-600 rounded-xl border border-slate-200 hover:text-indigo-600 shadow-sm"><Eye size={18} /></a>}
                                                                                <div className="flex items-center gap-1.5">
                                                                                    {doc.status === 'Pendiente' && (
                                                                                        <>
                                                                                            <button onClick={() => updateContractStatus(doc._id, 'OK')} className="p-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600"><Check size={18} /></button>
                                                                                            <button onClick={() => {
                                                                                                const reason = prompt('Motivo de rechazo:');
                                                                                                if (reason) updateContractStatus(doc._id, 'Rechazado', reason);
                                                                                            }} className="p-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600"><X size={18} /></button>
                                                                                        </>
                                                                                    )}
                                                                                    <label className="cursor-pointer p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                                                                                        {uploadingDoc === `contract-${doc.docType}` ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                                                                                        <input type="file" className="hidden" onChange={(e) => handleContractUpload(e, doc.docType)} accept=".pdf" disabled={uploadingDoc !== null} />
                                                                                    </label>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex justify-end p-4">
                                                    {getProgress(selectedApplicant).contract.total > 0 && getProgress(selectedApplicant).contract.completed >= getProgress(selectedApplicant).contract.total && (
                                                        <button onClick={advanceStage} className="flex items-center gap-3 px-10 py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-widest text-sm shadow-xl hover:bg-indigo-700 transition-all">
                                                            Finalizar Contratación <Send size={20} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {activeTab === 'prevencion' && (
                                            <div className="space-y-6">
                                                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                                                    <div className="flex justify-between items-center mb-8">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold">2</div>
                                                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Prevención de Riesgos</h3>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button onClick={() => handleAssignBAT('BAT1')} className="px-4 py-2 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase">BAT 1</button>
                                                            <button onClick={() => handleAssignBAT('BAT2')} className="px-4 py-2 bg-indigo-900 text-white rounded-xl font-black text-[10px] uppercase">BAT 2</button>
                                                        </div>
                                                    </div>
                                                    {!selectedApplicant.preventionDocuments?.assignedAt ? (
                                                        <button onClick={assignPreventionCurriculum} className="w-full py-10 border-2 border-dashed border-indigo-100 rounded-[2rem] text-indigo-400 font-black uppercase tracking-widest hover:bg-indigo-50 transition-all">Asignar Malla de Cargo</button>
                                                    ) : (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {selectedApplicant.preventionDocuments.exams?.map(exam => (
                                                                <div key={exam.examCode} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                                                                    <div>
                                                                        <p className="font-black text-xs uppercase">{exam.examName}</p>
                                                                        <p className="text-[10px] font-bold text-slate-400">{exam.status}</p>
                                                                    </div>
                                                                    <label className="cursor-pointer p-2 bg-emerald-600 text-white rounded-lg">
                                                                        <Upload size={14} />
                                                                        <input type="file" className="hidden" onChange={(e) => handlePreventionUpload(e, 'exam', exam.examCode)} accept=".pdf" />
                                                                    </label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex justify-between items-center bg-slate-900 p-8 rounded-[2.5rem] mt-8 text-white">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado General</span>
                                                <span className="text-2xl font-black">{getProgress(selectedApplicant).completed} / {getProgress(selectedApplicant).total} Verificados</span>
                                            </div>
                                            <button onClick={advanceStage} disabled={getProgress(selectedApplicant).percentage < 100} className="px-10 py-5 bg-indigo-600 rounded-2xl font-black uppercase tracking-widest text-sm disabled:opacity-30">
                                                Acreditar <CheckCircle2 size={20} className="inline ml-2" />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center bg-white border-4 border-dashed border-slate-100 rounded-[3rem] text-slate-300">
                                <FileText size={48} className="mb-4 opacity-50" />
                                <p className="font-black uppercase tracking-widest text-sm">Selecciona un postulante para comenzar</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};

export default DocumentUpload;
