import React, { useState, useEffect } from 'react';
import {
    CircleDollarSign, FileText, Download, Users, TrendingUp,
    TrendingDown, Calendar, Search, ChevronRight, Plus,
    FileCheck, ExternalLink, Settings, AlertCircle
} from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { calcularLiquidacionReal } from '../utils/payrollCalculator';

const Payroll = ({ onOpenCENTRALIZAT, auth, onLogout }) => {
    const [employees, setEmployees] = useState([]);
    const [globalParams, setGlobalParams] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPeriod, setCurrentPeriod] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
    const [adjustmentType, setAdjustmentType] = useState('Bonus'); // Bonus or Discount

    const [adjustmentAmount, setAdjustmentAmount] = useState('');
    const [adjustmentConcept, setAdjustmentConcept] = useState('');
    const [adjustmentCategory, setAdjustmentCategory] = useState('Imponible'); // Imponible, No Imponible, Varios

    useEffect(() => {
        fetchActiveEmployees();
    }, [currentPeriod]);

    const fetchActiveEmployees = async () => {
        setLoading(true);
        try {
            // Fetch Global Params First
            let params = {};
            try {
                const paramRes = await api.get('/settings');
                params = paramRes.data;
                setGlobalParams(params);
            } catch (err) {
                console.error("Missing global parameters, using defaults");
            }

            const res = await api.get('/applicants');
            // Real Payroll Calculation Engine Integration
            const active = res.data
                .filter(app => app.status === 'Contratado')
                .map(app => {
                    const baseSalary = parseInt(app.workerData?.financial?.liquidSalary || params?.sueldoMinimo || 539000); // Default IMM si no hay
                    const afp = app.workerData?.prevision?.afp || 'Habitat';
                    const healthSystem = app.workerData?.prevision?.healthSystem || { provider: 'Fonasa' };
                    const contractType = app.workerData?.contract?.type || 'Indefinido';

                    // Inicializamos ajustes manuales del periodo en cero
                    const periodAdjustments = {
                        bonosImponibles: 0,
                        bonosNoImponibles: 0,
                        descuentosVarios: 0
                    };

                    const calc = calcularLiquidacionReal({
                        baseSalary, afp, health: healthSystem, contractType
                    }, periodAdjustments, params);

                    return {
                        ...app,
                        periodAdjustments, // Estado local de ajustes manuales para modificar después
                        payrollData: {
                            status: 'Pendiente', // or Pagado
                            calculation: calc
                        }
                    };
                });

            setEmployees(active);
        } catch (error) {
            toast.error('Error al cargar nómina');
        } finally {
            setLoading(false);
        }
    };
    const handleApplyAdjustment = () => {
        if (!selectedEmployee || !adjustmentAmount || isNaN(adjustmentAmount)) {
            toast.error('Ingrese un monto válido');
            return;
        }

        const amount = parseInt(adjustmentAmount);

        setEmployees(prev => prev.map(emp => {
            if (emp._id === selectedEmployee._id) {
                // Copiar ajustes actuales
                const newAdjustments = { ...emp.periodAdjustments };

                if (adjustmentType === 'Bonus') {
                    if (adjustmentCategory === 'Imponible') {
                        newAdjustments.bonosImponibles += amount;
                    } else {
                        newAdjustments.bonosNoImponibles += amount;
                    }
                } else {
                    newAdjustments.descuentosVarios += amount;
                }

                // Recalcular liquidación con nuevos ajustes
                const baseSalary = parseInt(emp.workerData?.financial?.liquidSalary || globalParams?.sueldoMinimo || 539000);
                const afp = emp.workerData?.prevision?.afp || 'Habitat';
                const healthSystem = emp.workerData?.prevision?.healthSystem || { provider: 'Fonasa' };
                const contractType = emp.workerData?.contract?.type || 'Indefinido';

                const newCalc = calcularLiquidacionReal({
                    baseSalary, afp, health: healthSystem, contractType
                }, newAdjustments, globalParams);

                return {
                    ...emp,
                    periodAdjustments: newAdjustments,
                    payrollData: {
                        ...emp.payrollData,
                        calculation: newCalc
                    }
                };
            }
            return emp;
        }));

        toast.success(`${adjustmentType === 'Bonus' ? 'Haber' : 'Descuento'} de $${amount.toLocaleString()} aplicado a ${selectedEmployee.fullName}`);
        setIsAdjustmentModalOpen(false);
        setAdjustmentAmount('');
        setAdjustmentConcept('');
    };

    const totalPayroll = employees.reduce((sum, emp) => sum + (emp.payrollData?.calculation?.liquidoAPagar || 0), 0);
    const totalEmployerCost = employees.reduce((sum, emp) => sum + (emp.payrollData?.calculation?.aportesPatronales?.total || 0), 0);
    const paidCount = employees.filter(e => e.payrollData?.status === 'Pagado').length;

    const handleGeneratePayslip = (employee) => {
        toast.success(`Generando liquidación para ${employee.fullName}...`);
        // Mock PDF generation delay
        setTimeout(() => {
            toast.success('Documento generado exitosamente');
        }, 1500);
    };

    return (
        <PageWrapper
            className="space-y-8 animate-in fade-in duration-500"
            title="NÓMINA & REMUNERACIONES"
            subtitle="Cálculo inteligente y gestión de liquidaciones de sueldo"
            icon={CircleDollarSign}
            auth={auth}
            onLogout={onLogout}
        >
            {/* Top Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-200 col-span-1 md:col-span-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <CircleDollarSign size={100} />
                    </div>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                                <TrendingUp size={24} className="text-white" />
                            </div>
                            <span className="font-black text-xs uppercase tracking-widest text-indigo-100">Total Nómina Proyectada</span>
                        </div>
                        <div>
                            <h2 className="text-5xl font-black tracking-tighter mb-2">${totalPayroll.toLocaleString()}</h2>
                            <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-4">Líquido a Pagar Trabajadores</p>

                            <div className="pt-4 border-t border-indigo-500/30 flex items-center justify-between">
                                <div>
                                    <p className="text-[9px] font-black uppercase text-indigo-300 tracking-widest mb-1">Aporte Leyes Sociales (Empresa)</p>
                                    <p className="text-lg font-black text-emerald-400">+ ${totalEmployerCost.toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black uppercase text-indigo-300 tracking-widest mb-1">Costo Total Empresa</p>
                                    <p className="text-xl font-black text-white">${(totalPayroll + totalEmployerCost).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                            <Users size={20} />
                        </div>
                        <span className="font-black text-[10px] uppercase tracking-widest text-slate-400">Estado de Pago</span>
                    </div>
                    <div>
                        <div className="flex items-end gap-2 mb-1">
                            <h3 className="text-4xl font-black tracking-tighter text-slate-800">{paidCount}</h3>
                            <span className="text-lg font-bold text-slate-400 mb-1">/ {employees.length}</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">Liquidaciones Procesadas</p>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 mt-4">
                        <div className="bg-emerald-500 h-2 rounded-full transition-all duration-1000" style={{ width: `\${employees.length > 0 ? (paidCount / employees.length) * 100 : 0}%` }}></div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                            <Calendar size={20} />
                        </div>
                        <span className="font-black text-[10px] uppercase tracking-widest text-slate-400">Periodo Activo</span>
                    </div>
                    <div>
                        <input
                            type="month"
                            className="text-2xl font-black text-slate-800 bg-transparent border-none outline-none focus:ring-0 p-0 mb-1 cursor-pointer"
                            value={currentPeriod}
                            onChange={(e) => setCurrentPeriod(e.target.value)}
                        />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Seleccione mes a liquidar</p>
                    </div>
                </div>
            </div>

            {/* Master Table */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden flex flex-col">
                <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="BUSCAR COLABORADOR..."
                            className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-[11px] font-black text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all uppercase tracking-widest"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3">
                        <button className="px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all flex items-center gap-2">
                            <Download size={16} /> Exportar PREVIRED
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-5 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Colaborador</th>
                                <th className="px-5 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Sueldo Base</th>
                                <th className="px-5 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Imponibles</th>
                                <th className="px-5 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">No Imponibles</th>
                                <th className="px-5 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Leyes Sociales</th>
                                <th className="px-5 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Impto Único</th>
                                <th className="px-5 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Dctos Varios</th>
                                <th className="px-5 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Líquido</th>
                                <th className="px-5 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Costo Emp.</th>
                                <th className="px-5 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Estado</th>
                                <th className="px-5 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {employees
                                .filter(emp => emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || emp.rut.includes(searchTerm))
                                .map(emp => (
                                    <tr key={emp._id} className="group hover:bg-indigo-50/30 transition-all">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center font-black group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                    {emp.fullName.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-black text-slate-900 text-sm tracking-tight uppercase truncate">{emp.fullName}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{emp.rut}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <span className="font-bold text-slate-500">${emp.payrollData?.calculation?.sueldoBase?.toLocaleString()}</span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <span className="font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                                                ${(emp.payrollData?.calculation?.totalImponible - emp.payrollData?.calculation?.sueldoBase).toLocaleString()}
                                            </span>
                                            <p className="text-[8px] text-slate-400 uppercase font-bold mt-1">Gratif. + Bonos</p>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <span className="font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                                                ${emp.payrollData?.calculation?.bonosNoImponibles?.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <span className="font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">
                                                -${emp.payrollData?.calculation?.totalLeyesSociales?.toLocaleString()}
                                            </span>
                                            <p className="text-[8px] text-slate-400 uppercase font-bold mt-1">AFP/S./AFC</p>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <span className="font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">
                                                -${emp.payrollData?.calculation?.impuestoUnico?.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <span className="font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">
                                                -${emp.payrollData?.calculation?.descuentosVarios?.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right bg-slate-50/50 group-hover:bg-indigo-50/50 transition-colors">
                                            <span className="text-lg font-black text-slate-900">${emp.payrollData?.calculation?.liquidoAPagar?.toLocaleString()}</span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <span className="font-bold text-slate-500">${emp.payrollData?.calculation?.aportesPatronales?.costoFinalEmpresa?.toLocaleString()}</span>
                                            <p className="text-[8px] text-slate-400 uppercase font-bold mt-1">Líquido + SIS + Mut. + AFC</p>
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest ${emp.payrollData?.status === 'Pagado' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {emp.payrollData?.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => { setSelectedEmployee(emp); setAdjustmentType('Bonus'); setIsAdjustmentModalOpen(true); }}
                                                    className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-all flex items-center justify-center group/btn shadow-sm"
                                                    title="Añadir Bono/Haber"
                                                >
                                                    <Plus size={16} className="group-hover/btn:scale-110 transition-transform" />
                                                </button>
                                                <button
                                                    onClick={() => handleGeneratePayslip(emp)}
                                                    className="px-6 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2 group/btn"
                                                >
                                                    <FileText size={14} className="group-hover/btn:-rotate-12 transition-transform" />
                                                    Liquidación
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            {employees.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="7" className="p-16 text-center">
                                        <AlertCircle size={48} className="mx-auto text-slate-200 mb-4" />
                                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-loose">No hay colaboradores activos para liquidar en este periodo</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div >

            {/* Adjustment Modal */}
            {
                isAdjustmentModalOpen && selectedEmployee && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                        <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl animate-in zoom-in duration-300 overflow-hidden">
                            <div className={`p-8 text-white relative \${adjustmentType === 'Bonus' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                                <h3 className="text-xl font-black uppercase tracking-tight">
                                    {adjustmentType === 'Bonus' ? 'Añadir Haber / Bono' : 'Añadir Descuento'}
                                </h3>
                                <p className="text-xs font-bold opacity-80 uppercase tracking-widest mt-1">{selectedEmployee.fullName}</p>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setAdjustmentType('Bonus')}
                                        className={`p-4 rounded-2xl border-2 text-center transition-all \${adjustmentType === 'Bonus' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                                    >
                                        <TrendingUp size={24} className="mx-auto mb-2" />
                                        <span className="font-black text-[10px] uppercase tracking-widest">Haber (+)</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAdjustmentType('Discount')}
                                        className={`p-4 rounded-2xl border-2 text-center transition-all \${adjustmentType === 'Discount' ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                                    >
                                        <TrendingDown size={24} className="mx-auto mb-2" />
                                        <span className="font-black text-[10px] uppercase tracking-widest">Descuento (-)</span>
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Concepto</label>
                                        <input type="text" placeholder={adjustmentType === 'Bonus' ? "Ej. Bono de Producción" : "Ej. Anticipo de Sueldo"} className="w-full p-4 bg-slate-50 rounded-2xl border-none text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Monto ($)</label>
                                        <input type="number" placeholder="50000" className="w-full p-4 bg-slate-50 rounded-2xl border-none text-xl font-black text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button onClick={() => setIsAdjustmentModalOpen(false)} className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all flex-1">
                                        Cancelar
                                    </button>
                                    <button onClick={handleApplyAdjustment} className={`px-8 py-4 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all flex-1 \${adjustmentType === 'Bonus' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'}`}>
                                        Aplicar {adjustmentType === 'Bonus' ? 'Haber' : 'Descuento'}
                                    </button>
                                </div >
                            </div >
                        </div >
                    </div >
                )
            }

        </PageWrapper >
    );
};

export default Payroll;
