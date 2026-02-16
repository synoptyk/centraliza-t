import React, { useState, useEffect } from 'react';
import { Users, AlertCircle, FileText, Calendar, Bell, ArrowRight, MoreVertical } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ContractedPersonal = ({ auth, onLogout }) => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchContractedEmployees();
    }, []);

    const fetchContractedEmployees = async () => {
        try {
            const res = await api.get('/applicants');
            const contracted = res.data.filter(app => app.status === 'Contratado');

            // Process alerts and formatting
            const processed = contracted.map(emp => {
                const expiryDate = emp.hiring?.contractEndDate ? new Date(emp.hiring.contractEndDate) : null;
                const today = new Date();
                let alerts = 0;
                let daysToExpire = null;

                if (expiryDate) {
                    const diffTime = expiryDate - today;
                    daysToExpire = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    if (daysToExpire <= 30 && daysToExpire > 0) alerts = 1;
                }

                return {
                    ...emp,
                    formattedStartDate: emp.hiring?.contractStartDate ? new Date(emp.hiring.contractStartDate).toLocaleDateString() : 'N/A',
                    formattedEndDate: emp.hiring?.contractEndDate ? new Date(emp.hiring.contractEndDate).toLocaleDateString() : 'Indefinido',
                    alerts,
                    daysToExpire
                };
            });

            setEmployees(processed);
        } catch (error) {
            toast.error('Error al cargar personal contratado');
        } finally {
            setLoading(false);
        }
    };

    // Metrics
    const activeAlerts = employees.filter(e => e.alerts > 0).length;
    const pendingAnnexes = employees.filter(e => !e.hiring?.contractType).length; // Example metric

    return (
        <PageWrapper
            className="space-y-8"
            title="PERSONAL CONTRATADO ACTIVO"
            subtitle="Gestión de contratos activos, vencimientos y alertas laborales"
            icon={Users}
            auth={auth}
            onLogout={onLogout}
        >

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 rounded-3xl text-white shadow-xl shadow-indigo-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-white/20 rounded-lg"><Bell size={20} /></div>
                        <span className="text-xs font-bold uppercase tracking-widest opacity-80">Alertas Activas</span>
                    </div>
                    <p className="text-4xl font-bold">{activeAlerts}</p>
                    <p className="text-xs mt-2 opacity-80 font-medium">Contratos por vencer en 30 días</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><FileText size={20} /></div>
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Activos</span>
                    </div>
                    <p className="text-4xl font-bold text-slate-900">{employees.length}</p>
                    <p className="text-xs mt-2 text-slate-400 font-medium">Colaboradores con contrato vigente</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Calendar size={20} /></div>
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Sin Contrato Definido</span>
                    </div>
                    <p className="text-4xl font-bold text-slate-900">{pendingAnnexes}</p>
                    <p className="text-xs mt-2 text-slate-400 font-medium">Faltan datos de contratación</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <h3 className="font-bold text-slate-800">Nómina de Trabajadores</h3>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-all">Exportar PDF</button>
                    </div>
                </div>
                <div className="p-6">
                    {loading ? (
                        <div className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest">
                            Cargando nómina...
                        </div>
                    ) : employees.length === 0 ? (
                        <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                            <Users size={48} className="mx-auto text-slate-300 mb-4" />
                            <p className="text-slate-500 font-bold">No hay personal contratado activo</p>
                            <p className="text-xs text-slate-400 mt-2">Los postulantes aprobados aparecerán aquí una vez cambien su estado a "Contratado"</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {employees.map(emp => (
                                <div key={emp._id} className="p-6 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 transition-all group relative hover:shadow-lg hover:shadow-slate-200/50">
                                    <button className="absolute top-4 right-4 p-1 text-slate-300 hover:text-slate-600"><MoreVertical size={16} /></button>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-xl shadow-inner">
                                            {emp.fullName.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm line-clamp-1">{emp.fullName}</h4>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{emp.position}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-50">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Inicio</span>
                                            <span className="text-slate-700 font-bold">{emp.formattedStartDate}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Término</span>
                                            <span className={`font-bold ${emp.daysToExpire && emp.daysToExpire <= 30 ? 'text-red-500' : 'text-slate-700'}`}>
                                                {emp.formattedEndDate}
                                            </span>
                                        </div>
                                    </div>

                                    {emp.alerts > 0 && (
                                        <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl animate-pulse border border-red-100">
                                            <AlertCircle size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-wider">Vence en {emp.daysToExpire} días</span>
                                        </div>
                                    )}

                                    <div className="mt-6 flex gap-2">
                                        <button className="flex-1 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-slate-100 transition-all border border-slate-200 hover:border-slate-300">Ver Ficha</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </PageWrapper>
    );
};

export default ContractedPersonal;
