import React, { useState, useEffect } from 'react';
import { FileText, Upload, CheckCircle2, Search, Loader2, Eye, Check, X, Settings, BookOpen, ClipboardList, Send, Activity, ShieldCheck, Trash2, Plus, AlertCircle, Info } from 'lucide-react';
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
    const [activeTab, setActiveTab] = useState('expediente'); // expediente, configuracion
    const [newDocName, setNewDocName] = useState('');
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

    const deleteContractDoc = async (docId) => {
        if (!window.confirm('¿Estás seguro de eliminar este documento? Se borrará el archivo asociado.')) return;
        try {
            const res = await api.delete(`/applicants/${selectedApplicant._id}/contract-docs/${docId}`);
            setSelectedApplicant(res.data);
            toast.success('Documento eliminado');
            fetchApplicants();
        } catch (error) {
            toast.error('Error al eliminar documento');
        }
    };

    const addCustomDoc = async () => {
        if (!newDocName.trim()) return;
        try {
            const res = await api.post(`/applicants/${selectedApplicant._id}/contract-docs/custom`, {
                docType: newDocName
            });
            setSelectedApplicant(res.data);
            setNewDocName('');
            toast.success('Nuevo requisito añadido al expediente');
            fetchApplicants();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al añadir requisito');
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
        const loadingToast = toast.loading('Calculando requisitos de cargo...');
        try {
            const res = await api.post(`/applicants/${selectedApplicant._id}/prevention/assign`);
            setSelectedApplicant(res.data);
            toast.success('Expediente actualizado con mallas de cargo', { id: loadingToast });
            fetchApplicants();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al asignar malla', { id: loadingToast });
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
                            onClick={() => setActiveTab('expediente')}
                            className={`px-10 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'expediente' ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-100/50' : 'text-slate-400 hover:text-indigo-600'}`}
                        >
                            <div className="flex items-center gap-2">
                                <FileText size={14} /> Expediente Digital 360
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

                                        {activeTab === 'expediente' && (
                                            <div className="space-y-8 pb-32">
                                                {/* Header Section: Combined Files */}
                                                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                                                    <div className="flex justify-between items-center mb-8">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                                <FileText size={20} />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Expediente de Contratación</h3>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Documentación base y legal</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={assignPreventionCurriculum}
                                                            className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
                                                        >
                                                            Sincronizar Malla
                                                        </button>
                                                    </div>

                                                    {!selectedApplicant.contractDocuments?.length ? (
                                                        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center">
                                                            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                                                <FileText size={32} />
                                                            </div>
                                                            <p className="text-slate-500 font-bold mb-6">No hay documentos base asignados.</p>
                                                            <button onClick={assignPreventionCurriculum} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700">Comenzar Acreditación</button>
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {selectedApplicant.contractDocuments.map((doc) => (
                                                                <div key={doc._id} className={`group bg-white p-5 rounded-2xl border-2 transition-all ${doc.status === 'OK' || doc.status === 'Verificado' ? 'border-emerald-100 bg-emerald-50/30' : 'border-slate-50 hover:border-indigo-100'}`}>
                                                                    <div className="flex justify-between items-start gap-4">
                                                                        <div className="flex-1 min-w-0">
                                                                            <h4 className="font-black text-slate-800 text-xs uppercase tracking-tight truncate">{doc.docType}</h4>
                                                                            <div className="flex items-center gap-2 mt-1">
                                                                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${doc.status === 'OK' || doc.status === 'Verificado' ? 'bg-emerald-100 text-emerald-600' : doc.status === 'Rechazado' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                                                                                    {doc.status}
                                                                                </span>
                                                                                {doc.uploadDate && <span className="text-[10px] font-bold text-slate-300 italic">{new Date(doc.uploadDate).toLocaleDateString()}</span>}
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                            {doc.url && <a href={doc.url} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Eye size={16} /></a>}
                                                                            <label className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer">
                                                                                {uploadingDoc === `contract-${doc.docType}` ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                                                                <input type="file" className="hidden" onChange={(e) => handleContractUpload(e, doc.docType)} accept=".pdf" />
                                                                            </label>
                                                                            <button onClick={() => deleteContractDoc(doc._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                                                        </div>
                                                                    </div>
                                                                    {doc.status === 'Pendiente' && doc.url && (
                                                                        <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                                                                            <button onClick={() => updateContractStatus(doc._id, 'OK')} className="flex-1 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors">Aprobar</button>
                                                                            <button onClick={() => {
                                                                                const r = prompt('Razón del rechazo:');
                                                                                if (r) updateContractStatus(doc._id, 'Rechazado', r);
                                                                            }} className="flex-1 py-2 bg-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Rechazar</button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}

                                                            {/* Add Custom Doc Input */}
                                                            <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-4 rounded-2xl flex items-center gap-3">
                                                                <Plus size={18} className="text-slate-400 ml-2" />
                                                                <input
                                                                    type="text"
                                                                    placeholder="Solicitar otro documento..."
                                                                    value={newDocName}
                                                                    onChange={(e) => setNewDocName(e.target.value)}
                                                                    onKeyDown={(e) => e.key === 'Enter' && addCustomDoc()}
                                                                    className="flex-1 bg-transparent border-none focus:ring-0 text-xs font-bold text-slate-600 placeholder:text-slate-400"
                                                                />
                                                                <button onClick={addCustomDoc} className="p-2 bg-white text-indigo-600 rounded-xl shadow-sm hover:bg-indigo-50"><Check size={16} /></button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Prevention Section */}
                                                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                                                    <div className="flex justify-between items-center mb-8">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                                                <ShieldCheck size={20} />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Requisitos de Prevención</h3>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cursos, Certificados y Exámenes</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="mr-4 flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-lg border border-amber-100">
                                                                <AlertCircle size={12} />
                                                                <span className="text-[10px] font-black uppercase">Sincronizado con Acreditación</span>
                                                            </div>
                                                            <button onClick={() => handleAssignBAT('BAT1')} className="px-4 py-2 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-100">Cargar BAT 1</button>
                                                            <button onClick={() => handleAssignBAT('BAT2')} className="px-4 py-2 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase hover:bg-orange-600 transition-all shadow-lg shadow-orange-100">Cargar BAT 2</button>
                                                        </div>
                                                    </div>

                                                    {!selectedApplicant.preventionDocuments?.assignedAt ? (
                                                        <div className="py-12 text-center bg-emerald-50/30 rounded-3xl border-2 border-dashed border-emerald-100">
                                                            <p className="text-emerald-700 font-bold mb-4">No se ha sincronizado la malla de prevención para este cargo.</p>
                                                            <button onClick={assignPreventionCurriculum} className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-700">Cargar Requisitos de Prevención</button>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-8">
                                                            {/* Courses */}
                                                            <div>
                                                                <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">
                                                                    <BookOpen size={12} /> Cursos de Capacitación
                                                                </h4>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    {selectedApplicant.preventionDocuments.courses?.map(course => (
                                                                        <div key={course.courseCode} className="group p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center hover:bg-indigo-50/30 transition-all">
                                                                            <div className="flex-1 min-w-0 pr-4">
                                                                                <p className="font-black text-[11px] uppercase truncate text-slate-700">{course.courseName}</p>
                                                                                <div className="flex items-center gap-2 mt-1">
                                                                                    <div className={`w-2 h-2 rounded-full ${course.status === 'Completado' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{course.status}</span>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center gap-2">
                                                                                {course.url && <a href={course.url} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 hover:text-indigo-600"><Eye size={16} /></a>}
                                                                                <label className="cursor-pointer p-2.5 bg-white text-indigo-600 border border-indigo-100 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                                                                                    {uploadingDoc === `prevention-course-${course.courseCode}` ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                                                                    <input type="file" className="hidden" onChange={(e) => handlePreventionUpload(e, 'course', course.courseCode)} accept=".pdf" />
                                                                                </label>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {/* Exams */}
                                                            <div>
                                                                <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">
                                                                    <Activity size={12} /> Exámenes de Salud
                                                                </h4>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    {selectedApplicant.preventionDocuments.exams?.map(exam => (
                                                                        <div key={exam.examCode} className="group p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center hover:bg-orange-50/30 transition-all">
                                                                            <div className="flex-1 min-w-0 pr-4">
                                                                                <p className="font-black text-[11px] uppercase truncate text-slate-700">{exam.examName}</p>
                                                                                <div className="flex items-center gap-2 mt-1">
                                                                                    <div className={`w-2 h-2 rounded-full ${exam.status === 'Completado' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{exam.status}</span>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center gap-2">
                                                                                {exam.url && <a href={exam.url} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 hover:text-orange-600"><Eye size={16} /></a>}
                                                                                <label className="cursor-pointer p-2.5 bg-white text-orange-600 border border-orange-100 rounded-xl hover:bg-orange-600 hover:text-white transition-all shadow-sm">
                                                                                    {uploadingDoc === `prevention-exam-${exam.examCode}` ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                                                                    <input type="file" className="hidden" onChange={(e) => handlePreventionUpload(e, 'exam', exam.examCode)} accept=".pdf" />
                                                                                </label>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Final Action Bar */}
                                                <div className="fixed bottom-12 right-12 left-auto z-40">
                                                    <div className="bg-slate-900 shadow-2xl shadow-indigo-900/40 p-2 rounded-3xl border border-white/10 flex items-center gap-8 pl-8">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cobertura Total</span>
                                                            <span className="text-2xl font-black text-white">{getProgress(selectedApplicant).percentage}% <span className="text-xs text-slate-500 font-bold ml-1">({getProgress(selectedApplicant).completed}/{getProgress(selectedApplicant).total})</span></span>
                                                        </div>
                                                        <button
                                                            onClick={advanceStage}
                                                            disabled={getProgress(selectedApplicant).percentage < 100}
                                                            className={`px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center gap-3 ${getProgress(selectedApplicant).percentage >= 100 ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl shadow-indigo-600/20' : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'}`}
                                                        >
                                                            Finalizar Acreditación <CheckCircle2 size={20} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
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
