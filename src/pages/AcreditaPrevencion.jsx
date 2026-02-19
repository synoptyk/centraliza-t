import React, { useState, useEffect } from 'react';
import { CheckCircle, Activity, BookOpen, User, Search, Upload, FileCheck, ShieldCheck, Tabs, Loader2, Eye, Save, Calendar, Check, X, FileText, ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import PageWrapper from '../components/PageWrapper';
import usePermissions from '../hooks/usePermissions';

const AcreditaPrevencion = ({ onOpenCENTRALIZAT, auth, onLogout }) => {
    const [applicants, setApplicants] = useState([]);
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const { canUpdate } = usePermissions('acreditacion-prevencion');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('physical'); // 'physical' or 'online'
    const [updatingItem, setUpdatingItem] = useState(null);

    const physicalExamsList = [
        'Altura Física',
        'Audiometría',
        'Gran Altura Geográfica',
        'Orina Completa',
        'Sílice',
        'Examen de Drogas (BAT)',
        'Evaluación Osteomuscular'
    ];

    const onlineExamsList = [
        'Inducción de Seguridad Hombre Nuevo',
        'Reglamento Interno de Orden, Higiene y Seguridad',
        'Derecho a Saber (DAS)',
        'Curso de Manejo Defensivo',
        'Inducción Específica del Cargo'
    ];

    const statusOptions = [
        'Pendiente',
        'Agendado',
        'Realizado',
        'No Realizado',
        'Aprobado',
        'No Aprobado'
    ];

    useEffect(() => {
        fetchApplicants();
    }, []);

    const fetchApplicants = async () => {
        setLoading(true);
        try {
            const res = await api.get('/applicants');
            // Filter applicants who are in Accreditation or close to it
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

    const handleUpdateItem = async (type, itemName, data) => {
        if (!selectedApplicant) return;
        setUpdatingItem(`${type}-${itemName}`);

        try {
            const formData = new FormData();
            if (data.status) formData.append('status', data.status);
            if (data.observation !== undefined) formData.append('observation', data.observation);
            if (data.file) formData.append('file', data.file);

            const res = await api.put(
                `/applicants/${selectedApplicant._id}/accreditation/${type}/${itemName}`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            setSelectedApplicant(res.data);
            toast.success(`Actualizado: ${itemName}`);
            fetchApplicants();
        } catch (error) {
            toast.error('Error al actualizar ítem');
        } finally {
            setUpdatingItem(null);
        }
    };

    const getItemData = (type, itemName) => {
        const items = type === 'physical' ? selectedApplicant?.accreditation?.physicalExams : selectedApplicant?.accreditation?.onlineExams;
        return items?.find(i => i.name === itemName) || { status: 'Pendiente', observation: '' };
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

    const renderItemRow = (type, itemName, idx) => {
        const itemData = getItemData(type, itemName);
        const isUpdating = updatingItem === `${type}-${itemName}`;

        return (
            <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                    {/* Name & Icon */}
                    <div className="flex items-center gap-4 md:w-1/3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${itemData.status === 'Aprobado' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                            {type === 'physical' ? <Activity size={20} /> : <BookOpen size={20} />}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-slate-800 text-sm tracking-tight">{itemName}</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Requisito Obligatorio</span>
                        </div>
                    </div>

                    {/* Status Select */}
                    <div className="md:w-1/5">
                        <select
                            className={`w-full p-2.5 rounded-xl text-xs font-bold border-2 transition-all outline-none ${itemData.status === 'Aprobado' ? 'border-emerald-100 bg-emerald-50 text-emerald-700' :
                                itemData.status === 'No Aprobado' ? 'border-red-100 bg-red-50 text-red-700' :
                                    'border-slate-100 bg-slate-50 text-slate-600'
                                }`}
                            value={itemData.status}
                            onChange={(e) => handleUpdateItem(type, itemName, { status: e.target.value })}
                            disabled={isUpdating}
                        >
                            {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>

                    {/* Observation */}
                    <div className="md:w-1/4">
                        <input
                            type="text"
                            placeholder="Observaciones..."
                            className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            value={itemData.observation || ''}
                            onBlur={(e) => handleUpdateItem(type, itemName, { observation: e.target.value })}
                            disabled={isUpdating}
                        />
                    </div>

                    {/* Actions (File Upload/View) */}
                    <div className="flex items-center gap-3 md:w-1/6 justify-end">
                        {itemData.url && (
                            <a href={itemData.url} target="_blank" rel="noreferrer" className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all shadow-sm" title="Ver Certificado">
                                <Eye size={18} />
                            </a>
                        )}
                        <div className="relative group/upload">
                            <input
                                type="file"
                                accept=".pdf"
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                onChange={(e) => handleUpdateItem(type, itemName, { file: e.target.files[0] })}
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

    return (
        <PageWrapper
            className="space-y-8"
            title="CERTIFICACIÓN DE SEGURIDAD INTEGRAL"
            subtitle="Validación de seguridad y prevención de riesgos"
            icon={ShieldCheck}
            auth={auth}
            onLogout={onLogout}
            headerActions={
                <div className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-bold border border-white/20 text-white">
                    <Loader2 size={14} className={loading ? 'animate-spin' : ''} />
                    {loading ? 'Sincronizando...' : 'Conectado'}
                </div>
            }
        >

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Applicant Sidebar */}
                <div className="lg:col-span-1 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[700px]">
                    <div className="p-5 bg-slate-50 border-b border-slate-100">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Buscar candidato..."
                                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                        {applicants.map(app => (
                            <div
                                key={app._id}
                                className={`w-full p-5 text-left flex items-start justify-between transition-all hover:bg-emerald-50 group border-b border-slate-50 ${selectedApplicant?._id === app._id ? 'bg-emerald-50 border-r-4 border-emerald-600 shadow-inner' : ''}`}
                            >
                                <button
                                    onClick={() => setSelectedApplicant(app)}
                                    className="flex-1 flex flex-col gap-1 pr-2"
                                >
                                    <span className="font-bold text-slate-800 tracking-tight group-hover:text-emerald-600 transition-colors uppercase text-sm">{app.fullName}</span>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{app.position}</span>
                                        <div className="flex gap-2 justify-end">
                                            {canUpdate && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedApplicant(app);
                                                        setShowModal(true);
                                                    }}
                                                    className="px-4 py-2 bg-orange-500 text-white text-xs font-bold rounded-xl hover:bg-orange-600 transition-all shadow-md shadow-orange-200"
                                                >
                                                    Gestionar Acreditación
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => onOpenCENTRALIZAT(app)}
                                    className="p-2 bg-white text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm opacity-0 group-hover:opacity-100"
                                >
                                    <ExternalLink size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3">
                    {selectedApplicant ? (
                        <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
                            {/* Profile Bar */}
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/50 to-white">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-emerald-200">
                                        {selectedApplicant.fullName.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-900 text-xl tracking-tight uppercase">{selectedApplicant.fullName}</h3>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedApplicant.position}</span>
                                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                                                <ClipboardList size={10} /> {selectedApplicant.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sub-menu Tabs */}
                            <div className="flex p-1 bg-slate-100 rounded-2xl w-fit">
                                <button
                                    onClick={() => setActiveTab('physical')}
                                    className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'physical' ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    <Activity size={16} /> Exámenes Físicos
                                </button>
                                <button
                                    onClick={() => setActiveTab('online')}
                                    className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'online' ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    <BookOpen size={16} /> Cursos Online
                                </button>
                            </div>

                            {/* Items List */}
                            <div className="space-y-3">
                                {(activeTab === 'physical' ? physicalExamsList : onlineExamsList).map((itemName, idx) =>
                                    renderItemRow(activeTab, itemName, idx)
                                )}
                            </div>

                            {/* Final Action */}
                            <div className="flex justify-between items-center bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl shadow-slate-300 text-white overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <ShieldCheck size={160} />
                                </div>
                                <div className="flex flex-col relative z-10 transition-all">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Acreditación y Prevención Final</span>
                                    <span className="text-2xl font-black tracking-tight">
                                        Validación Integral de Seguridad
                                    </span>
                                    <p className="text-xs text-slate-400 mt-2 font-medium">Asegúrese de haber revisado todos los certificados antes de aprobar.</p>
                                </div>
                                <button
                                    onClick={advanceToApproval}
                                    className="relative z-10 bg-emerald-500 text-white px-10 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-3 active:scale-95"
                                >
                                    Habilitar para Contratación <ShieldCheck size={20} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full min-h-[700px] flex flex-col items-center justify-center bg-slate-50/50 border-4 border-dashed border-slate-100 rounded-[3rem] text-slate-300 gap-6 animate-pulse">
                            <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-xl shadow-slate-200/50">
                                <Activity size={40} className="opacity-20 translate-x-1" />
                            </div>
                            <div className="text-center space-y-2">
                                <p className="font-black text-xl text-slate-400 uppercase tracking-widest">Acredita Prevención</p>
                                <p className="text-sm font-bold text-slate-300">Seleccione un candidato para gestionar sus exámenes y cursos</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PageWrapper>
    );
};

export default AcreditaPrevencion;
