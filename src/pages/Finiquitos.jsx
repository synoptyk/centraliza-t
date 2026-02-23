import React, { useState, useEffect } from 'react';
import {
    Scale, AlertCircle, FileText, CheckCircle, Search, Calendar, DollarSign, Calculator, Plus, Upload, X, Globe, Printer, Download
} from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { calcularFiniquitoReal, calcularTiempoTrabajado } from '../utils/finiquitoCalculator';
import PrintConfigModal from '../components/PrintConfigModal';

const Finiquitos = ({ auth, onLogout }) => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [globalParams, setGlobalParams] = useState(null);

    // Modal State
    const [isFiniquitoModalOpen, setIsFiniquitoModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [fechaTermino, setFechaTermino] = useState(new Date().toISOString().split('T')[0]);
    const [causal, setCausal] = useState('161'); // Default Necesidades de la Empresa
    const [daAvisoPrevio, setDaAvisoPrevio] = useState(false);
    const [metodoFiniquito, setMetodoFiniquito] = useState('DT');
    const [observaciones, setObservaciones] = useState('');

    // Upload State
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [fileToUpload, setFileToUpload] = useState(null);

    // Preview
    const [finiquitoPreview, setFiniquitoPreview] = useState(null);

    // Print State
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [printMode, setPrintMode] = useState('download');
    const [printingEmployee, setPrintingEmployee] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Parameters (UF)
            let params = { manualUfValue: 38500 }; // Fallback
            try {
                const paramRes = await api.get('/settings');
                if (paramRes.data) {
                    params = paramRes.data;
                }
            } catch (err) {
                console.error("Using default UF settings for finiquitos");
            }
            setGlobalParams(params);

            // Fetch Applicants -> Filter those who have been hired
            const res = await api.get('/applicants');
            // We want 'Contratado' y 'Desvinculado' para tener un historial
            const relevant = res.data.filter(app => ['Contratado', 'Desvinculado'].includes(app.status));
            setEmployees(relevant);

        } catch (error) {
            toast.error('Error cargando base de colaboradores');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenFiniquito = (employee) => {
        setSelectedEmployee(employee);
        setFechaTermino(new Date().toISOString().split('T')[0]);
        setCausal('161');
        setDaAvisoPrevio(false);
        setMetodoFiniquito('DT');
        setObservaciones('');
        setFiniquitoPreview(null);
        setIsFiniquitoModalOpen(true);
    };

    // Auto-calculates preview when inputs change
    useEffect(() => {
        if (selectedEmployee && isFiniquitoModalOpen) {
            calcularVistaPrevia();
        }
    }, [fechaTermino, causal, daAvisoPrevio, selectedEmployee]);

    const calcularVistaPrevia = () => {
        if (!selectedEmployee) return;

        const sueldoBase = parseInt(selectedEmployee.workerData?.financial?.liquidSalary || globalParams?.sueldoMinimo || 539000);
        // Simplified Total Imponible = Base + Gratification (aprox 25%) to calculate real severance. In a purely accurate system, this comes from their last 3 paychecks.
        const totalImponibleAprox = sueldoBase * 1.25;

        // Let's assume fechaInicio comes from their tracking or contract validation date. 
        // Fallback to 1 year ago if missing for MVP demonstration
        const fallbackFechaInicio = new Date();
        fallbackFechaInicio.setFullYear(fallbackFechaInicio.getFullYear() - 1);

        const fechaInicio = selectedEmployee.workerData?.contract?.startDate || fallbackFechaInicio.toISOString().split('T')[0];
        const config = { ufValue: globalParams?.ufValue || globalParams?.manualUfValue || 38500 };

        const fakeWorkerData = {
            fechaInicio,
            fechaFin: fechaTermino,
            causal,
            daAvisoPrevio,
            sueldoBase,
            totalImponible: totalImponibleAprox,
            vacationsTaken: selectedEmployee.workerData?.vacations?.takenDays || 0
        };

        const result = calcularFiniquitoReal(fakeWorkerData, config);

        // Enhance result with time math to show the user
        const tiempo = calcularTiempoTrabajado(fechaInicio, fechaTermino);

        setFiniquitoPreview({
            ...result,
            fechaInicio,
            tiempoTrabajado: tiempo // { meses, diasExtra }
        });
    };

    const handleProcessFiniquito = async () => {
        if (!selectedEmployee || !finiquitoPreview) return;

        try {
            await api.put(`/applicants/${selectedEmployee._id}/finiquitar`, {
                finiquitoData: {
                    ...finiquitoPreview,
                    fechaTerminoAprobada: fechaTermino,
                    method: metodoFiniquito,
                    observations: observaciones
                }
            });

            toast.success(`Desvinculación procesada. Finiquito de ${selectedEmployee.fullName} guardado.`);
            setIsFiniquitoModalOpen(false);
            fetchData(); // Refresh list to show them as Desvinculado
        } catch (error) {
            toast.error('Error al procesar el finiquito');
        }
    };

    const handleDownloadPDF = async (config, mode = 'download') => {
        if (!printingEmployee) return;

        const loadingToast = toast.loading(mode === 'print' ? 'Preparando impresión...' : 'Generando PDF...');

        try {
            const response = await api.post('/exports/finiquito', {
                employeeData: {
                    fullName: printingEmployee.fullName,
                    rut: printingEmployee.rut,
                    position: printingEmployee.position,
                    hiringDate: printingEmployee.hiring?.contractStartDate
                },
                calculation: printingEmployee.workerData?.finiquito,
                causalLegal: printingEmployee.workerData?.finiquito?.causalLegal,
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
                    toast.success('Finiquito listo para impresión', { id: loadingToast });
                } else {
                    toast.error('Por favor, permite las ventanas emergentes', { id: loadingToast });
                }
            } else {
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `Finiquito_${printingEmployee.rut}.pdf`);
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

    const handleUploadFiniquito = async (e) => {
        e.preventDefault();
        if (!fileToUpload || !selectedEmployee) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', fileToUpload);

        try {
            await api.put(`/applicants/${selectedEmployee._id}/finiquito-documento`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Documento de finiquito cargado exitosamente');
            setIsUploadModalOpen(false);
            setFileToUpload(null);
            fetchData();
        } catch (error) {
            toast.error('Error al subir el documento');
        } finally {
            setUploading(false);
        }
    };

    return (
        <PageWrapper
            className="space-y-8 animate-in fade-in duration-500"
            title="DESVINCULACIÓN & FINIQUITOS"
            subtitle="Cálculo legal exacto (Art. 159, 160 y 161)"
            icon={Scale}
            auth={auth}
            onLogout={onLogout}
        >
            {/* Header Metrics */}
            <div className="bg-white p-8 rounded-[3rem] shadow-xl shadow-slate-200/20 border border-slate-100 mb-8 flex flex-col md:flex-row gap-8 justify-between items-center">
                <div className="flex-1">
                    <h2 className="text-3xl font-black text-slate-800 tracking-tighter mb-2">Historial de Términos de Contrato</h2>
                    <p className="text-sm font-medium text-slate-400 max-w-2xl">
                        Gestiona el cese de relación laboral de tus colaboradores bajo las leyes chilenas. Calcula de forma automática e inteligente vacaciones proporcionales, sustitutivos de aviso previo e indemnizaciones por años de servicio, blindando a la empresa de errores legales.
                    </p>
                </div>
                <div className="flex-shrink-0 flex items-center gap-4">
                    <div className="bg-indigo-50/50 p-4 border border-indigo-100 rounded-2xl flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-1">Valor UF Oficial de Hoy (Banco Central)</p>
                            <p className="text-2xl font-black text-indigo-900">${(globalParams?.ufValue || globalParams?.manualUfValue || 38500).toLocaleString('es-CL')}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Table */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden flex flex-col">
                <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="BUSCAR COLABORADOR A FINIQUITAR..."
                            className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-[11px] font-black text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all uppercase tracking-widest"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-5 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Colaborador</th>
                                <th className="px-5 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Contrato / Rol</th>
                                <th className="px-5 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Sueldo Base</th>
                                <th className="px-5 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Estado</th>
                                <th className="px-5 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Acción Legal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {employees
                                .filter(emp => emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || emp.rut.includes(searchTerm))
                                .map(emp => (
                                    <tr key={emp._id} className="group hover:bg-slate-50 transition-all">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-black">
                                                    {emp.fullName.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-black text-slate-900 text-sm tracking-tight uppercase truncate">{emp.fullName}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{emp.rut}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="font-black text-slate-600 text-[11px] uppercase">{emp.position}</span>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{emp.workerData?.contract?.type || 'Indefinido'}</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="font-bold text-slate-700">${parseInt(emp.workerData?.financial?.liquidSalary || globalParams?.sueldoMinimo || 539000).toLocaleString()}</span>
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${emp.status === 'Contratado' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                                }`}>
                                                {emp.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            {emp.status === 'Contratado' ? (
                                                <button
                                                    onClick={() => handleOpenFiniquito(emp)}
                                                    className="px-6 py-2.5 bg-rose-50 text-rose-600 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                                >
                                                    Desvincular
                                                </button>
                                            ) : (
                                                <div className="flex flex-col items-end gap-2">
                                                    <div className="text-right">
                                                        <p className="text-xs font-black text-rose-900">${emp.workerData?.finiquito?.totalAPagar?.toLocaleString() || 0}</p>
                                                        <p className="text-[8px] font-bold text-rose-400 uppercase tracking-widest">Finiquito Pagado ({emp.workerData?.finiquito?.method || 'Notaría'})</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setPrintingEmployee(emp);
                                                                setPrintMode('print');
                                                                setIsPrintModalOpen(true);
                                                            }}
                                                            className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all group/btn"
                                                            title="Imprimir Finiquito"
                                                        >
                                                            <Printer size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setPrintingEmployee(emp);
                                                                setPrintMode('download');
                                                                setIsPrintModalOpen(true);
                                                            }}
                                                            className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all group/btn"
                                                            title="Descargar PDF"
                                                        >
                                                            <Download size={16} />
                                                        </button>
                                                    </div>
                                                    {emp.workerData?.finiquito?.documentUrl ? (
                                                        <a
                                                            href={emp.workerData.finiquito.documentUrl}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-all"
                                                        >
                                                            <FileText size={12} /> Ver Finiquito
                                                        </a>
                                                    ) : (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedEmployee(emp);
                                                                setIsUploadModalOpen(true);
                                                            }}
                                                            className="flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-all"
                                                        >
                                                            <Plus size={12} /> Subir Firmado
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            {employees.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="5" className="px-5 py-12 text-center text-slate-400">No hay colaboradores para mostrar</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Desvinculación */}
            {isFiniquitoModalOpen && selectedEmployee && (
                <div className="fixed inset-0 bg-[#020617]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[3rem] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="bg-slate-900 p-8 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                    <AlertCircle className="text-rose-500" /> Asistente de Desvinculación
                                </h3>
                                <p className="text-slate-400 text-sm mt-1">Configurando salida para {selectedEmployee.fullName} ({selectedEmployee.rut})</p>
                            </div>
                            <button
                                onClick={() => setIsFiniquitoModalOpen(false)}
                                className="text-slate-500 hover:text-white p-2"
                            >
                                <AlertCircle size={24} /> {/* Placeholder close icon */}
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 grid md:grid-cols-2 gap-8 overflow-y-auto">
                            {/* Left Column: Form Inputs */}
                            <div className="space-y-6">
                                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Parámetros del Término</h4>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Fecha Exacta de Desvinculación</label>
                                            <input
                                                type="date"
                                                value={fechaTermino}
                                                onChange={e => setFechaTermino(e.target.value)}
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-rose-500 outline-none transition-all"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Causal Legal (Código del Trabajo)</label>
                                            <select
                                                value={causal}
                                                onChange={e => setCausal(e.target.value)}
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-rose-500 outline-none transition-all"
                                            >
                                                <option value="161">Art. 161: Necesidades de la Empresa</option>
                                                <option value="159-2">Art. 159 N°2: Renuncia Voluntaria</option>
                                                <option value="159-1">Art. 159 N°1: Mutuo Acuerdo</option>
                                                <option value="159-4">Art. 159 N°4: Vencimiento del Plazo</option>
                                                <option value="160">Art. 160: Causales Disciplinarias (Sin Indem.)</option>
                                            </select>
                                        </div>

                                        {causal === '161' && (
                                            <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl">
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">¿Se notificó con 30 días?</p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Exime sustitutivo aviso previo</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" className="sr-only peer" checked={daAvisoPrevio} onChange={() => setDaAvisoPrevio(!daAvisoPrevio)} />
                                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                                                </label>
                                            </div>
                                        )}

                                        <div className="pt-4 border-t border-slate-100">
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">Método de Firma Legal</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setMetodoFiniquito('DT')}
                                                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${metodoFiniquito === 'DT' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'}`}
                                                >
                                                    <Globe size={20} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">DT (Electrónico)</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setMetodoFiniquito('Notaría')}
                                                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${metodoFiniquito === 'Notaría' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'}`}
                                                >
                                                    <Scale size={20} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Notaría (Físico)</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Observaciones de Cierre (Dossier RRHH)</label>
                                            <textarea
                                                value={observaciones}
                                                onChange={e => setObservaciones(e.target.value)}
                                                rows="3"
                                                placeholder="Ej: Entrega de EPP completa, devolución de llaves, motivo específico..."
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-rose-500 outline-none transition-all resize-none"
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 flex items-start gap-4">
                                    <Calculator className="text-indigo-400 flex-shrink-0 mt-1" />
                                    <div>
                                        <p className="text-sm font-bold text-indigo-900 mb-1">Cálculo Automático Habilitado</p>
                                        <p className="text-[10px] text-indigo-600/80 uppercase font-bold tracking-widest leading-relaxed">
                                            El motor aplica topes legales automáticamente (90 UF indemnización, límite 11 años, y fraccionamiento &gt; 6 meses) protegiendo el patrimonio de la empresa.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Dynamic Preview */}
                            <div className="bg-slate-900 rounded-3xl p-6 text-white flex flex-col justify-between shadow-inner">
                                {finiquitoPreview ? (
                                    <>
                                        <div>
                                            <div className="mb-6 pb-6 border-b border-slate-800">
                                                <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-4">Simulador Legal en Tiempo Real</h4>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-[9px] text-slate-400 uppercase tracking-widest mb-1">Antigüedad Analizada</p>
                                                        <p className="text-sm font-bold">{finiquitoPreview.tiempoTrabajado?.meses || 0} meses y {finiquitoPreview.tiempoTrabajado?.diasExtra || 0} días</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] text-slate-400 uppercase tracking-widest mb-1">Base Imponible Proyectada</p>
                                                        <p className="text-sm font-bold">${(finiquitoPreview.desglose?.indemnizacionAvisoPrevio > 0 ? finiquitoPreview.desglose?.indemnizacionAvisoPrevio : 539000).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4 mb-6">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-slate-300 font-bold flex items-center gap-2"><CheckCircle size={14} className="text-emerald-500" /> Feriado Proporcional (Vacaciones)</span>
                                                    <span className="font-black text-emerald-400">${finiquitoPreview.desglose?.vacacionesProporcionales?.toLocaleString()}</span>
                                                </div>
                                                {finiquitoPreview.desglose?.indemnizacionAñosServicio > 0 && (
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-slate-300 font-bold flex items-center gap-2"><CheckCircle size={14} className="text-amber-500" /> Años de Servicio (Art {finiquitoPreview.causalLegal})</span>
                                                        <span className="font-black text-amber-400">${finiquitoPreview.desglose?.indemnizacionAñosServicio?.toLocaleString()}</span>
                                                    </div>
                                                )}
                                                {finiquitoPreview.desglose?.indemnizacionAvisoPrevio > 0 && (
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-slate-300 font-bold flex items-center gap-2"><CheckCircle size={14} className="text-rose-500" /> Sustitutiva Aviso Previo</span>
                                                        <span className="font-black text-rose-400">${finiquitoPreview.desglose?.indemnizacionAvisoPrevio?.toLocaleString()}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-slate-800">
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">Finiquito Total a Pagar Empresa</p>
                                            <p className="text-5xl font-black text-white tracking-tighter">${finiquitoPreview.totalAPagar?.toLocaleString()}</p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex-1 flex items-center justify-center">
                                        <div className="text-center text-slate-500">
                                            <Calculator size={48} className="mx-auto mb-4 opacity-50" />
                                            <p className="text-sm font-bold uppercase tracking-widest">Esperando Parámetros</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-slate-50 p-6 border-t border-slate-100 flex justify-end gap-3">
                            <button
                                onClick={() => setIsFiniquitoModalOpen(false)}
                                className="px-6 py-3 text-sm font-black text-slate-500 uppercase tracking-widest hover:text-slate-800 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleProcessFiniquito}
                                className="px-8 py-3 bg-rose-600 text-white text-sm font-black uppercase tracking-widest shadow-xl shadow-rose-200 rounded-xl hover:bg-rose-700 transition-all flex items-center gap-2"
                            >
                                <CheckCircle size={16} /> Emitir y Desvincular Legalmente
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Carga Documento Firmado */}
            {isUploadModalOpen && selectedEmployee && (
                <div className="fixed inset-0 bg-[#020617]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden">
                        <div className="bg-indigo-900 p-8 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                    <Upload className="text-indigo-400" /> Cargar Finiquito Firmado
                                </h3>
                                <p className="text-indigo-300 text-xs mt-1">{selectedEmployee.fullName}</p>
                            </div>
                            <button onClick={() => setIsUploadModalOpen(false)} className="text-indigo-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleUploadFiniquito} className="p-8 space-y-6">
                            <div className="bg-slate-50 p-6 rounded-3xl border-2 border-dashed border-slate-200 text-center">
                                <input
                                    type="file"
                                    id="finiquito-upload"
                                    className="hidden"
                                    accept=".pdf"
                                    onChange={(e) => setFileToUpload(e.target.files[0])}
                                    required
                                />
                                <label htmlFor="finiquito-upload" className="cursor-pointer flex flex-col items-center gap-3">
                                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-500">
                                        <FileText size={32} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-700 uppercase tracking-tight">
                                            {fileToUpload ? fileToUpload.name : 'Seleccionar PDF Firmado'}
                                        </p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mt-1">
                                            Click para buscar archivo
                                        </p>
                                    </div>
                                </label>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsUploadModalOpen(false)}
                                    className="flex-1 py-4 text-xs font-black text-slate-500 uppercase tracking-widest hover:text-slate-800 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={!fileToUpload || uploading}
                                    className={`flex-2 py-4 px-8 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${!fileToUpload || uploading
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        : 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 hover:bg-indigo-700'
                                        }`}
                                >
                                    {uploading ? 'Subiendo...' : 'Confirmar Carga'}
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

export default Finiquitos;
