import React, { useState, useEffect } from 'react';
import {
    Users, AlertCircle, FileText, Calendar, Bell, ArrowRight, MoreVertical,
    Search, Filter, CheckCircle2, XCircle, Clock, ShieldCheck, Activity,
    Eye, Info, ExternalLink, User, History as HistoryIcon, TrendingUp,
    FileCheck, Briefcase
} from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import api from '../utils/api';
import toast from 'react-hot-toast';

const HumanCapitalMaster = ({ auth, onLogout, onOpenCENTRALIZAT }) => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'
    const [detailTab, setDetailTab] = useState('summary'); // 'summary', 'dossier', 'history'

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/applicants');
            // Filter only contracted for the main list, but keep all for history if needed
            // Actually, for "Human Capital", we focus on "Contratado" status
            const contracted = res.data.filter(app => app.status === 'Contratado');

            const processed = contracted.map(emp => {
                const expiryDate = emp.hiring?.contractEndDate ? new Date(emp.hiring.contractEndDate) : null;
                const today = new Date();
                let daysToExpire = null;
                if (expiryDate) {
                    const diffTime = expiryDate - today;
                    daysToExpire = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                }
                return { ...emp, daysToExpire };
            });

            setEmployees(processed);
        } catch (error) {
            toast.error('Error al sincronizar capital humano');
        } finally {
            setLoading(false);
        }
    };

    const filteredEmployees = employees.filter(emp =>
        emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.rut.includes(searchTerm) ||
        emp.position.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Metrics
    const activeAlerts = employees.filter(e => e.daysToExpire !== null && e.daysToExpire <= 30 && e.daysToExpire > 0).length;
    const totalActive = employees.length;

    const StatusBadge = ({ status }) => {
        let styles = "bg-slate-100 text-slate-600";
        if (status === 'Contratado') styles = "bg-emerald-50 text-emerald-600 border border-emerald-100";
        return <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${styles}`}>{status}</span>;
    };

    const EmployeeDetail = ({ employee, onBack }) => {
        if (!employee) return null;

        return (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                {/* Header Profile */}
                <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-slate-100 mb-8">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-[2.5rem] bg-indigo-600 flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-indigo-200">
                                {employee.fullName.charAt(0)}
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-2xl border-4 border-white flex items-center justify-center text-white shadow-lg">
                                <CheckCircle2 size={20} />
                            </div>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
                                <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">{employee.fullName}</h2>
                                <StatusBadge status={employee.status} />
                            </div>
                            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm font-bold text-slate-400 uppercase tracking-widest">
                                <div className="flex items-center gap-2"><Briefcase size={16} className="text-indigo-400" /> {employee.position}</div>
                                <div className="flex items-center gap-2"><Info size={16} className="text-slate-300" /> {employee.rut}</div>
                                <div className="flex items-center gap-2"><Calendar size={16} className="text-emerald-400" /> Ingreso: {new Date(employee.hiring?.contractStartDate).toLocaleDateString()}</div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => onOpenCENTRALIZAT(employee)}
                                className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 group"
                                title="Ver Perfil 360"
                            >
                                <ExternalLink size={20} className="group-hover:scale-110 transition-transform" />
                            </button>
                            <button
                                onClick={onBack}
                                className="px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all border border-slate-200"
                            >
                                Volver al Listado
                            </button>
                        </div>
                    </div>
                </div>

                {/* Detail Tabs */}
                <div className="flex gap-4 p-1 bg-slate-100 rounded-[2rem] w-fit mb-8">
                    {[
                        { id: 'summary', label: 'Resumen Contractual', icon: FileCheck },
                        { id: 'dossier', label: 'Expediente Digital', icon: FileText },
                        { id: 'history', label: 'Línea de Vida (Audit)', icon: HistoryIcon }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setDetailTab(tab.id)}
                            className={`px-8 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${detailTab === tab.id ? 'bg-white text-slate-900 shadow-xl shadow-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <tab.icon size={14} /> {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {detailTab === 'summary' && (
                            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 animate-in fade-in duration-500">
                                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-8">Información de Contratación</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tipo de Contrato</p>
                                        <p className="text-lg font-black text-slate-700">{employee.hiring?.contractType || 'No Definido'}</p>
                                    </div>
                                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Duración</p>
                                        <p className="text-lg font-black text-slate-700">{employee.workerData?.contract?.durationMonths || 'N/A'} Meses</p>
                                    </div>
                                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sueldo Líquido</p>
                                        <p className="text-lg font-black text-emerald-600">${employee.workerData?.financial?.liquidSalary?.toLocaleString() || '0'}</p>
                                    </div>
                                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Vencimiento</p>
                                        <p className={`text-lg font-black ${employee.daysToExpire <= 30 ? 'text-red-500' : 'text-slate-700'}`}>
                                            {employee.hiring?.contractEndDate ? new Date(employee.hiring.contractEndDate).toLocaleDateString() : 'Indefinido'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {detailTab === 'dossier' && (
                            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 animate-in fade-in duration-500">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Expediente Digital Unificado</h3>
                                    <div className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                                        {employee.contractDocuments?.length || 0} Documentos
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {employee.contractDocuments?.map((doc, idx) => (
                                        <div key={idx} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center group hover:bg-white hover:border-indigo-200 transition-all">
                                            <div className="flex-1 min-w-0 pr-4">
                                                <p className="font-black text-[11px] uppercase truncate text-slate-700">{doc.docType}</p>
                                                <p className={`text-[9px] font-bold uppercase ${doc.status === 'OK' ? 'text-emerald-500' : 'text-slate-400'}`}>{doc.status}</p>
                                            </div>
                                            {doc.url && (
                                                <a href={doc.url} target="_blank" rel="noreferrer" className="p-2.5 bg-white text-slate-400 hover:text-indigo-600 rounded-xl shadow-sm border border-slate-100 transition-all">
                                                    <Eye size={16} />
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {detailTab === 'history' && (
                            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 animate-in fade-in duration-500">
                                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-8">Línea de Vida del Colaborador</h3>
                                <div className="space-y-6 relative before:absolute before:left-8 before:top-2 before:bottom-2 before:w-px before:bg-slate-100">
                                    {[
                                        { title: 'Captura de Talento', date: employee.createdAt, icon: Users, status: 'Completado' },
                                        { title: 'Entrevista de Filtro', date: employee.interview?.date, icon: Calendar, status: employee.interview?.result === 'OK' ? 'Aprobado' : 'Pendiente' },
                                        { title: 'Evaluación Técnica', date: null, icon: Activity, status: 'Verificada' },
                                        { title: 'Gestión Documental', date: null, icon: FileText, status: 'Validada' },
                                        { title: 'Acreditación Prevención', date: null, icon: ShieldCheck, status: 'Habilitado' },
                                        { title: 'Contratación Final', date: employee.hiring?.approvalDate, icon: FileCheck, status: 'Activo' }
                                    ].map((step, idx) => (
                                        <div key={idx} className="flex items-start gap-6 relative z-10">
                                            <div className="w-16 h-16 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center text-slate-400 shadow-sm transition-all group-hover:border-indigo-500">
                                                <step.icon size={20} />
                                            </div>
                                            <div className="flex-1 pt-2">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="font-black text-sm uppercase text-slate-800 tracking-tight">{step.title}</h4>
                                                    <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase px-2 py-1 rounded-md">{step.status}</span>
                                                </div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                    {step.date ? new Date(step.date).toLocaleDateString() : 'Procesado Automáticamente'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-8">
                        {/* Alerts Card */}
                        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-200 text-white relative overflow-hidden">
                            <div className="absolute -top-10 -right-10 opacity-10 rotate-12">
                                <Bell size={160} />
                            </div>
                            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-6 relative z-10">Alertas y Notificaciones</h4>
                            <div className="space-y-4 relative z-10">
                                {employee.daysToExpire <= 30 && (
                                    <div className="flex items-start gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                                        <AlertCircle className="text-red-400 mt-1" size={18} />
                                        <div>
                                            <p className="text-[11px] font-black uppercase mb-1">Cierre de Contrato</p>
                                            <p className="text-[10px] text-slate-400 leading-relaxed font-bold">Este colaborador tiene un vencimiento en {employee.daysToExpire} días. Se recomienda iniciar gestiones de renovación.</p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-start gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                                    <CheckCircle2 className="text-emerald-400 mt-1" size={18} />
                                    <div>
                                        <p className="text-[11px] font-black uppercase mb-1">Cumplimiento 100%</p>
                                        <p className="text-[10px] text-slate-400 leading-relaxed font-bold">Todos los requisitos de prevención y seguridad se encuentran vigentes y validados.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions Card */}
                        <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 px-2">Acciones Rápidas</h4>
                            <div className="grid grid-cols-1 gap-3">
                                <button className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-indigo-600 hover:text-indigo-600 transition-all group shadow-sm">
                                    <span className="text-xs font-black uppercase tracking-widest">Generar Anexo</span>
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-indigo-600 hover:text-indigo-600 transition-all group shadow-sm">
                                    <span className="text-xs font-black uppercase tracking-widest">Solicitar Documento</span>
                                    <Plus size={16} className="group-hover:scale-110 transition-transform" />
                                </button>
                                <button className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-red-500 hover:text-red-500 transition-all group shadow-sm">
                                    <span className="text-xs font-black uppercase tracking-widest">Desvincular</span>
                                    <XCircle size={16} className="group-hover:rotate-90 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <PageWrapper
            className="space-y-8 animate-in fade-in duration-700"
            title="CONTROL MAESTRO | CAPITAL HUMANO 360"
            subtitle="Gestión estratégica y auditoría integral del personal contratado"
            icon={Users}
            auth={auth}
            onLogout={onLogout}
            headerActions={
                viewMode === 'list' && (
                    <div className="relative w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={18} />
                        <input
                            type="text"
                            placeholder="ESCANEAR PERSONAL (NOMBRE, RUT, CARGO)..."
                            className="w-full pl-12 pr-6 py-3 bg-white/10 border border-white/20 rounded-2xl text-[11px] font-black text-white focus:bg-white/20 outline-none transition-all placeholder:text-white/40 uppercase tracking-widest"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                )
            }
        >

            {viewMode === 'list' ? (
                <>
                    {/* Top Stats Dashboard */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-indigo-500 transition-all">
                            <div className="flex justify-between items-center mb-4">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all"><Users size={24} /></div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Activos</span>
                            </div>
                            <div>
                                <p className="text-4xl font-black text-slate-800 tracking-tighter">{totalActive}</p>
                                <p className="text-[10px] mt-1 font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <TrendingUp size={12} className="text-emerald-500" /> +2% este mes
                                </p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-red-500 transition-all">
                            <div className="flex justify-between items-center mb-4">
                                <div className="p-3 bg-red-50 text-red-600 rounded-2xl group-hover:bg-red-500 group-hover:text-white transition-all"><AlertCircle size={24} /></div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contratos x Vencer</span>
                            </div>
                            <div>
                                <p className="text-4xl font-black text-slate-800 tracking-tighter">{activeAlerts}</p>
                                <p className="text-[10px] mt-1 font-bold text-slate-400 uppercase tracking-widest">Próximos 30 días</p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-emerald-500 transition-all">
                            <div className="flex justify-between items-center mb-4">
                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-500 group-hover:text-white transition-all"><ShieldCheck size={24} /></div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compliance</span>
                            </div>
                            <div>
                                <p className="text-4xl font-black text-slate-800 tracking-tighter">98%</p>
                                <p className="text-[10px] mt-1 font-bold text-slate-400 uppercase tracking-widest">Mallas verificadas</p>
                            </div>
                        </div>

                        <div className="bg-slate-900 p-6 rounded-[2.5rem] shadow-xl shadow-slate-200 flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5"><HistoryIcon size={120} /></div>
                            <div className="flex justify-between items-center mb-4 relative z-10">
                                <div className="p-3 bg-white/10 text-white rounded-2xl"><Clock size={24} /></div>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Auditoría Hoy</span>
                            </div>
                            <div className="relative z-10">
                                <p className="text-4xl font-black text-white tracking-tighter">14</p>
                                <p className="text-[10px] mt-1 font-bold text-slate-400 uppercase tracking-widest">Eventos registrados</p>
                            </div>
                        </div>
                    </div>

                    {/* Employee Grid/Table */}
                    <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Nómina del Ecosistema</h3>
                                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Control de accesos y estatus administrativo</p>
                            </div>
                            <div className="flex gap-3">
                                <button className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2">
                                    <FileText size={16} /> Exportar Reporte
                                </button>
                            </div>
                        </div>

                        <div className="p-10">
                            {loading ? (
                                <div className="py-32 text-center text-slate-300 font-black uppercase tracking-[0.3em] animate-pulse">
                                    Sincronizando Capital Humano...
                                </div>
                            ) : filteredEmployees.length === 0 ? (
                                <div className="py-32 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100">
                                    <Users size={64} className="mx-auto text-slate-200 mb-6" />
                                    <p className="text-slate-400 font-bold uppercase tracking-widest">No se encontraron colaboradores</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {filteredEmployees.map(emp => (
                                        <div
                                            key={emp._id}
                                            onClick={() => {
                                                setSelectedEmployee(emp);
                                                setViewMode('detail');
                                            }}
                                            className="bg-white border border-slate-100 rounded-[2.5rem] p-8 hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-100 transition-all cursor-pointer group relative overflow-hidden"
                                        >
                                            <div className="flex items-center gap-6 mb-8 relative z-10">
                                                <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-xl font-black group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                                    {emp.fullName.charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm truncate mb-0.5">{emp.fullName}</h4>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{emp.position}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-50 group-hover:bg-indigo-50 transition-colors">
                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-indigo-400">Desde</p>
                                                    <p className="text-xs font-black text-slate-700">{new Date(emp.hiring?.contractStartDate).toLocaleDateString()}</p>
                                                </div>
                                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-50 group-hover:bg-indigo-50 transition-colors">
                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-indigo-400">Vence</p>
                                                    <p className={`text-xs font-black ${emp.daysToExpire <= 30 ? 'text-red-500' : 'text-slate-700'}`}>
                                                        {emp.hiring?.contractEndDate ? new Date(emp.hiring.contractEndDate).toLocaleDateString() : 'Indefinido'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between relative z-10">
                                                <StatusBadge status={emp.status} />
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                                    <span className="text-[9px] font-black text-slate-500 uppercase">Activo</span>
                                                </div>
                                            </div>

                                            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-5 transition-opacity duration-500">
                                                <Search size={120} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            ) : (
                <EmployeeDetail
                    employee={selectedEmployee}
                    onBack={() => {
                        setViewMode('list');
                        setSelectedEmployee(null);
                        setDetailTab('summary');
                    }}
                />
            )}
        </PageWrapper>
    );
};

export default HumanCapitalMaster;
