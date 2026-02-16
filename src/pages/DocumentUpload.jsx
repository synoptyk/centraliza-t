import React, { useState, useEffect } from 'react';
import { FileText, Upload, CheckCircle2, Search, Loader2, Eye, Check, X, Settings, BookOpen, ClipboardList, Send, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import PageWrapper from '../components/PageWrapper';
import usePermissions from '../hooks/usePermissions';
import CurriculumManager from '../components/CurriculumManager';

const DocumentUpload = ({ onOpenRECLUTANDO, auth, onLogout }) => {
    const [applicants, setApplicants] = useState([]);
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const { canUpdate } = usePermissions('documentos');
    const [loading, setLoading] = useState(false);
    const [uploadingDoc, setUploadingDoc] = useState(null);
    const [showCurriculumManager, setShowCurriculumManager] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // 10 documentos universales de contratación
    const contractDocuments = [
        'Currículum Vitae',
        'Certificado de Antecedentes Original Vigente',
        'Certificado Afiliación AFP - 12 cotizaciones',
        'Certificado Isapre o Fonasa (valor plan)',
        'Certificado estudios Enseñanza Media o Superior',
        '2 fotografías color fondo blanco, tamaño pasaporte',
        'Finiquito último empleador o carta renuncia',
        'Fotocopia Carné de Identidad (ambos lados)',
        'Certificados de Asignación familiar',
        'Certificado de Residencia'
    ];

    useEffect(() => {
        fetchApplicants();
    }, []);

    const fetchApplicants = async () => {
        setLoading(true);
        try {
            const res = await api.get('/applicants');
            // Filter: Only applicants who completed technical evaluation
            const filtered = res.data.filter(app =>
                app.tests?.psycholaborTest?.status === 'Completado'
            );
            setApplicants(filtered);

            if (selectedApplicant) {
                const updated = filtered.find(a => a._id === selectedApplicant._id);
                setSelectedApplicant(updated);
            }
        } catch (error) {
            console.error('Error fetching applicants:', error);
            toast.error('Error al cargar postulantes');
        } finally {
            setLoading(false);
        }
    };

    // Upload contract document
    const handleContractUpload = async (e, docType) => {
        if (!selectedApplicant) return;
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
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

    // Upload prevention document (course/exam)
    const handlePreventionUpload = async (e, type, itemCode) => {
        if (!selectedApplicant) return;
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
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
            toast.error(error.response?.data?.message || 'Error al subir documento');
        } finally {
            setUploadingDoc(null);
        }
    };

    // Update contract document status
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

    // Update prevention document status
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

    // Assign prevention curriculum
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

    const getContractDoc = (docType) => {
        return selectedApplicant?.contractDocuments?.find(d => d.docType === docType);
    };

    const getProgress = (app) => {
        // Contract docs progress
        const contractTotal = contractDocuments.length;
        const contractOK = app.contractDocuments?.filter(d => d.status === 'OK').length || 0;

        // Prevention docs progress
        const coursesTotal = app.preventionDocuments?.courses?.length || 0;
        const coursesOK = app.preventionDocuments?.courses?.filter(c => c.status === 'Completado').length || 0;

        const examsTotal = app.preventionDocuments?.exams?.length || 0;
        const examsOK = app.preventionDocuments?.exams?.filter(e => e.status === 'Completado').length || 0;

        const total = contractTotal + coursesTotal + examsTotal;
        const completed = contractOK + coursesOK + examsOK;

        return {
            total,
            completed,
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
            await api.put(`/applicants/${selectedApplicant._id}/status`, {
                status: 'Acreditación'
            });
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

    const hasPreventionDocs = selectedApplicant?.preventionDocuments?.courses?.length > 0 ||
        selectedApplicant?.preventionDocuments?.exams?.length > 0;

    return (
        <PageWrapper
            className="space-y-8"
            title="CARGA DOCUMENTAL"
            subtitle="Gestión de documentación de contratación y prevención"
            icon={FileText}
            auth={auth}
            onLogout={onLogout}
        >
            {/* Header Actions */}
            <div className="flex justify-end">
                <button
                    onClick={() => setShowCurriculumManager(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-bold text-sm"
                >
                    <Settings size={18} />
                    Configurar Mallas Curriculares
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Applicants List */}
                <div className="lg:col-span-1 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[700px]">
                    <div className="p-5 bg-slate-50 border-b border-slate-100">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Buscar postulante..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                        </div>
                        <p className="text-xs text-slate-500 font-bold mt-2 text-center">
                            {filteredApplicants.length} candidatos con test completado
                        </p>
                    </div>
                    <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                        {filteredApplicants.map(app => {
                            const prog = getProgress(app);

                            return (
                                <div
                                    key={app._id}
                                    className={`w-full p-5 text-left transition-all hover:bg-indigo-50 group ${selectedApplicant?._id === app._id ? 'bg-indigo-50 border-r-4 border-indigo-600' : ''
                                        }`}
                                >
                                    <button
                                        onClick={() => setSelectedApplicant(app)}
                                        className="w-full flex flex-col gap-2"
                                    >
                                        <span className="font-bold text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors uppercase text-sm">
                                            {app.fullName}
                                        </span>
                                        <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
                                            {app.position}
                                        </span>
                                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all"
                                                style={{ width: `${prog.percentage}%` }}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between text-[10px]">
                                            <span className="font-bold text-slate-500">
                                                {prog.completed}/{prog.total} items
                                            </span>
                                            <span className="font-black text-indigo-600">
                                                {prog.percentage}%
                                            </span>
                                        </div>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Document Management Section */}
                <div className="lg:col-span-3">
                    {selectedApplicant ? (
                        <div className="space-y-6">
                            {/* Profile Header */}
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-xl font-black shadow-lg">
                                            {selectedApplicant.fullName.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-900 text-xl tracking-tight uppercase">
                                                {selectedApplicant.fullName}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                    {selectedApplicant.position}
                                                </span>
                                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
                                                    Test Completado
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {!hasPreventionDocs && (
                                        <button
                                            onClick={assignPreventionCurriculum}
                                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all font-bold text-sm"
                                        >
                                            <Send size={18} />
                                            Asignar Malla de Prevención
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Section 1: Contract Documentation */}
                            <ContractDocumentsSection
                                documents={contractDocuments}
                                getContractDoc={getContractDoc}
                                onUpload={handleContractUpload}
                                onUpdateStatus={updateContractStatus}
                                uploadingDoc={uploadingDoc}
                                progress={getProgress(selectedApplicant).contract}
                            />

                            {/* Section 2: Prevention Documentation */}
                            {hasPreventionDocs && (
                                <PreventionDocumentsSection
                                    courses={selectedApplicant.preventionDocuments.courses}
                                    exams={selectedApplicant.preventionDocuments.exams}
                                    onUpload={handlePreventionUpload}
                                    onUpdateStatus={updatePreventionStatus}
                                    uploadingDoc={uploadingDoc}
                                    progress={getProgress(selectedApplicant).prevention}
                                />
                            )}

                            {/* Action Footer */}
                            <div className="flex justify-between items-center bg-slate-900 p-6 rounded-3xl shadow-xl text-white">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Progreso Total
                                    </span>
                                    <span className="text-xl font-black">
                                        {getProgress(selectedApplicant).completed} / {getProgress(selectedApplicant).total} Completados
                                    </span>
                                </div>
                                <button
                                    onClick={advanceStage}
                                    className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-lg disabled:opacity-30 flex items-center gap-3"
                                    disabled={getProgress(selectedApplicant).completed < getProgress(selectedApplicant).total}
                                >
                                    Pasar a Acreditación <CheckCircle2 size={18} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full min-h-[700px] flex flex-col items-center justify-center bg-slate-50/50 border-4 border-dashed border-slate-100 rounded-[3rem] text-slate-300">
                            <FileText size={64} className="opacity-20 mb-4" />
                            <p className="font-black text-xl text-slate-400 uppercase tracking-widest">
                                Selecciona un Postulante
                            </p>
                            <p className="text-sm font-bold text-slate-300 mt-2">
                                Solo se muestran candidatos que completaron la evaluación técnica
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Curriculum Manager Modal */}
            {showCurriculumManager && (
                <CurriculumManager onClose={() => setShowCurriculumManager(false)} />
            )}
        </PageWrapper>
    );
};

// Contract Documents Section Component
const ContractDocumentsSection = ({ documents, getContractDoc, onUpload, onUpdateStatus, uploadingDoc, progress }) => {
    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FileText size={20} className="text-indigo-600" />
                        <div>
                            <h4 className="font-black text-slate-800 text-sm uppercase tracking-widest">
                                Documentación de Contratación
                            </h4>
                            <p className="text-xs text-slate-500 font-bold mt-0.5">
                                Documentos universales requeridos para todos los postulantes
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm">
                        <span className="text-xs font-bold text-slate-500">
                            {progress.completed}/{progress.total}
                        </span>
                        <div className="w-16 bg-slate-200 rounded-full h-2">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all"
                                style={{ width: `${Math.round((progress.completed / progress.total) * 100)}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
                {documents.map((docName, idx) => {
                    const docInfo = getContractDoc(docName);
                    const isUploaded = !!docInfo;
                    const uploadKey = `contract-${docName}`;

                    return (
                        <div key={idx} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-all">
                            <div className="flex items-center gap-4 flex-1">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${docInfo?.status === 'OK' ? 'bg-emerald-100 text-emerald-600' :
                                        docInfo?.status === 'Rechazado' ? 'bg-red-100 text-red-600' :
                                            isUploaded ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'
                                    }`}>
                                    {idx + 1}
                                </div>
                                <div className="flex flex-col flex-1">
                                    <span className={`text-sm font-bold ${isUploaded ? 'text-slate-900' : 'text-slate-600'}`}>
                                        {docName}
                                    </span>
                                    {docInfo && (
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase">
                                                {new Date(docInfo.uploadDate).toLocaleDateString()}
                                            </span>
                                            {docInfo.reviewedBy && (
                                                <>
                                                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                    <span className="text-[10px] text-slate-400 font-bold">
                                                        Revisado por {docInfo.reviewedBy}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {docInfo ? (
                                    <>
                                        <a href={docInfo.url} target="_blank" rel="noreferrer" className="p-2 text-indigo-500 hover:bg-indigo-100 rounded-xl transition-all">
                                            <Eye size={18} />
                                        </a>
                                        <div className="flex border border-slate-200 rounded-xl overflow-hidden">
                                            <button
                                                onClick={() => onUpdateStatus(docInfo._id, 'OK')}
                                                className={`p-2 transition-all ${docInfo.status === 'OK' ? 'bg-emerald-500 text-white' : 'hover:bg-emerald-50 text-emerald-500'}`}
                                                title="Aprobar"
                                            >
                                                <Check size={16} />
                                            </button>
                                            <button
                                                onClick={() => onUpdateStatus(docInfo._id, 'Rechazado')}
                                                className={`p-2 transition-all ${docInfo.status === 'Rechazado' ? 'bg-red-500 text-white' : 'hover:bg-red-50 text-red-500'}`}
                                                title="Rechazar"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                            onChange={(e) => onUpload(e, docName)}
                                            disabled={uploadingDoc === uploadKey}
                                        />
                                        <button className={`flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${uploadingDoc === uploadKey ? 'bg-slate-50 border-slate-200' : 'border-indigo-200 text-indigo-500 hover:bg-indigo-50'
                                            }`}>
                                            {uploadingDoc === uploadKey ? (
                                                <>
                                                    <Loader2 size={14} className="animate-spin" /> Subiendo...
                                                </>
                                            ) : (
                                                <>
                                                    <Upload size={14} /> Subir PDF
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Prevention Documents Section Component
const PreventionDocumentsSection = ({ courses, exams, onUpload, onUpdateStatus, uploadingDoc, progress }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'Completado': return 'bg-emerald-100 text-emerald-700';
            case 'En Proceso': return 'bg-amber-100 text-amber-700';
            case 'Rechazado': return 'bg-red-100 text-red-700';
            case 'Vencido': return 'bg-orange-100 text-orange-700';
            default: return 'bg-slate-100 text-slate-500';
        }
    };

    const totalPrevention = progress.courses.total + progress.exams.total;
    const completedPrevention = progress.courses.completed + progress.exams.completed;

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-slate-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertCircle size={20} className="text-purple-600" />
                        <div>
                            <h4 className="font-black text-slate-800 text-sm uppercase tracking-widest">
                                Documentación de Prevención
                            </h4>
                            <p className="text-xs text-slate-500 font-bold mt-0.5">
                                Cursos y exámenes específicos según el cargo
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm">
                        <span className="text-xs font-bold text-slate-500">
                            {completedPrevention}/{totalPrevention}
                        </span>
                        <div className="w-16 bg-slate-200 rounded-full h-2">
                            <div
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-600 rounded-full transition-all"
                                style={{ width: `${totalPrevention > 0 ? Math.round((completedPrevention / totalPrevention) * 100) : 0}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Courses Subsection */}
            {courses && courses.length > 0 && (
                <div className="border-b border-slate-100">
                    <div className="px-6 py-3 bg-slate-50">
                        <div className="flex items-center gap-2">
                            <BookOpen size={16} className="text-purple-500" />
                            <h5 className="font-black text-slate-700 text-xs uppercase tracking-widest">
                                Cursos Requeridos ({progress.courses.completed}/{progress.courses.total})
                            </h5>
                        </div>
                    </div>
                    <div className="divide-y divide-slate-50 max-h-[300px] overflow-y-auto">
                        {courses.map((course, idx) => {
                            const uploadKey = `prevention-course-${course.courseCode}`;
                            return (
                                <div key={idx} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-all">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${course.status === 'Completado' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                                            }`}>
                                            {idx + 1}
                                        </div>
                                        <div className="flex flex-col flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-slate-900">{course.courseName}</span>
                                                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${getStatusColor(course.status)}`}>
                                                    {course.status}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                                                {course.courseCode} - {course.category}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {course.certificateUrl ? (
                                            <>
                                                <a href={course.certificateUrl} target="_blank" rel="noreferrer" className="p-2 text-purple-500 hover:bg-purple-100 rounded-xl transition-all">
                                                    <Eye size={18} />
                                                </a>
                                                <div className="flex border border-slate-200 rounded-xl overflow-hidden">
                                                    <button
                                                        onClick={() => onUpdateStatus('course', course.courseCode, 'Completado')}
                                                        className={`p-2 transition-all ${course.status === 'Completado' ? 'bg-emerald-500 text-white' : 'hover:bg-emerald-50 text-emerald-500'}`}
                                                    >
                                                        <Check size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => onUpdateStatus('course', course.courseCode, 'Rechazado')}
                                                        className={`p-2 transition-all ${course.status === 'Rechazado' ? 'bg-red-500 text-white' : 'hover:bg-red-50 text-red-500'}`}
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    accept=".pdf"
                                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                    onChange={(e) => onUpload(e, 'course', course.courseCode)}
                                                    disabled={uploadingDoc === uploadKey}
                                                />
                                                <button className={`flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${uploadingDoc === uploadKey ? 'bg-slate-50 border-slate-200' : 'border-purple-200 text-purple-500 hover:bg-purple-50'
                                                    }`}>
                                                    {uploadingDoc === uploadKey ? (
                                                        <>
                                                            <Loader2 size={14} className="animate-spin" /> Subiendo...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Upload size={14} /> Subir Certificado
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Exams Subsection */}
            {exams && exams.length > 0 && (
                <div>
                    <div className="px-6 py-3 bg-slate-50">
                        <div className="flex items-center gap-2">
                            <ClipboardList size={16} className="text-purple-500" />
                            <h5 className="font-black text-slate-700 text-xs uppercase tracking-widest">
                                Exámenes Requeridos ({progress.exams.completed}/{progress.exams.total})
                            </h5>
                        </div>
                    </div>
                    <div className="divide-y divide-slate-50 max-h-[300px] overflow-y-auto">
                        {exams.map((exam, idx) => {
                            const uploadKey = `prevention-exam-${exam.examCode}`;
                            return (
                                <div key={idx} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-all">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${exam.status === 'Completado' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                                            }`}>
                                            {idx + 1}
                                        </div>
                                        <div className="flex flex-col flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-slate-900">{exam.examName}</span>
                                                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${getStatusColor(exam.status)}`}>
                                                    {exam.status}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                                                {exam.examCode} - {exam.category}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {exam.resultUrl ? (
                                            <>
                                                <a href={exam.resultUrl} target="_blank" rel="noreferrer" className="p-2 text-purple-500 hover:bg-purple-100 rounded-xl transition-all">
                                                    <Eye size={18} />
                                                </a>
                                                <div className="flex border border-slate-200 rounded-xl overflow-hidden">
                                                    <button
                                                        onClick={() => onUpdateStatus('exam', exam.examCode, 'Completado')}
                                                        className={`p-2 transition-all ${exam.status === 'Completado' ? 'bg-emerald-500 text-white' : 'hover:bg-emerald-50 text-emerald-500'}`}
                                                    >
                                                        <Check size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => onUpdateStatus('exam', exam.examCode, 'Rechazado')}
                                                        className={`p-2 transition-all ${exam.status === 'Rechazado' ? 'bg-red-500 text-white' : 'hover:bg-red-50 text-red-500'}`}
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    accept=".pdf"
                                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                    onChange={(e) => onUpload(e, 'exam', exam.examCode)}
                                                    disabled={uploadingDoc === uploadKey}
                                                />
                                                <button className={`flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${uploadingDoc === uploadKey ? 'bg-slate-50 border-slate-200' : 'border-purple-200 text-purple-500 hover:bg-purple-50'
                                                    }`}>
                                                    {uploadingDoc === uploadKey ? (
                                                        <>
                                                            <Loader2 size={14} className="animate-spin" /> Subiendo...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Upload size={14} /> Subir Resultado
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentUpload;
