import React, { useState, useEffect } from 'react';
import {
    FileText, Sparkles, Download, Save, Users, History,
    FilePlus, ChevronRight, Loader2, CheckCircle, AlertCircle,
    Building2, Calendar, DollarSign, UserCheck, Search, X, Printer
} from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import PageWrapper from '../components/PageWrapper';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import axios from 'axios';
import PrintConfigModal from '../components/PrintConfigModal';

const ContractManager = ({ auth, onLogout }) => {
    const [applicants, setApplicants] = useState([]);
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const [contracts, setContracts] = useState([]);
    const [selectedContract, setSelectedContract] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('');
    const [view, setView] = useState('list'); // 'list' | 'editor'
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingApplicant, setEditingApplicant] = useState(null);
    const [statusFilter, setStatusFilter] = useState('All');
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [printMode, setPrintMode] = useState('download');
    const [printingContractId, setPrintingContractId] = useState(null);
    const [printingTitle, setPrintingTitle] = useState('Contrato');

    useEffect(() => {
        fetchApprovedApplicants();
        fetchContracts();
    }, []);

    const fetchApprovedApplicants = async () => {
        try {
            const res = await api.get('/applicants');
            // Traer todos los que tienen relevancia para este módulo
            const relevant = res.data.filter(app =>
                ['Aprobado para Contratación', 'Contratado'].includes(app.status)
            );
            setApplicants(relevant);
        } catch (error) {
            toast.error('Error al cargar candidatos');
        }
    };

    const fetchContracts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/contracts');
            setContracts(res.data);
        } catch (error) {
            console.error('Error al cargar contratos');
        } finally {
            setLoading(false);
        }
    };

    const generateInitialContract = (applicant) => {
        setSelectedApplicant(applicant);
        const today = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: es });
        const companyName = auth?.company?.name || 'LA EMPRESA';
        const companyTaxId = auth?.company?.taxId || 'N/A';
        const representative = auth?.name;
        const startDate = applicant.workerData?.contract?.startDate
            ? format(new Date(applicant.workerData.contract.startDate), "dd 'de' MMMM 'de' yyyy", { locale: es })
            : today;

        const template = `
            <div style="font-family: 'Helvetica', 'Arial', sans-serif; line-height: 1.5; color: #334155; padding: 50px; max-width: 800px; margin: auto; background: white;">
                <!-- Header -->
                <div style="text-align: center; margin-bottom: 40px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px;">
                    <h1 style="color: #0f172a; font-size: 24px; font-weight: 800; text-transform: uppercase; margin: 0; letter-spacing: -0.025em;">Contrato Individual de Trabajo</h1>
                    <p style="color: #64748b; font-size: 12px; font-weight: 600; margin-top: 5px; text-transform: uppercase; tracking-widest: 0.1em;">Documento de Validez Legal - Centraliza-T</p>
                </div>

                <!-- Comparecientes -->
                <p style="text-align: justify; margin-bottom: 25px;">
                    En la ciudad de Santiago de Chile, a ${today}, entre la empresa <strong>${companyName}</strong>, 
                    RUT número <strong>${companyTaxId}</strong>, representada legalmente por don(ña) <strong>${representative}</strong>, 
                    en adelante "el Empleador"; y don(ña) <strong>${applicant.fullName}</strong>, cédula de identidad número <strong>${applicant.rut}</strong>, 
                    nacionalidad <strong>${applicant.country === 'CL' ? 'Chilena' : (applicant.country || 'N/A')}</strong>, 
                    con domicilio en <strong>${applicant.address || '________________________'}</strong>, 
                    en adelante "el Trabajador", se ha convenido el siguiente contrato de trabajo:
                </p>

                <!-- Cláusulas -->
                <div style="margin-top: 30px;">
                    <section style="margin-bottom: 20px;">
                        <h3 style="color: #4f46e5; font-size: 13px; font-weight: 800; text-transform: uppercase; margin-bottom: 10px; border-left: 4px solid #4f46e5; padding-left: 10px;">PRIMERO: Naturaleza de los Servicios</h3>
                        <p style="text-align: justify; margin: 0;">
                            El Trabajador se obliga a desempeñar el cargo de <strong>${applicant.position}</strong>. Sus funciones incluirán, pero no se limitarán a, todas aquellas tareas inherentes a su posición y las instrucciones impartidas por su supervisor directo para el correcto cumplimiento de los objetivos de la Empresa.
                        </p>
                    </section>

                    <section style="margin-bottom: 20px;">
                        <h3 style="color: #4f46e5; font-size: 13px; font-weight: 800; text-transform: uppercase; margin-bottom: 10px; border-left: 4px solid #4f46e5; padding-left: 10px;">SEGUNDO: Lugar de Trabajo y Jornada</h3>
                        <p style="text-align: justify; margin: 0;">
                            El Trabajador prestará sus servicios en las dependencias del Empleador o donde este designe por razones operativas. 
                            La jornada ordinaria de trabajo será de 44 horas semanales, distribuidas de lunes a viernes en horario administrativo.
                        </p>
                    </section>

                    <section style="margin-bottom: 20px;">
                        <h3 style="color: #4f46e5; font-size: 13px; font-weight: 800; text-transform: uppercase; margin-bottom: 10px; border-left: 4px solid #4f46e5; padding-left: 10px;">TERCERO: Remuneración</h3>
                        <p style="text-align: justify; margin: 0;">
                            El Empleador pagará al Trabajador una remuneración mensual líquida de <strong>$${parseInt(applicant.workerData?.financial?.liquidSalary || 0).toLocaleString('es-CL')}</strong>. 
                            Dicha suma será cancelada el último día hábil de cada mes mediante transferencia electrónica.
                        </p>
                    </section>

                    <section style="margin-bottom: 20px;">
                        <h3 style="color: #4f46e5; font-size: 13px; font-weight: 800; text-transform: uppercase; margin-bottom: 10px; border-left: 4px solid #4f46e5; padding-left: 10px;">CUARTO: Vigencia</h3>
                        <p style="text-align: justify; margin: 0;">
                            Este contrato tendrá una vigencia de carácter <strong>${applicant.workerData?.contract?.type || 'Indefinido'}</strong>, iniciando formalmente sus funciones con fecha <strong>${startDate}</strong>.
                        </p>
                    </section>

                    <section style="margin-bottom: 20px;">
                        <h3 style="color: #4f46e5; font-size: 13px; font-weight: 800; text-transform: uppercase; margin-bottom: 10px; border-left: 4px solid #4f46e5; padding-left: 10px;">QUINTO: Confidencialidad</h3>
                        <p style="text-align: justify; margin: 0; font-style: italic; font-size: 12px;">
                            El Trabajador se obliga a mantener absoluta reserva respecto de toda información, datos, procesos o secretos comerciales de la Empresa a los que tenga acceso en el ejercicio de sus funciones.
                        </p>
                    </section>
                </div>

                <!-- Firmas -->
                <div style="margin-top: 80px; display: flex; justify-content: space-between; gap: 50px;">
                    <div style="flex: 1; text-align: center; border-top: 1px solid #94a3b8; padding-top: 15px;">
                        <p style="font-size: 10px; font-weight: 800; margin: 0; text-transform: uppercase;">Por el Empleador</p>
                        <p style="font-size: 10px; color: #64748b; margin-top: 5px;">${companyName}</p>
                    </div>
                    <div style="flex: 1; text-align: center; border-top: 1px solid #94a3b8; padding-top: 15px;">
                        <p style="font-size: 10px; font-weight: 800; margin: 0; text-transform: uppercase;">El Trabajador</p>
                        <p style="font-size: 10px; color: #64748b; margin-top: 5px;">${applicant.fullName}</p>
                    </div>
                </div>

                <!-- Footer -->
                <div style="margin-top: 60px; text-align: center; color: #cbd5e1; font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">
                    Generado automáticamente por el Ecosistema Smart Digital de Centraliza-T
                </div>
            </div>
        `;

        setContent(template);
        setTitle(`Contrato de Trabajo - ${applicant.fullName}`);
        setView('editor');
    };

    const handleSave = async () => {
        setGenerating(true);
        try {
            const payload = {
                applicantId: selectedApplicant._id,
                title,
                type: 'Contrato Inicial',
                content,
                hiringDetails: {
                    salary: selectedApplicant.workerData?.financial?.liquidSalary,
                    position: selectedApplicant.position,
                    startDate: selectedApplicant.workerData?.contract?.startDate
                }
            };

            await api.post('/contracts', payload);

            // ACTUALIZACIÓN LÓGICA: Ahora el estado pasa a ser oficialmente 'Contratado'
            await api.put(`/applicants/${selectedApplicant._id}`, { status: 'Contratado' });

            toast.success('Contrato Formalizado y Archivado');
            fetchContracts();
            fetchApprovedApplicants();
            setView('list');
        } catch (error) {
            toast.error('Error al guardar documento');
        } finally {
            setGenerating(false);
        }
    };

    const downloadPDF = async (config, mode = 'download') => {
        if (!printingContractId) return;

        const loadingToast = toast.loading(mode === 'print' ? 'Preparando impresión...' : 'Generando contrato...');

        try {
            // Convert config to query params
            const queryParams = new URLSearchParams({
                format: config.format,
                margin: config.margin,
                fitToPage: config.fitToPage ? 'true' : 'false'
            }).toString();

            const response = await api.get(`/contracts/${printingContractId}/pdf?${queryParams}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));

            if (mode === 'print') {
                const printWindow = window.open(url, '_blank');
                if (printWindow) {
                    printWindow.onload = () => {
                        printWindow.print();
                    };
                    toast.success('Contrato listo para impresión', { id: loadingToast });
                } else {
                    toast.error('Por favor, permite las ventanas emergentes', { id: loadingToast });
                }
            } else {
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `${printingTitle}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                toast.success('Contrato descargado exitosamente', { id: loadingToast });
            }
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error('Error al generar PDF', { id: loadingToast });
        } finally {
            setIsPrintModalOpen(false);
        }
    };

    const handleQuickUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/applicants/${editingApplicant._id}`, editingApplicant);
            toast.success('Datos actualizados');
            setIsEditModalOpen(false);
            fetchApprovedApplicants();
        } catch (error) {
            toast.error('Error al actualizar');
        }
    };

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['clean']
        ],
    };

    return (
        <PageWrapper
            className="space-y-8 animate-in fade-in duration-500"
            title="CONTRATACIONES"
            subtitle="Inteligencia Contractual de próxima generación"
            icon={FileText}
            auth={auth}
            onLogout={onLogout}
        >
            {view === 'list' ? (
                <div className="space-y-6">
                    {/* Header Controls */}
                    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6 flex-1">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="BUSCAR POSTULANTE..."
                                    className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border-none rounded-2xl text-xs font-black text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all uppercase tracking-widest"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <select
                                className="bg-slate-50 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 border-none focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="All">TODOS LOS ESTADOS</option>
                                <option value="Aprobado para Contratación">PENDIENTES</option>
                                <option value="Contratado">CONTRATADOS</option>
                            </select>
                        </div>
                        <div className="flex gap-3">
                            <div className="px-6 py-3.5 bg-indigo-50 rounded-2xl text-[10px] font-black uppercase text-indigo-600 border border-indigo-100">
                                Total: {applicants.length} Postulantes
                            </div>
                        </div>
                    </div>

                    {/* Main Table Container */}
                    <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900">
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Postulante</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Cargo / Proyecto</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Sueldo Base</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Estado</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {applicants
                                    .filter(app => {
                                        const matchesSearch = app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || app.rut.includes(searchTerm);
                                        const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
                                        return matchesSearch && matchesStatus;
                                    })
                                    .map(app => (
                                        <tr key={app._id} className="group hover:bg-slate-50/80 transition-all">
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-lg font-black group-hover:scale-110 transition-transform">
                                                        {app.fullName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-900 uppercase tracking-tight text-sm">{app.fullName}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{app.rut}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <p className="font-bold text-slate-600 text-xs uppercase">{app.position}</p>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Proyecto Centraliza-T</span>
                                                    <span className="mx-1 text-slate-300">•</span>
                                                    <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-widest">{app.workerData?.contract?.type || 'Indefinido'}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <p className="font-black text-slate-800 text-sm italic">${parseInt(app.workerData?.financial?.liquidSalary || 0).toLocaleString()}</p>
                                            </td>
                                            <td className="px-10 py-8">
                                                <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ${app.status === 'Contratado'
                                                    ? 'bg-emerald-500 text-white'
                                                    : 'bg-amber-100 text-amber-600 border border-amber-200'
                                                    }`}>
                                                    {app.status === 'Aprobado para Contratación' ? 'Pendiente Formalización' : app.status}
                                                </span>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex justify-end gap-3">
                                                    <button
                                                        onClick={() => {
                                                            setEditingApplicant(app);
                                                            setIsEditModalOpen(true);
                                                        }}
                                                        className="p-3 bg-white text-slate-400 border border-slate-100 rounded-2xl hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
                                                        title="Editar Datos"
                                                    >
                                                        <ChevronRight size={18} />
                                                    </button>

                                                    {app.status === 'Aprobado para Contratación' ? (
                                                        <button
                                                            onClick={() => generateInitialContract(app)}
                                                            className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2 group/btn"
                                                        >
                                                            <Sparkles size={14} className="group-hover/btn:animate-pulse" />
                                                            Formalizar IA
                                                        </button>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    // Find contract for this applicant
                                                                    const contract = contracts.find(c => c.applicantId?._id === app._id || c.applicantId === app._id);
                                                                    if (contract) {
                                                                        setPrintingContractId(contract._id);
                                                                        setPrintingTitle(contract.title);
                                                                        setPrintMode('print');
                                                                        setIsPrintModalOpen(true);
                                                                    } else {
                                                                        toast.error('No se encontró el contrato archivado');
                                                                    }
                                                                }}
                                                                className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                                                title="Imprimir Contrato"
                                                            >
                                                                <Printer size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    const contract = contracts.find(c => c.applicantId?._id === app._id || c.applicantId === app._id);
                                                                    if (contract) {
                                                                        setPrintingContractId(contract._id);
                                                                        setPrintingTitle(contract.title);
                                                                        setPrintMode('download');
                                                                        setIsPrintModalOpen(true);
                                                                    } else {
                                                                        toast.error('No se encontró el contrato archivado');
                                                                    }
                                                                }}
                                                                className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                                                title="Descargar PDF"
                                                            >
                                                                <Download size={16} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>

                        {applicants.length === 0 && (
                            <div className="py-32 text-center">
                                <FilePlus size={64} className="mx-auto text-slate-100 mb-6" />
                                <h4 className="text-xl font-black text-slate-400 uppercase tracking-tighter">Sin Postulantes en el Pipeline</h4>
                                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-2">Los candidatos aparecerán aquí tras ser aprobados por Gerencia</p>
                            </div>
                        )}
                    </div>

                    {/* Edit Modal (Conditional Rendering) */}
                    {isEditModalOpen && (
                        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                            <div className="bg-white rounded-[3.5rem] w-full max-w-2xl shadow-2xl border border-white/20 animate-in zoom-in duration-300 overflow-hidden">
                                <div className="p-10 bg-slate-900 text-white flex justify-between items-center relative overflow-hidden">
                                    <Sparkles className="absolute -right-10 -top-10 opacity-10" size={200} />
                                    <div className="relative z-10">
                                        <h3 className="text-2xl font-black uppercase italic tracking-tight">Perfeccionar Ficha</h3>
                                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.3em]">Ajuste documental previo a legalidad</p>
                                    </div>
                                    <button onClick={() => setIsEditModalOpen(false)} className="bg-white/10 p-4 rounded-3xl hover:bg-red-500 transition-all relative z-10">
                                        <X size={20} />
                                    </button>
                                </div>
                                <form onSubmit={handleQuickUpdate} className="p-12 space-y-8">
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Nombre Completo</label>
                                            <input
                                                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                                value={editingApplicant.fullName}
                                                onChange={(e) => setEditingApplicant({ ...editingApplicant, fullName: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Sueldo Líquido ($)</label>
                                            <input
                                                type="number"
                                                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                                value={editingApplicant.workerData?.financial?.liquidSalary}
                                                onChange={(e) => setEditingApplicant({
                                                    ...editingApplicant,
                                                    workerData: {
                                                        ...editingApplicant.workerData,
                                                        financial: {
                                                            ...editingApplicant.workerData.financial,
                                                            liquidSalary: e.target.value
                                                        }
                                                    }
                                                })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Cargo</label>
                                            <input
                                                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-indigo-600"
                                                value={editingApplicant.position}
                                                onChange={(e) => setEditingApplicant({ ...editingApplicant, position: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Fecha Inicio Contrato</label>
                                            <input
                                                type="date"
                                                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                                value={editingApplicant.workerData?.contract?.startDate ? new Date(editingApplicant.workerData.contract.startDate).toISOString().split('T')[0] : ''}
                                                onChange={(e) => setEditingApplicant({
                                                    ...editingApplicant,
                                                    workerData: {
                                                        ...editingApplicant.workerData,
                                                        contract: {
                                                            ...editingApplicant.workerData.contract,
                                                            startDate: e.target.value
                                                        }
                                                    }
                                                })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Tipo de Contrato</label>
                                            <select
                                                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
                                                value={editingApplicant.workerData?.contract?.type || 'Indefinido'}
                                                onChange={(e) => setEditingApplicant({
                                                    ...editingApplicant,
                                                    workerData: {
                                                        ...editingApplicant.workerData,
                                                        contract: {
                                                            ...editingApplicant.workerData.contract,
                                                            type: e.target.value
                                                        }
                                                    }
                                                })}
                                            >
                                                <option value="Indefinido">Indefinido</option>
                                                <option value="Plazo Fijo">Plazo Fijo</option>
                                                <option value="Por Obra o Faena">Por Obra o Faena</option>
                                                <option value="Honorarios">Honorarios</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditModalOpen(false)}
                                            className="flex-1 py-4 bg-white border border-slate-200 rounded-3xl font-black text-xs uppercase text-slate-400 hover:bg-slate-50 transition-all"
                                        >
                                            Descartar Cambios
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-2 py-4 bg-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 shadow-xl shadow-slate-200 transition-all flex items-center justify-center gap-3 px-12"
                                        >
                                            <Save size={18} /> Actualizar Master Data
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Editor Header */}
                    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => setView('list')}
                                className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all"
                            >
                                <ChevronRight className="rotate-180" size={24} />
                            </button>
                            <div>
                                <input
                                    className="text-2xl font-black text-slate-900 uppercase bg-transparent border-none outline-none focus:ring-0 w-full"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedApplicant?.fullName} | {selectedApplicant?.rut}</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleSave}
                                disabled={generating}
                                className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all flex items-center gap-2"
                            >
                                {generating ? <Loader2 className="animate-spin" size={16} /> : <Save size={18} />}
                                Finalizar y Archivar
                            </button>
                        </div>
                    </div>

                    {/* Rich Editor */}
                    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden min-h-[800px] flex flex-col">
                        <div className="p-10 flex-1 quill-container">
                            <ReactQuill
                                theme="snow"
                                value={content}
                                onChange={setContent}
                                modules={modules}
                                className="h-full"
                            />
                        </div>
                    </div>
                </div>
            )}
            {isPrintModalOpen && (
                <PrintConfigModal
                    isOpen={isPrintModalOpen}
                    onClose={() => setIsPrintModalOpen(false)}
                    onConfirm={downloadPDF}
                    mode={printMode}
                />
            )}
        </PageWrapper >
    );
};

export default ContractManager;
