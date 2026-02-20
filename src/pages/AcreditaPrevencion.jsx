import React, { useState, useEffect } from 'react';
import {
    Activity, BookOpen, Search, Upload, ShieldCheck,
    Loader2, Eye, Save, X, FileText, ClipboardList,
    Settings, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import PageWrapper from '../components/PageWrapper';
import usePermissions from '../hooks/usePermissions';
import MallaConfigTab from '../components/MallaConfigTab';

const AcreditaPrevencion = ({ onOpenCENTRALIZAT, auth, onLogout }) => {
    const [applicants, setApplicants] = useState([]);
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const { canUpdate } = usePermissions('acreditacion-prevencion');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('expediente'); // 'expediente', 'configuracion'
    const [updatingItem, setUpdatingItem] = useState(null);
    const [projects, setProjects] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const statusOptions = [
        'Pendiente',
        'En Proceso',
        'Completado',
        'Vencido',
        'Rechazado'
    ];

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
            // Filter applicants
            const relevantApps = res.data.filter(app =>
                ['Carga Documental', 'Acreditación', 'Pendiente Aprobación Gerencia'].includes(app.status)
            );
            setApplicants(relevantApps);
            if (selectedApplicant) {
                const updated = res.data.find(a => a._id === selectedApplicant._id);
                setSelectedApplicant(updated);
            }
        } catch (error) {
            toast.error('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    const handleAssignCurriculum = async () => {
        if (!selectedApplicant) return;
        setLoading(true);
        try {
            const res = await api.post(`/applicants/${selectedApplicant._id}/prevention/assign`);
            setSelectedApplicant(res.data);
            toast.success('Malla de prevención asignada exitosamente');
            fetchApplicants();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al asignar malla. Asegúrese de haber configurado el cargo.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateItem = async (type, itemCode, data) => {
        if (!selectedApplicant) return;
        setUpdatingItem(`${type}-${itemCode}`);

        try {
            if (data.file) {
                const formData = new FormData();
                formData.append('type', type);
                formData.append('itemCode', itemCode);
                formData.append('file', data.file);

                const res = await api.post(
                    `/applicants/${selectedApplicant._id}/prevention/upload`,
                    formData,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );
                setSelectedApplicant(res.data);
                toast.success('Documento subido');
            } else if (data.status) {
                const res = await api.put(
                    `/applicants/${selectedApplicant._id}/prevention/${type}/${itemCode}/status`,
                    { status: data.status }
                );
                setSelectedApplicant(res.data);
                toast.success('Estado actualizado');
            }
            fetchApplicants();
        } catch (error) {
            toast.error('Error al actualizar ítem');
        } finally {
            setUpdatingItem(null);
        }
    };

    const advanceToApproval = async () => {
        try {
            await api.put(`/applicants/${selectedApplicant._id}/status`, {
                status: 'Pendiente Aprobación Gerencia'
            });
            toast.success('Postulante enviado a Aprobación de Gerencia');
            setSelectedApplicant(null);
            fetchApplicants();
        } catch (error) {
            toast.error('Error al avanzar de fase');
        }
    };

    const getProgress = (app) => {
        if (!app?.preventionDocuments) return { percentage: 0 };
        const courses = app.preventionDocuments.courses || [];
        const exams = app.preventionDocuments.exams || [];
        const total = courses.length + exams.length;
        if (total === 0) return { percentage: 0 };
        const completed = [...courses, ...exams].filter(i => i.status === 'Completado').length;
        return { percentage: Math.round((completed / total) * 100) };
    };

    const renderItemRow = (type, item, idx) => {
        const itemCode = type === 'course' ? item.courseCode : item.examCode;
        const itemName = type === 'course' ? item.courseName : item.examName;
        const isUpdating = updatingItem === `${type}-${itemCode}`;
        const itemUrl = type === 'course' ? item.certificateUrl : item.resultUrl;

        return (
            <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                    {/* Name & Icon */}
                    <div className="flex items-center gap-4 md:w-1/3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.status === 'Completado' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                            {type === 'course' ? <BookOpen size={20} /> : <Activity size={20} />}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-slate-800 text-sm tracking-tight">{itemName}</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.category || 'Requisito'}</span>
                        </div>
                    </div>

                    {/* Status Select */}
                    <div className="md:w-1/5">
                        <select
                            className={`w-full p-2.5 rounded-xl text-xs font-bold border-2 transition-all outline-none ${item.status === 'Completado' ? 'border-emerald-100 bg-emerald-50 text-emerald-700' :
                                item.status === 'Rechazado' ? 'border-red-100 bg-red-50 text-red-700' :
                                    item.status === 'En Proceso' ? 'border-amber-100 bg-amber-50 text-amber-700' :
                                        'border-slate-100 bg-slate-50 text-slate-600'
                                }`}
                            value={item.status}
                            onChange={(e) => handleUpdateItem(type, itemCode, { status: e.target.value })}
                            disabled={isUpdating}
                        >
                            {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>

                    {/* Meta Info */}
                    <div className="md:w-1/4">
                        <div className="flex flex-col gap-1">
                            {item.issueDate && (
                                <span className="text-[10px] font-bold text-slate-500">Otorgado: {new Date(item.issueDate).toLocaleDateString()}</span>
                            )}
                            {item.expiryDate && (
                                <span className="text-[10px] font-bold text-orange-500">Vence: {new Date(item.expiryDate).toLocaleDateString()}</span>
                            )}
                            {!item.issueDate && !item.expiryDate && (
                                <span className="text-[10px] italic text-slate-400">Sin registro de vigencia</span>
                            )}
                        </div>
                    </div>

                    {/* Actions (File Upload/View) */}
                    <div className="flex items-center gap-3 md:w-1/6 justify-end">
                        {itemUrl && (
                            <a href={itemUrl} target="_blank" rel="noreferrer" className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all shadow-sm" title="Ver Certificado">
                                <Eye size={18} />
                            </a>
                        )}
                        <div className="relative group/upload">
                            <input
                                type="file"
                                accept=".pdf,image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                onChange={(e) => handleUpdateItem(type, itemCode, { file: e.target.files[0] })}
                                disabled={isUpdating}
                            />
                            <button className={`p-2.5 rounded-xl transition-all shadow-sm ${isUpdating ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                                {isUpdating ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const filteredApplicants = applicants.filter(app => {
        const search = searchTerm.toLowerCase();
        return (
            app.fullName.toLowerCase().includes(search) ||
            app.rut.includes(searchTerm) ||
            app.position.toLowerCase().includes(search) ||
            (app.projectId?.name && app.projectId.name.toLowerCase().includes(search))
        );
    });

    return (
        <PageWrapper
            className="space-y-8"
            title="CERTIFICACIÓN DE SEGURIDAD INTEGRAL"
            subtitle="VALIDACIÓN DE SEGURIDAD Y PREVENCIÓN DE RIESGOS"
            icon={ShieldCheck}
            auth={auth}
            onLogout={onLogout}
            headerActions={
                <div className="flex items-center gap-3">
                    <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold border border-white/20 text-white">
                        <Loader2 size={14} className={loading ? 'animate-spin' : ''} />
                        {loading ? 'Sincronizando...' : 'Conectado'}
                    </div>
                </div>
            }
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
                                <ShieldCheck size={14} /> Expediente de Prevención 360
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
                            <p className="text-xs font-black text-indigo-600 uppercase">Seguridad & Prevención</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Applicant Sidebar */}
                    <div className="lg:col-span-1 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[700px]">
                        <div className="p-5 bg-slate-50 border-b border-slate-100">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                                    <ClipboardList size={20} />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm">Postulantes</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fase de Acreditación</p>
                                </div>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Buscar candidato..."
                                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                            {filteredApplicants.map(app => (
                                <div
                                    key={app._id}
                                    className={`w-full p-5 text-left flex items-start justify-between transition-all hover:bg-slate-50 group border-b border-slate-50 ${selectedApplicant?._id === app._id ? 'bg-indigo-50 border-r-4 border-indigo-600 shadow-inner' : ''}`}
                                >
                                    <button
                                        onClick={() => setSelectedApplicant(app)}
                                        className="flex-1 flex flex-col gap-1 pr-2"
                                    >
                                        <span className="font-bold text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors uppercase text-sm">{app.fullName}</span>
                                        <div className="flex flex-col gap-0.5 mt-1">
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${selectedApplicant?._id === app._id ? 'text-indigo-400' : 'text-indigo-600'}`}>
                                                {app.projectId?.name || 'Sin Proyecto'}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{app.position}</span>
                                                <div className="flex gap-2 justify-end">
                                                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase ${app.preventionDocuments?.courses?.length > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                        {app.preventionDocuments?.courses?.length > 0 ? 'Malla OK' : 'Sin Malla'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3">
                        {activeTab === 'configuracion' ? (
                            <MallaConfigTab
                                type="prevention"
                                projects={projects}
                                initialProject={selectedApplicant?.projectId?._id}
                                initialPosition={selectedApplicant?.position}
                            />
                        ) : selectedApplicant ? (
                            <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
                                {/* Profile Bar */}
                                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-white to-white">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-indigo-200">
                                            {selectedApplicant.fullName.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-900 text-xl tracking-tight uppercase">{selectedApplicant.fullName}</h3>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedApplicant.position}</span>
                                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-1">
                                                    <ClipboardList size={10} /> {selectedApplicant.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Progreso</span>
                                            <span className="text-xl font-black text-indigo-600">{getProgress(selectedApplicant).percentage}%</span>
                                        </div>
                                        <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${getProgress(selectedApplicant).percentage}%` }}></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Check if curriculum is assigned */}
                                {(!selectedApplicant.preventionDocuments?.courses?.length && !selectedApplicant.preventionDocuments?.exams?.length) ? (
                                    <div className="bg-amber-50 border border-amber-200 rounded-[2.5rem] p-10 text-center space-y-6">
                                        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600">
                                            <AlertCircle size={40} />
                                        </div>
                                        <div className="max-w-md mx-auto">
                                            <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">Malla No Asignada</h4>
                                            <p className="text-sm text-slate-600 mt-2">
                                                Este postulante aún no tiene una malla de prevención configurada para el cargo <strong>{selectedApplicant.position}</strong>.
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleAssignCurriculum}
                                            disabled={loading}
                                            className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-xl flex items-center gap-3 mx-auto"
                                        >
                                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                            Asignar Malla Automáticamente
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-8 pb-32">
                                            {/* Prevention Section */}
                                            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                                                <div className="flex justify-between items-center mb-8">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                                            <ShieldCheck size={20} />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Cursos y Exámenes</h3>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Requisitos de Seguridad Industrial</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-8">
                                                    <div>
                                                        <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">
                                                            <BookOpen size={12} /> Cursos de Capacitación
                                                        </h4>
                                                        <div className="grid grid-cols-1 gap-3">
                                                            {selectedApplicant.preventionDocuments.courses?.map((item, idx) => renderItemRow('course', item, idx))}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">
                                                            <Activity size={12} /> Exámenes de Salud
                                                        </h4>
                                                        <div className="grid grid-cols-1 gap-3">
                                                            {selectedApplicant.preventionDocuments.exams?.map((item, idx) => renderItemRow('exam', item, idx))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Contract Docs View (Read Only for Context) */}
                                            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 opacity-80">
                                                <div className="flex justify-between items-center mb-8">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                                                            <FileText size={20} />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Expediente de Contratación</h3>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vista de Sincronización</p>
                                                        </div>
                                                    </div>
                                                    <div className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase flex items-center gap-2 border border-amber-100">
                                                        <AlertCircle size={12} /> Solo Lectura
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {selectedApplicant.contractDocuments?.map((doc) => (
                                                        <div key={doc._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                                                            <div className="flex-1 min-w-0 pr-4">
                                                                <p className="font-black text-[11px] uppercase truncate text-slate-700">{doc.docType}</p>
                                                                <span className={`text-[10px] font-bold ${doc.status === 'OK' || doc.status === 'Verificado' ? 'text-emerald-500' : 'text-slate-400'} uppercase`}>{doc.status}</span>
                                                            </div>
                                                            {doc.url && <a href={doc.url} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-indigo-600"><Eye size={16} /></a>}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Final Action Bar */}
                                            <div className="fixed bottom-12 right-12 left-auto z-40">
                                                <div className="bg-slate-900 shadow-2xl shadow-indigo-900/40 p-2 rounded-3xl border border-white/10 flex items-center gap-8 pl-8">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cobertura Prevención</span>
                                                        <span className="text-2xl font-black text-white">{getProgress(selectedApplicant).percentage}%</span>
                                                    </div>
                                                    <button
                                                        onClick={advanceToApproval}
                                                        disabled={getProgress(selectedApplicant).percentage < 100}
                                                        className={`px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center gap-3 ${getProgress(selectedApplicant).percentage >= 100 ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-xl shadow-emerald-600/20' : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'}`}
                                                    >
                                                        Validar Seguridad Integral <ShieldCheck size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="h-full min-h-[700px] flex flex-col items-center justify-center bg-slate-50/50 border-4 border-dashed border-slate-100 rounded-[3rem] text-slate-300 gap-6 animate-pulse">
                                <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-xl shadow-slate-200/50">
                                    <ShieldCheck size={40} className="text-slate-200" />
                                </div>
                                <div className="text-center space-y-2">
                                    <p className="font-black text-xl text-slate-400 uppercase tracking-widest">Acredita Prevención</p>
                                    <p className="text-sm font-bold text-slate-300">Seleccione un candidato para gestionar su acreditación de seguridad</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};

export default AcreditaPrevencion;
