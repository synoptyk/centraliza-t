import React, { useState, useEffect } from 'react';
import {
    Clock, Plus, Users, Save, Trash2, Calendar,
    ChevronRight, Info, AlertCircle, CheckCircle2
} from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ShiftManagement = ({ auth }) => {
    const [shifts, setShifts] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('config'); // 'config' or 'assignment'

    // New Shift Form State
    const [newShift, setNewShift] = useState({
        name: '',
        startTime: '08:00',
        endTime: '17:00',
        breakTime: 60,
        isDefault: false
    });

    // Assignment state
    const [selectedWorker, setSelectedWorker] = useState('');
    const [workerSchedule, setWorkerSchedule] = useState({
        Lunes: '', Martes: '', Miércoles: '', Jueves: '', Viernes: '', Sábado: '', Domingo: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [shiftsRes, workersRes] = await Promise.all([
                api.get('/api/shifts'),
                api.get('/api/professionals') // Assuming this gets candidates/workers
            ]);
            setShifts(shiftsRes.data);
            setWorkers(workersRes.data);
        } catch (error) {
            toast.error('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateShift = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/api/shifts', newShift);
            setShifts([...shifts, res.data]);
            setNewShift({ name: '', startTime: '08:00', endTime: '17:00', breakTime: 60, isDefault: false });
            toast.success('Turno creado exitosamente');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al crear turno');
        }
    };

    const handleAssignSchedule = async () => {
        if (!selectedWorker) return toast.error('Seleccione un colaborador');

        const assignmentData = {
            workerId: selectedWorker,
            shifts: Object.entries(workerSchedule)
                .filter(([_, shiftId]) => shiftId !== '')
                .map(([day, shiftId]) => ({ day, shiftId }))
        };

        if (assignmentData.shifts.length === 0) return toast.error('Asigne al menos un turno');

        try {
            await api.post('/api/shifts/assign', assignmentData);
            toast.success('Programación guardada');
        } catch (error) {
            toast.error('Error al asignar programación');
        }
    };

    const handleWorkerChange = async (workerId) => {
        setSelectedWorker(workerId);
        if (!workerId) {
            setWorkerSchedule({ Lunes: '', Martes: '', Miércoles: '', Jueves: '', Viernes: '', Sábado: '', Domingo: '' });
            return;
        }

        try {
            const res = await api.get(`/api/shifts/schedule/${workerId}`);
            if (res.data && res.data.shifts) {
                const newSchedule = { ...workerSchedule };
                res.data.shifts.forEach(s => {
                    newSchedule[s.day] = s.shiftId?._id || s.shiftId;
                });
                setWorkerSchedule(newSchedule);
            } else {
                setWorkerSchedule({ Lunes: '', Martes: '', Miércoles: '', Jueves: '', Viernes: '', Sábado: '', Domingo: '' });
            }
        } catch (error) {
            console.error('Error fetching worker schedule');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-[#0f172a]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0f172a] text-white p-6 md:p-10 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter mb-2 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                            GESTIÓN DE TURNOS
                        </h1>
                        <p className="text-slate-400 font-medium flex items-center gap-2">
                            <Calendar size={18} className="text-indigo-400" />
                            Programación y Configuración de Jornadas Laborales
                        </p>
                    </div>

                    <div className="flex bg-slate-800/50 p-1 rounded-2xl border border-white/5 backdrop-blur-xl">
                        <button
                            onClick={() => setActiveTab('config')}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'config' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white'}`}
                        >
                            Configuración
                        </button>
                        <button
                            onClick={() => setActiveTab('assignment')}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'assignment' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white'}`}
                        >
                            Asignación
                        </button>
                    </div>
                </div>

                {activeTab === 'config' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* New Shift Form */}
                        <div className="lg:col-span-1">
                            <div className="bg-slate-900/50 border border-white/5 rounded-[32px] p-8 backdrop-blur-2xl">
                                <h2 className="text-xl font-black mb-6 flex items-center gap-3">
                                    <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                                        <Plus size={20} />
                                    </div>
                                    Nuevo Turno
                                </h2>

                                <form onSubmit={handleCreateShift} className="space-y-5">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Nombre del Turno</label>
                                        <input
                                            type="text"
                                            value={newShift.name}
                                            onChange={(e) => setNewShift({ ...newShift, name: e.target.value })}
                                            className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                                            placeholder="Ej: Mañana 40hrs"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Inicio</label>
                                            <input
                                                type="time"
                                                value={newShift.startTime}
                                                onChange={(e) => setNewShift({ ...newShift, startTime: e.target.value })}
                                                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Término</label>
                                            <input
                                                type="time"
                                                value={newShift.endTime}
                                                onChange={(e) => setNewShift({ ...newShift, endTime: e.target.value })}
                                                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Minutos de Colación</label>
                                        <input
                                            type="number"
                                            value={newShift.breakTime}
                                            onChange={(e) => setNewShift({ ...newShift, breakTime: e.target.value })}
                                            className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                                            placeholder="60"
                                        />
                                    </div>

                                    <div className="flex items-center gap-3 py-2">
                                        <input
                                            type="checkbox"
                                            id="isDefault"
                                            checked={newShift.isDefault}
                                            onChange={(e) => setNewShift({ ...newShift, isDefault: e.target.checked })}
                                            className="w-4 h-4 rounded border-white/10 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <label htmlFor="isDefault" className="text-xs font-bold text-slate-300">Marcar como turno por defecto</label>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all duration-300 flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
                                    >
                                        <Save size={18} />
                                        Crear Turno
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Shifts List */}
                        <div className="lg:col-span-2">
                            <div className="bg-slate-900/50 border border-white/5 rounded-[32px] overflow-hidden backdrop-blur-2xl">
                                <div className="p-8 border-b border-white/5 flex justify-between items-center">
                                    <h2 className="text-xl font-black flex items-center gap-3">
                                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                                            <Clock size={20} />
                                        </div>
                                        Turnos Configurados
                                    </h2>
                                    <span className="text-[10px] font-black bg-white/5 px-3 py-1 rounded-full text-slate-400 uppercase tracking-tighter border border-white/5">
                                        {shifts.length} Total
                                    </span>
                                </div>

                                <div className="p-4 overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-white/5">
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Nombre</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Horario</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Colación</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Estado</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {shifts.map((shift) => (
                                                <tr key={shift._id} className="group hover:bg-white/[0.02] transition-colors">
                                                    <td className="px-6 py-5">
                                                        <span className="text-sm font-bold text-slate-200">{shift.name}</span>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-black bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded-md border border-indigo-500/20">{shift.startTime}</span>
                                                            <ChevronRight size={12} className="text-slate-600" />
                                                            <span className="text-xs font-black bg-slate-800 text-slate-300 px-2 py-1 rounded-md border border-white/5">{shift.endTime}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className="text-xs font-medium text-slate-400">{shift.breakTime} min</span>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        {shift.isDefault ? (
                                                            <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-tight flex items-center gap-1 w-fit">
                                                                <CheckCircle2 size={10} /> Por Defecto
                                                            </span>
                                                        ) : (
                                                            <span className="text-[9px] font-black bg-slate-800 text-slate-500 px-3 py-1 rounded-full border border-white/5 uppercase tracking-tight w-fit block">
                                                                Estándar
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-5 text-right">
                                                        <button className="p-2 hover:bg-red-500/10 hover:text-red-400 text-slate-600 rounded-lg transition-all">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {shifts.length === 0 && (
                                                <tr>
                                                    <td colSpan="5" className="px-6 py-20 text-center">
                                                        <div className="flex flex-col items-center gap-3 text-slate-500">
                                                            <AlertCircle size={40} className="text-slate-700" />
                                                            <p className="font-bold text-sm">No hay turnos configurados aún</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Worker Selector */}
                        <div className="lg:col-span-1">
                            <div className="bg-slate-900/50 border border-white/5 rounded-[32px] p-8 backdrop-blur-2xl h-full">
                                <h2 className="text-xl font-black mb-6 flex items-center gap-3">
                                    <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                                        <Users size={20} />
                                    </div>
                                    Colaboradores
                                </h2>

                                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                    {workers.map((worker) => (
                                        <button
                                            key={worker._id}
                                            onClick={() => handleWorkerChange(worker._id)}
                                            className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-center gap-3 ${selectedWorker === worker._id ? 'bg-indigo-600/10 border-indigo-500/50 shadow-lg shadow-indigo-500/10' : 'bg-slate-800/20 border-white/5 hover:border-white/20'}`}
                                        >
                                            <div className={`p-2 rounded-xl border ${selectedWorker === worker._id ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-700 text-slate-400 border-white/10'}`}>
                                                <Users size={16} />
                                            </div>
                                            <div>
                                                <p className={`text-xs font-black uppercase tracking-tight truncate ${selectedWorker === worker._id ? 'text-white' : 'text-slate-300'}`}>
                                                    {worker.fullName}
                                                </p>
                                                <p className="text-[10px] font-medium text-slate-500">{worker.rut}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Assignment Matrix */}
                        <div className="lg:col-span-3">
                            <div className="bg-slate-900/50 border border-white/5 rounded-[32px] overflow-hidden backdrop-blur-2xl min-h-full">
                                <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-xl font-black flex items-center gap-3">
                                            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400">
                                                <Calendar size={20} />
                                            </div>
                                            Programación Semanal
                                        </h2>
                                        {selectedWorker && (
                                            <p className="text-xs font-bold text-slate-400 mt-1">
                                                Asignando turnos para: <span className="text-indigo-400">{workers.find(w => w._id === selectedWorker)?.fullName}</span>
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        onClick={handleAssignSchedule}
                                        disabled={!selectedWorker}
                                        className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black px-8 py-3 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all duration-300 flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
                                    >
                                        <Save size={18} strokeWidth={2.5} />
                                        Guardar Programación
                                    </button>
                                </div>

                                {!selectedWorker ? (
                                    <div className="flex flex-col items-center justify-center py-32 bg-white/[0.01]">
                                        <div className="p-6 bg-slate-800/50 rounded-full border border-white/5 mb-6 text-slate-600 animate-pulse">
                                            <Users size={60} />
                                        </div>
                                        <p className="text-slate-400 font-black text-xl tracking-tighter uppercase">Seleccione un colaborador para programar</p>
                                        <p className="text-slate-600 text-sm mt-2">Elija de la lista de la izquierda para ver su programación actual.</p>
                                    </div>
                                ) : (
                                    <div className="p-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                                            {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day) => (
                                                <div key={day} className="bg-slate-800/30 border border-white/5 p-6 rounded-3xl group hover:border-indigo-500/30 transition-all">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <span className="text-sm font-black uppercase tracking-widest text-slate-500 group-hover:text-indigo-400 transition-colors">{day}</span>
                                                        <Info size={14} className="text-slate-700" />
                                                    </div>

                                                    <select
                                                        value={workerSchedule[day]}
                                                        onChange={(e) => setWorkerSchedule({ ...workerSchedule, [day]: e.target.value })}
                                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none"
                                                    >
                                                        <option value="">Sin Turno (Libre)</option>
                                                        {shifts.map(shift => (
                                                            <option key={shift._id} value={shift._id}>
                                                                {shift.name} ({shift.startTime}-{shift.endTime})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-10 p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl flex items-start gap-4">
                                            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
                                                <Info size={20} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-white uppercase tracking-tighter mb-1">Nota sobre la programación</h4>
                                                <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
                                                    La programación definida aquí se utilizará para calcular atrasos, salidas anticipadas y horas extraordinarias en los reportes de fiscalización. Los cambios realizados se aplicarán a partir de la fecha actual.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShiftManagement;
