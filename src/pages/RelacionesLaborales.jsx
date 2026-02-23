import React, { useState, useEffect } from 'react';
import {
    ShieldAlert, Trophy, Scale, CheckCircle2, XCircle, Search, Filter,
    Plus, Loader2, Calendar, User, Info, AlertTriangle, FileText,
    TrendingUp, Award, Download, Printer
} from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import api from '../utils/api';
import toast from 'react-hot-toast';
import PrintConfigModal from '../components/PrintConfigModal';

const RelacionesLaborales = ({ auth, onLogout }) => {
    const [employees, setEmployees] = useState([]);
    const [disciplinaryActions, setDisciplinaryActions] = useState([]);
    const [commendations, setCommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('disciplinary'); // disciplinary, commendations
    const [searchTerm, setSearchTerm] = useState('');
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [printMode, setPrintMode] = useState('download');
    const [printingAction, setPrintingAction] = useState(null);

    // Modals
    const [isDisciplinaryModalOpen, setIsDisciplinaryModalOpen] = useState(false);
    const [isCommendationModalOpen, setIsCommendationModalOpen] = useState(false);

    const [newAction, setNewAction] = useState({
        applicantId: '',
        type: 'Amonestación Escrita',
        severity: 'Leve',
        reason: '',
        incidentDetails: '',
        internalRegArticle: 'Art. 154 Reglamento Interno',
        fineAmount: 0,
        date: new Date().toISOString().split('T')[0]
    });

    const [newCommendation, setNewCommendation] = useState({
        applicantId: '',
        title: '',
        category: 'Valores',
        reason: '',
        date: new Date().toISOString().split('T')[0],
        isPublic: true
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [empRes, discRes, commRes] = await Promise.all([
                api.get('/applicants'),
                api.get('/records/disciplinary'),
                api.get('/records/commendations')
            ]);
            setEmployees(empRes.data.filter(e => e.status === 'Contratado'));
            setDisciplinaryActions(discRes.data);
            setCommendations(commRes.data);
        } catch (error) {
            toast.error('Error al sincronizar historial laboral');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAction = async (e) => {
        e.preventDefault();
        try {
            await api.post('/records/disciplinary', newAction);
            toast.success('Medida disciplinaria registrada y notificada');
            setIsDisciplinaryModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error('Error al registrar amonestación');
        }
    };

    const handleCreateCommendation = async (e) => {
        e.preventDefault();
        try {
            await api.post('/records/commendations', newCommendation);
            toast.success('Felicitación enviada al colaborador');
            setIsCommendationModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error('Error al registrar felicitación');
        }
    };

    const handleDownloadDisciplinaryPDF = async (config, mode = 'download') => {
        if (!printingAction) return;

        const loadingToast = toast.loading(mode === 'print' ? 'Preparando impresión...' : 'Generando amonestación...');

        try {
            const response = await api.post('/exports/disciplinary', {
                employeeData: {
                    fullName: printingAction.applicantId.fullName,
                    rut: printingAction.applicantId.rut
                },
                actionData: {
                    type: printingAction.type,
                    severity: printingAction.severity,
                    reason: printingAction.reason,
                    incidentDetails: printingAction.incidentDetails,
                    internalRegArticle: printingAction.internalRegArticle,
                    fineAmount: printingAction.fineAmount,
                    date: printingAction.date
                },
                companyInfo: {
                    name: 'CENTRALIZA-T SPA',
                    rut: '77.777.777-7'
                },
                config
            }, { responseType: 'blob' });

            const url = window.URL.createObjectURL(new Blob([response.data]));

            if (mode === 'print') {
                const printWindow = window.open(url, '_blank');
                if (printWindow) {
                    printWindow.onload = () => {
                        printWindow.print();
                    };
                    toast.success('Amonestación lista para impresión', { id: loadingToast });
                } else {
                    toast.error('Por favor, permite las ventanas emergentes', { id: loadingToast });
                }
            } else {
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `Amonestacion_${printingAction.applicantId.rut}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                toast.success('PDF descargado exitosamente', { id: loadingToast });
            }
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error('Error al generar el documento', { id: loadingToast });
        } finally {
            setIsPrintModalOpen(false);
        }
    };

    const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
            <div className={`p-4 rounded-2xl ${color}`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{title}</p>
                <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
                {subtitle && <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">{subtitle}</p>}
            </div>
        </div>
    );

    return (
        <PageWrapper
            title="RELACIONES LABORALES"
            subtitle="Gestión de disciplina, méritos y cumplimiento legal (Art. 154 DT)"
            icon={ShieldAlert}
            auth={auth}
            onLogout={onLogout}
        >
            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <StatCard
                    title="Amonestaciones"
                    value={disciplinaryActions.length}
                    icon={ShieldAlert}
                    color="bg-rose-50 text-rose-600"
                    subtitle="Registros acumulados"
                />
                <StatCard
                    title="Reconocimientos"
                    value={commendations.length}
                    icon={Trophy}
                    color="bg-emerald-50 text-emerald-600"
                    subtitle="Cultura de excelencia"
                />
                <StatCard
                    title="Multas (DT)"
                    value={`$${disciplinaryActions.reduce((acc, curr) => acc + (curr.fineAmount || 0), 0).toLocaleString()}`}
                    icon={Scale}
                    color="bg-amber-50 text-amber-600"
                    subtitle="Recaudación mensual"
                />
                <StatCard
                    title="Pendientes Firma"
                    value={disciplinaryActions.filter(a => a.status === 'Notificado').length}
                    icon={FileText}
                    color="bg-indigo-50 text-indigo-600"
                    subtitle="Por regularizar"
                />
            </div>

            {/* Main Tabs and Actions */}
            <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="flex p-1 bg-white border border-slate-200 rounded-xl">
                            <button
                                onClick={() => setActiveTab('disciplinary')}
                                className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'disciplinary' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                            >
                                Amonestaciones
                            </button>
                            <button
                                onClick={() => setActiveTab('commendations')}
                                className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'commendations' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                            >
                                Felicitaciones
                            </button>
                        </div>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Buscar colaborador..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        {activeTab === 'disciplinary' ? (
                            <button
                                onClick={() => setIsDisciplinaryModalOpen(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all active:scale-95"
                            >
                                <Plus size={18} /> Nueva Amonestación
                            </button>
                        ) : (
                            <button
                                onClick={() => setIsCommendationModalOpen(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all active:scale-95"
                            >
                                <Plus size={18} /> Reconocer Mérito
                            </button>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {activeTab === 'disciplinary' ? (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white">
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-50">Colaborador</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-50">Tipo</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-50">Motivo</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-50">Fecha</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-50">Estado</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-50 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr><td colSpan="6" className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-indigo-400" /></td></tr>
                                ) : disciplinaryActions
                                    .filter(a => a.applicantId?.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
                                    .map(action => (
                                        <tr key={action._id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center font-black text-xs">
                                                        {action.applicantId?.fullName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900 tracking-tight uppercase">{action.applicantId?.fullName}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{action.applicantId?.rut}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${action.type === 'Multa' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                    action.type === 'Amonestación Escrita' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                        'bg-slate-50 text-slate-600 border-slate-100'
                                                    }`}>
                                                    {action.type}
                                                </span>
                                                {action.fineAmount > 0 && <p className="text-[10px] font-black text-amber-600 mt-1">${action.fineAmount.toLocaleString()}</p>}
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-xs font-bold text-slate-600 max-w-xs truncate">{action.reason}</p>
                                                <p className="text-[9px] font-black text-slate-300 uppercase mt-1">{action.internalRegArticle}</p>
                                            </td>
                                            <td className="px-8 py-6 text-xs font-bold text-slate-500">
                                                {new Date(action.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${action.status === 'Firmado' ? 'text-emerald-500' : 'text-amber-500'
                                                    }`}>
                                                    {action.status === 'Firmado' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                                                    {action.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setPrintingAction(action);
                                                            setPrintMode('print');
                                                            setIsPrintModalOpen(true);
                                                        }}
                                                        className="p-2.5 bg-slate-100 text-slate-400 hover:text-indigo-600 rounded-xl transition-all"
                                                        title="Imprimir Amonestación"
                                                    >
                                                        <Printer size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setPrintingAction(action);
                                                            setPrintMode('download');
                                                            setIsPrintModalOpen(true);
                                                        }}
                                                        className="p-2.5 bg-slate-100 text-slate-400 hover:text-indigo-600 rounded-xl transition-all"
                                                        title="Descargar PDF"
                                                    >
                                                        <Download size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white">
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-50">Colaborador</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-50">Categoría</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-50">Mérito reconocido</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-50">Fecha</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-50 text-right">Visibilidad</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {commendations
                                    .filter(c => c.applicantId?.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
                                    .map(comm => (
                                        <tr key={comm._id} className="hover:bg-emerald-50/30 transition-colors">
                                            <td className="px-8 py-6 font-black text-sm text-slate-900 uppercase">{comm.applicantId?.fullName}</td>
                                            <td className="px-8 py-6">
                                                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                                    {comm.category}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-xs font-black text-slate-700">{comm.title}</p>
                                                <p className="text-[10px] font-bold text-slate-400 line-clamp-1">{comm.reason}</p>
                                            </td>
                                            <td className="px-8 py-6 text-xs font-bold text-slate-500">
                                                {new Date(comm.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                {comm.isPublic ? (
                                                    <span className="text-[8px] font-black uppercase text-indigo-400 flex items-center justify-end gap-1"><TrendingUp size={12} /> Público</span>
                                                ) : (
                                                    <span className="text-[8px] font-black uppercase text-slate-300 flex items-center justify-end gap-1"><XCircle size={12} /> Privado</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modal: Amonestación */}
            {isDisciplinaryModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-rose-600 text-white">
                            <div>
                                <h3 className="text-xl font-black tracking-tighter uppercase">Registro de Medida Disciplinaria</h3>
                                <p className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-70">Cumplimiento Legal Art. 154 Código del Trabajo</p>
                            </div>
                            <button onClick={() => setIsDisciplinaryModalOpen(false)} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-colors">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateAction} className="p-10 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Colaborador</label>
                                    <select
                                        required
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-rose-500/5"
                                        value={newAction.applicantId}
                                        onChange={(e) => setNewAction({ ...newAction, applicantId: e.target.value })}
                                    >
                                        <option value="">Seleccionar...</option>
                                        {employees.map(e => <option key={e._id} value={e._id}>{e.fullName}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Tipo de Falta</label>
                                    <select
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none"
                                        value={newAction.type}
                                        onChange={(e) => setNewAction({ ...newAction, type: e.target.value })}
                                    >
                                        <option value="Amonestación Verbal">Amonestación Verbal</option>
                                        <option value="Amonestación Escrita">Amonestación Escrita</option>
                                        <option value="Multa">Multa (Max 25% sueldo diario)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Gravedad</label>
                                    <select
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none"
                                        value={newAction.severity}
                                        onChange={(e) => setNewAction({ ...newAction, severity: e.target.value })}
                                    >
                                        <option value="Leve">Leve</option>
                                        <option value="Grave">Grave</option>
                                        <option value="Gravísima">Gravísima</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Fecha del Hecho</label>
                                    <input
                                        type="date"
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none"
                                        value={newAction.date}
                                        onChange={(e) => setNewAction({ ...newAction, date: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Monto Multa ($)</label>
                                    <input
                                        type="number"
                                        disabled={newAction.type !== 'Multa'}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none disabled:opacity-50"
                                        value={newAction.fineAmount}
                                        onChange={(e) => setNewAction({ ...newAction, fineAmount: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Referencia Reglamento Interno</label>
                                <input
                                    type="text"
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none"
                                    value={newAction.internalRegArticle}
                                    onChange={(e) => setNewAction({ ...newAction, internalRegArticle: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Hechos (Descripción fáctica y detallada)</label>
                                <textarea
                                    required
                                    rows="3"
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none"
                                    placeholder="Describa el incidente con detalle, lugar y hora..."
                                    value={newAction.incidentDetails}
                                    onChange={(e) => setNewAction({ ...newAction, incidentDetails: e.target.value, reason: e.target.value.substring(0, 50) })}
                                />
                            </div>

                            <button type="submit" className="w-full py-5 bg-rose-600 text-white rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 shadow-xl shadow-rose-100 transition-all active:scale-95">
                                Registrar Amonestación y Notificar
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Felicitación */}
            {isCommendationModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-emerald-500 text-white">
                            <div>
                                <h3 className="text-xl font-black tracking-tighter uppercase">Reconocimiento por Mérito</h3>
                                <p className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-70">Reforzamiento positivo y cultura organizacional</p>
                            </div>
                            <button onClick={() => setIsCommendationModalOpen(false)} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-colors">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateCommendation} className="p-10 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Colaborador</label>
                                <select
                                    required
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none"
                                    value={newCommendation.applicantId}
                                    onChange={(e) => setNewCommendation({ ...newCommendation, applicantId: e.target.value })}
                                >
                                    <option value="">Seleccionar...</option>
                                    {employees.map(e => <option key={e._id} value={e._id}>{e.fullName}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Categoría</label>
                                    <select
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none"
                                        value={newCommendation.category}
                                        onChange={(e) => setNewCommendation({ ...newCommendation, category: e.target.value })}
                                    >
                                        <option value="Valores">Valores Corporativos</option>
                                        <option value="Productividad">Productividad</option>
                                        <option value="Seguridad">Seguridad (HSE)</option>
                                        <option value="Innovación">Innovación</option>
                                        <option value="Compañerismo">Compañerismo</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Título</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ej: Compromiso Excepcional"
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none"
                                        value={newCommendation.title}
                                        onChange={(e) => setNewCommendation({ ...newCommendation, title: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Justificación del Reconocimiento</label>
                                <textarea
                                    required
                                    rows="3"
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none"
                                    placeholder="Describa el logro alcanzado por el colaborador..."
                                    value={newCommendation.reason}
                                    onChange={(e) => setNewCommendation({ ...newCommendation, reason: e.target.value })}
                                />
                            </div>

                            <div className="flex items-center gap-3 px-1">
                                <input
                                    type="checkbox"
                                    id="isPublic"
                                    checked={newCommendation.isPublic}
                                    onChange={(e) => setNewCommendation({ ...newCommendation, isPublic: e.target.checked })}
                                    className="w-5 h-5 rounded-lg border-slate-200 text-emerald-600 focus:ring-emerald-500"
                                />
                                <label htmlFor="isPublic" className="text-xs font-bold text-slate-500 uppercase tracking-widest cursor-pointer">Visibilidad Pública (Muro de Honor)</label>
                            </div>

                            <button type="submit" className="w-full py-5 bg-emerald-600 text-white rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all active:scale-95">
                                Enviar Felicitación Digital
                            </button>
                        </form>
                    </div>
                </div>
            )}
            {isPrintModalOpen && (
                <PrintConfigModal
                    isOpen={isPrintModalOpen}
                    onClose={() => setIsPrintModalOpen(false)}
                    onConfirm={handleDownloadDisciplinaryPDF}
                    mode={printMode}
                />
            )}
        </PageWrapper>
    );
};

export default RelacionesLaborales;
