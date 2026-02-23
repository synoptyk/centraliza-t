import React, { useState, useEffect } from 'react';
import {
    LayoutGrid, Search, Filter, Download, Eye, FileText, CheckCircle2,
    AlertCircle, Clock, X, ChevronRight, Building2, Users, FolderOpen,
    FileCheck, ShieldCheck, Mail, Phone, Calendar
} from 'lucide-react';
import api from '../utils/api';
import PageWrapper from '../components/PageWrapper';
import toast from 'react-hot-toast';

const Contenedor = ({ auth, onLogout }) => {
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedWorker, setSelectedWorker] = useState(null);
    const [stats, setStats] = useState({ total: 0, active: 0, incomplete: 0 });
    const isAgency = auth?.company?.serviceMode === 'RECRUITMENT_ONLY';

    useEffect(() => {
        fetchWorkers();
    }, []);

    const fetchWorkers = async () => {
        try {
            const res = await api.get('/applicants');

            let recruited;
            if (isAgency) {
                // Agencies see the full pipeline (candidates delivered or in process for B2B clients)
                recruited = res.data.filter(a =>
                    ['Postulando', 'En Entrevista', 'En Test', 'Carga Documental', 'Acreditación', 'Pendiente Aprobación Gerencia', 'Aprobado para Contratación', 'Contratado'].includes(a.status)
                );
                setStats({
                    total: recruited.length,
                    active: recruited.filter(w => ['Aprobado para Contratación', 'Contratado'].includes(w.status)).length,
                    incomplete: recruited.filter(w => !['Aprobado para Contratación', 'Contratado'].includes(w.status)).length
                });
            } else {
                // Enterprises see only contracted/near-contracted workers
                recruited = res.data.filter(a =>
                    ['Contratado', 'Aprobado para Contratación', 'Carga Documental', 'Acreditación'].includes(a.status)
                );
                setStats({
                    total: recruited.length,
                    active: recruited.filter(w => w.status === 'Contratado').length,
                    incomplete: recruited.filter(w => w.status !== 'Contratado').length
                });
            }

            setWorkers(recruited);
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar la dotación');
        } finally {
            setLoading(false);
        }
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            'Contratado': 'bg-emerald-100 text-emerald-700 border-emerald-200',
            'Acreditación': 'bg-blue-100 text-blue-700 border-blue-200',
            'Carga Documental': 'bg-amber-100 text-amber-700 border-amber-200',
            'default': 'bg-slate-100 text-slate-600 border-slate-200'
        };
        const style = styles[status] || styles['default'];

        return (
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${style}`}>
                {status}
            </span>
        );
    };

    const DocStatus = ({ docs = [] }) => {
        const count = docs.length;
        const complete = count >= 4; // Assuming 4 is standard
        return (
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${complete ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></div>
                <span className={`text-[10px] font-bold ${complete ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {complete ? 'Documentación Completa' : `${count} Documentos`}
                </span>
            </div>
        );
    };

    // Filter Logic
    const filteredWorkers = workers.filter(w =>
        w.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.rut.includes(searchTerm)
    );

    const handleExport = () => {
        if (filteredWorkers.length === 0) {
            toast.error('No hay datos para exportar');
            return;
        }

        const headers = ['Nombre Completo', 'RUT', 'Email', 'Teléfono', 'Cargo', 'Proyecto', 'Estado', 'Fecha Inicio Contrato'];

        const csvContent = [
            headers.join(','),
            ...filteredWorkers.map(w => [
                `"${w.fullName}"`,
                `"${w.rut}"`,
                `"${w.email}"`,
                `"${w.phone}"`,
                `"${w.position}"`,
                `"${w.workerData?.project || 'General'}"`,
                `"${w.status}"`,
                `"${w.workerData?.contract?.startDate || ''}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `dotacion_corporativa_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <PageWrapper
            title={isAgency ? 'PORTAL DE ENTREGA AL CLIENTE' : 'CONTENEDOR CORPORATIVO'}
            subtitle={isAgency ? 'Pipeline de Talento para Empresas Mandantes' : 'Bóveda Digital de Talento y Documentación'}
            icon={FolderOpen}
            auth={auth}
            onLogout={onLogout}
        >
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-lg transition-all cursor-default">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{isAgency ? 'Pipeline Total' : 'Dotación Total'}</p>
                        <h3 className="text-3xl font-black text-slate-900">{stats.total}</h3>
                    </div>
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Users size={24} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-lg transition-all cursor-default">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{isAgency ? 'Colocados / Aprobados' : 'Activos / En Obra'}</p>
                        <h3 className="text-3xl font-black text-emerald-600">{stats.active}</h3>
                    </div>
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <CheckCircle2 size={24} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-lg transition-all cursor-default">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{isAgency ? 'En Proceso' : 'Pendiente Doc.'}</p>
                        <h3 className="text-3xl font-black text-amber-500">{stats.incomplete}</h3>
                    </div>
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Clock size={24} />
                    </div>
                </div>
            </div>

            {/* Smart Table Container */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden relative min-h-[600px] flex flex-col">
                {/* Table Header / Toolbar */}
                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 backdrop-blur-xl">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative group flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, RUT o cargo..."
                                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-all">
                            <Filter size={18} />
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
                        >
                            <Download size={14} /> Exportar Reporte
                        </button>
                    </div>
                </div>

                {/* Table Body */}
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 sticky top-0 z-10">
                            <tr>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Colaborador</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Cargo / Proyecto</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Estado Actual</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Salud Documental</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-20 text-center text-slate-400">
                                        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                                        Cargando Bóveda...
                                    </td>
                                </tr>
                            ) : filteredWorkers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-20 text-center text-slate-400 italic">No se encontraron colaboradores</td>
                                </tr>
                            ) : filteredWorkers.map((worker) => (
                                <tr key={worker._id} className="group hover:bg-blue-50/30 transition-colors">
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-500/20">
                                                {worker.fullName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm">{worker.fullName}</p>
                                                <p className="text-xs font-medium text-slate-400">{worker.rut}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-700 text-xs uppercase tracking-wide">{worker.position}</span>
                                            <span className="text-[10px] font-bold text-indigo-400 flex items-center gap-1 mt-1">
                                                <Building2 size={10} /> {worker.workerData?.project || 'Proyecto General'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <StatusBadge status={worker.status} />
                                    </td>
                                    <td className="p-6">
                                        <DocStatus docs={worker.documents} />
                                    </td>
                                    <td className="p-6 text-right">
                                        <button
                                            onClick={() => setSelectedWorker(worker)}
                                            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-wider hover:border-indigo-500 hover:text-indigo-600 hover:shadow-lg hover:shadow-indigo-500/10 transition-all flex items-center gap-2 ml-auto"
                                        >
                                            <FolderOpen size={14} /> Abrir Carpeta
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* DOCUMENT DRAWER (SLIDE-OVER) */}
            <div className={`fixed inset-0 z-50 pointer-events-none transition-all duration-500 ${selectedWorker ? 'bg-slate-900/20 backdrop-blur-sm' : 'opacity-0'}`}>
                <div className={`absolute top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl transform transition-transform duration-500 pointer-events-auto flex flex-col ${selectedWorker ? 'translate-x-0' : 'translate-x-full'}`}>

                    {/* Drawer Header */}
                    {selectedWorker && (
                        <div className="p-8 bg-slate-900 text-white flex justify-between items-start relative overflow-hidden">
                            {/* Decorative BG */}
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <FolderOpen size={120} />
                            </div>

                            <div className="relative z-10">
                                <h2 className="text-2xl font-black uppercase tracking-tight mb-2">{selectedWorker.fullName}</h2>
                                <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-400">
                                    <span className="flex items-center gap-1"><ShieldCheck size={14} /> {selectedWorker.rut}</span>
                                    <span className="flex items-center gap-1"><Mail size={14} /> {selectedWorker.email}</span>
                                    <span className="flex items-center gap-1"><Phone size={14} /> {selectedWorker.phone}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedWorker(null)}
                                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all relative z-10"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    )}

                    {/* Drawer Content */}
                    <div className="flex-1 overflow-y-auto bg-slate-50 p-8">
                        {selectedWorker && (
                            <div className="space-y-8">
                                {/* Status Summary */}
                                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Estado Contractual</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <span className="text-[10px] font-bold text-slate-400 block mb-1">Fecha Inicio</span>
                                            <span className="text-sm font-black text-slate-800">
                                                {selectedWorker.workerData?.contract?.startDate ? new Date(selectedWorker.workerData.contract.startDate).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <span className="text-[10px] font-bold text-slate-400 block mb-1">Tipo Contrato</span>
                                            <span className="text-sm font-black text-slate-800">
                                                {selectedWorker.workerData?.contract?.type || 'Indefinido'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Documents Grid */}
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                        <FolderOpen size={14} /> Documentación Digitalizada
                                    </h4>

                                    {selectedWorker.documents?.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-3">
                                            {selectedWorker.documents.map((doc, idx) => (
                                                <div key={idx} className="group bg-white p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5 transition-all flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                                            <FileText size={20} />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm text-slate-800 group-hover:text-indigo-600 transition-colors">{doc.type}</p>
                                                            <p className="text-[10px] font-bold text-slate-400">Subido el {new Date(doc.uploadDate).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${doc.status === 'Aprobado' || doc.status === 'OK' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                                            {doc.status || 'Revisión'}
                                                        </span>
                                                        <a
                                                            href={doc.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white rounded-lg transition-all"
                                                        >
                                                            <Eye size={16} />
                                                        </a>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-8 border-2 border-dashed border-slate-200 rounded-3xl text-center">
                                            <FolderOpen size={32} className="mx-auto text-slate-300 mb-2" />
                                            <p className="text-xs font-bold text-slate-400">Carpeta vacía</p>
                                        </div>
                                    )}
                                </div>

                                {/* Download All Action */}
                                <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2">
                                    <Download size={16} /> Descargar Carpeta Completa (.ZIP)
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};

export default Contenedor;
