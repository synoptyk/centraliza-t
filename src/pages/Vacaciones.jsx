import React, { useState, useEffect } from 'react';
import {
    Calendar, Clock, CheckCircle2, XCircle, Search, Filter,
    MoreVertical, ArrowRight, Plane, Info, Plus, Loader2,
    CalendarCheck, User, Building2, Printer, Download
} from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import api from '../utils/api';
import toast from 'react-hot-toast';
import PrintConfigModal from '../components/PrintConfigModal';

const Vacaciones = ({ auth, onLogout }) => {
    const [employees, setEmployees] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newRequest, setNewRequest] = useState({
        applicantId: '',
        startDate: '',
        endDate: '',
        type: 'Legal',
        observations: ''
    });
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [printMode, setPrintMode] = useState('download');
    const [printingRequest, setPrintingRequest] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [empRes, reqRes] = await Promise.all([
                api.get('/applicants'),
                api.get('/vacations')
            ]);

            // Only contracted employees for vacation management
            const contracted = empRes.data.filter(emp => emp.status === 'Contratado');
            setEmployees(contracted);
            setRequests(reqRes.data);
        } catch (error) {
            toast.error('Error al sincronizar datos de vacaciones');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await api.put(`/vacations/${id}/status`, { status });
            toast.success(`Solicitud ${status.toLowerCase()} con éxito`);
            fetchData();
        } catch (error) {
            toast.error('Error al actualizar estado');
        }
    };

    const handleCreateRequest = async (e) => {
        e.preventDefault();
        try {
            await api.post('/vacations', newRequest);
            toast.success('Solicitud de vacaciones registrada');
            setIsModalOpen(false);
            setNewRequest({ applicantId: '', startDate: '', endDate: '', type: 'Legal', observations: '' });
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al crear solicitud');
        }
    };

    const handleDownloadPDF = async (config, mode = 'download') => {
        if (!printingRequest) return;

        const loadingToast = toast.loading(mode === 'print' ? 'Preparando impresión...' : 'Generando comprobante...');

        try {
            const response = await api.post('/exports/vacation-proof', {
                employeeData: {
                    fullName: printingRequest.applicantId.fullName,
                    rut: printingRequest.applicantId.rut
                },
                requestData: {
                    startDate: printingRequest.startDate,
                    endDate: printingRequest.endDate,
                    daysRequested: printingRequest.daysRequested
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
                    toast.success('Comprobante listo para impresión', { id: loadingToast });
                } else {
                    toast.error('Por favor, permite las ventanas emergentes', { id: loadingToast });
                }
            } else {
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `Vacaciones_${printingRequest.applicantId.rut}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                toast.success('Comprobante descargado exitosamente', { id: loadingToast });
            }
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error('Error al generar el documento', { id: loadingToast });
        } finally {
            setIsPrintModalOpen(false);
        }
    };

    const StatCard = ({ title, value, icon: Icon, color }) => (
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
            <div className={`p-4 rounded-2xl ${color}`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{title}</p>
                <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
            </div>
        </div>
    );

    const filteredRequests = requests.filter(req => {
        const matchesSearch = req.applicantId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <PageWrapper
            title="GESTIÓN DE VACACIONES"
            subtitle="Control de descansos, saldos legales y flujo de aprobación"
            icon={Plane}
            auth={auth}
            onLogout={onLogout}
        >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <StatCard
                    title="Solicitudes Pendientes"
                    value={requests.filter(r => r.status === 'Pendiente').length}
                    icon={Clock}
                    color="bg-amber-50 text-amber-600"
                />
                <StatCard
                    title="Colaboradores de Vacaciones"
                    value={requests.filter(r => {
                        const now = new Date();
                        return r.status === 'Aprobado' && new Date(r.startDate) <= now && new Date(r.endDate) >= now;
                    }).length}
                    icon={Plane}
                    color="bg-indigo-50 text-indigo-600"
                />
                <StatCard
                    title="Días Disponibles Global"
                    value={employees.reduce((acc, emp) => acc + (emp.workerData?.vacations?.pendingDays || 0), 0).toFixed(1)}
                    icon={CalendarCheck}
                    color="bg-emerald-50 text-emerald-600"
                />
                <StatCard
                    title="Próximas Salidas (7d)"
                    value={requests.filter(r => {
                        const now = new Date();
                        const nextWeek = new Date();
                        nextWeek.setDate(now.getDate() + 7);
                        return r.status === 'Aprobado' && new Date(r.startDate) > now && new Date(r.startDate) <= nextWeek;
                    }).length}
                    icon={ArrowRight}
                    color="bg-rose-50 text-rose-600"
                />
            </div>

            <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-4">
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
                        <div className="flex p-1 bg-white border border-slate-200 rounded-xl">
                            {['all', 'Pendiente', 'Aprobado', 'Rechazado'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === status ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                                >
                                    {status === 'all' ? 'Ver Todos' : status}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all active:scale-95"
                    >
                        <Plus size={18} /> Nueva Solicitud
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white">
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-50">Colaborador</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-50">Período</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-50 text-center">Días</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-50">Estado</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-50 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-32 text-center">
                                        <Loader2 className="animate-spin mx-auto text-indigo-400 mb-4" size={32} />
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Sincronizando Historial...</p>
                                    </td>
                                </tr>
                            ) : filteredRequests.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-32 text-center">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
                                            <Calendar size={24} />
                                        </div>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No se encontraron solicitudes</p>
                                    </td>
                                </tr>
                            ) : filteredRequests.map(req => (
                                <tr key={req._id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-black text-xs">
                                                {req.applicantId?.fullName?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 tracking-tight">{req.applicantId?.fullName}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{req.applicantId?.position}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-slate-300" />
                                            <span className="text-xs font-bold text-slate-600">
                                                {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {req.type && <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-[9px] font-black text-slate-500 rounded-md uppercase tracking-widest">{req.type}</span>}
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className="text-sm font-black text-indigo-600">{req.daysRequested}</span>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Hábiles</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${req.status === 'Pendiente' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                            req.status === 'Aprobado' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                'bg-rose-50 text-rose-600 border-rose-100'
                                            }`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        {req.status === 'Pendiente' && (
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleUpdateStatus(req._id, 'Rechazado')}
                                                    className="p-2 text-rose-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(req._id, 'Aprobado')}
                                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
                                                >
                                                    <CheckCircle2 size={16} /> Aprobar
                                                </button>
                                            </div>
                                        )}
                                        {req.status === 'Aprobado' ? (
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setPrintingRequest(req);
                                                        setPrintMode('print');
                                                        setIsPrintModalOpen(true);
                                                    }}
                                                    className="p-2 text-indigo-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all"
                                                    title="Imprimir Comprobante"
                                                >
                                                    <Printer size={18} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setPrintingRequest(req);
                                                        setPrintMode('download');
                                                        setIsPrintModalOpen(true);
                                                    }}
                                                    className="p-2 text-indigo-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all"
                                                    title="Descargar PDF"
                                                >
                                                    <Download size={18} />
                                                </button>
                                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic ml-2">
                                                    Aprobado
                                                </span>
                                            </div>
                                        ) : req.status === 'Rechazado' ? (
                                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">
                                                Rechazado
                                            </span>
                                        ) : null}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Nueva Solicitud */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Programar Vacaciones</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ingreso de nueva solicitud administrativa</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-rose-500 transition-colors shadow-sm">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateRequest} className="p-10 space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Colaborador</label>
                                <select
                                    required
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all appearance-none cursor-pointer"
                                    value={newRequest.applicantId}
                                    onChange={(e) => setNewRequest({ ...newRequest, applicantId: e.target.value })}
                                >
                                    <option value="">Seleccione un trabajador...</option>
                                    {employees.map(emp => (
                                        <option key={emp._id} value={emp._id}>{emp.fullName} ({emp.rut})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Fecha de Inicio</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                        value={newRequest.startDate}
                                        onChange={(e) => setNewRequest({ ...newRequest, startDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Fecha de Término</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                        value={newRequest.endDate}
                                        onChange={(e) => setNewRequest({ ...newRequest, endDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Tipo de Permiso</label>
                                    <select
                                        required
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all appearance-none cursor-pointer"
                                        value={newRequest.type}
                                        onChange={(e) => setNewRequest({ ...newRequest, type: e.target.value })}
                                    >
                                        <option value="Legal">Legal (Feriado)</option>
                                        <option value="Administrativo">Administrativo</option>
                                        <option value="Progresiva">Progresiva</option>
                                        <option value="Sin Goce de Sueldo">Sin Goce de Sueldo</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Observaciones</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Vacaciones Invierno"
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                        value={newRequest.observations}
                                        onChange={(e) => setNewRequest({ ...newRequest, observations: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-6 flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-8 py-5 bg-slate-100 text-slate-500 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] px-8 py-5 bg-indigo-600 text-white rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
                                >
                                    Enviar para Aprobación
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {isPrintModalOpen && (
                <PrintConfigModal
                    isOpen={isPrintModalOpen}
                    onClose={() => setIsPrintModalOpen(false)}
                    onConfirm={handleDownloadPDF}
                    mode={printMode}
                />
            )}
        </PageWrapper>
    );
};

export default Vacaciones;
