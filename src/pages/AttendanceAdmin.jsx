import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Users,
    Calendar,
    Download,
    Search,
    ShieldCheck,
    AlertTriangle,
    FileSpreadsheet,
    Printer,
    Filter,
    BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import API_URL from '../config/api';

const AttendanceAdmin = ({ auth }) => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        workerId: ''
    });

    useEffect(() => {
        fetchRecords();
    }, [filters]);

    const fetchRecords = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${API_URL}/api/attendance/company`, {
                params: filters,
                headers: { Authorization: `Bearer ${auth.token}` }
            });
            setRecords(data);
        } catch (err) {
            toast.error('Error al cargar registros');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        toast.success('Generando reporte certificado DT...');
        // In a real scenario, this would trigger a PDF/Excel generation endpoint
    };

    return (
        <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Control de Asistencia</h1>
                    <p className="text-slate-500 font-medium">Gestión, reportabilidad y cumplimiento Res. 38/2024</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={handleExport} className="flex items-center gap-2 bg-white border-2 border-slate-200 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-indigo-500 transition-all shadow-sm">
                        <FileSpreadsheet size={16} className="text-emerald-500" /> Exportar Excel
                    </button>
                    <button onClick={handleExport} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl">
                        <Printer size={16} /> Imprimir Reporte DT
                    </button>
                </div>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Marcaciones Hoy', value: records.length, icon: Calendar, color: 'indigo' },
                    { label: 'Atrasos Detectados', value: '0', icon: AlertTriangle, color: 'rose' },
                    { label: 'Horas Extras (Mes)', value: '12h', icon: BarChart3, color: 'amber' },
                    { label: 'Integridad Hash', value: '100%', icon: ShieldCheck, color: 'emerald' },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center mb-4`}>
                            <stat.icon size={24} />
                        </div>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
                        <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-wrap gap-6 items-end">
                <div className="flex-1 min-w-[200px]">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Rango de Fecha</label>
                    <div className="flex gap-2">
                        <input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-indigo-500 flex-1" />
                        <input type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-indigo-500 flex-1" />
                    </div>
                </div>
                <div className="flex-1 min-w-[200px]">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Buscar Colaborador</label>
                    <div className="relative">
                        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input placeholder="Nombre o RUT..." className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-2 text-xs font-bold outline-none focus:border-indigo-500" />
                    </div>
                </div>
                <button onClick={fetchRecords} className="bg-indigo-50 text-indigo-600 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-100 transition-all">
                    <Filter size={16} /> Filtrar
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[40px] border border-slate-200 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Colaborador</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Tipo</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Fecha/Hora</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Ubicación</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Integridad</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {records.length > 0 ? records.map((record) => (
                                <tr key={record._id} className="hover:bg-slate-50/50 transition-all">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-xs">
                                                {record.workerId?.fullName.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 text-sm uppercase italic">{record.workerId?.fullName}</p>
                                                <p className="text-slate-400 text-[10px] font-bold">{record.workerId?.rut}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-xs font-black">
                                        <span className={`px-3 py-1 rounded-full ${record.type === 'Entrada' ? 'bg-emerald-100 text-emerald-600' :
                                                record.type === 'Salida' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {record.type}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-slate-900 font-bold text-xs">{new Date(record.timestamp).toLocaleString('es-CL')}</p>
                                        <p className="text-slate-400 text-[10px]">ID: {record.transactionId?.split('-').pop()}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-slate-600 font-bold text-xs">
                                            <MapPin size={14} className="text-indigo-500" />
                                            Ver Mapa
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                                            <ShieldCheck size={16} /> Verificado
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center text-slate-400">
                                        <Users size={48} className="mx-auto mb-4 opacity-10" />
                                        <p className="font-black text-xs uppercase tracking-widest">No hay registros para este período</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AttendanceAdmin;
