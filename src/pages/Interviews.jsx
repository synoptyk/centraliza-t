import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, LayoutGrid, List, Search, Loader2, Filter, Download, Users, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import PageWrapper from '../components/PageWrapper';
import usePermissions from '../hooks/usePermissions';
import InterviewPipeline from '../components/InterviewPipeline';
import InterviewCard from '../components/InterviewCard';
import InterviewActionModal from '../components/InterviewActionModal';
import InterviewCalendar from '../components/InterviewCalendar';

const Interviews = ({ onOpenRECLUTANDO, auth, onLogout }) => {
    const [applicants, setApplicants] = useState([]);
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const { canCreate, canUpdate, canDelete } = usePermissions('entrevista');
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeView, setActiveView] = useState('pipeline'); // 'calendar', 'pipeline', 'list'
    const [filterStatus, setFilterStatus] = useState('all');
    const [actionModal, setActionModal] = useState({ show: false, action: null });

    const [interviewData, setInterviewData] = useState({
        scheduledDate: '',
        location: '',
        attended: false,
        result: 'Pendiente',
        notes: ''
    });

    useEffect(() => {
        fetchApplicants();
    }, []);

    const fetchApplicants = async () => {
        setLoading(true);
        try {
            const res = await api.get('/applicants');
            // Filter: En Entrevista, Postulando, or has interview scheduled
            const filtered = res.data.filter(a =>
                ['Postulando', 'En Entrevista'].includes(a.status) ||
                a.interview?.scheduledDate
            );
            setApplicants(filtered);
        } catch (error) {
            toast.error('Error al cargar postulantes');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectApplicant = (app) => {
        setSelectedApplicant(app);
        const int = app.interview || {};
        setInterviewData({
            scheduledDate: int.scheduledDate ? new Date(int.scheduledDate).toISOString().slice(0, 16) : '',
            location: int.location || '',
            attended: int.attended || false,
            result: int.result || 'Pendiente',
            notes: int.notes || ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedApplicant) return;

        try {
            await api.put(`/applicants/${selectedApplicant._id}/interview`, interviewData);
            toast.success('Entrevista actualizada exitosamente');
            fetchApplicants();
            setSelectedApplicant(null);
        } catch (error) {
            toast.error('Error al guardar entrevista');
        }
    };

    const handleAction = (action) => {
        setActionModal({ show: true, action });
    };

    const handleActionSuccess = () => {
        setActionModal({ show: false, action: null });
        setSelectedApplicant(null);
        fetchApplicants();
    };

    const filteredApplicants = applicants.filter(a => {
        const matchesSearch = a.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || a.rut.includes(searchTerm);
        const matchesFilter = filterStatus === 'all' || (a.interview?.interviewStatus || 'Pendiente Agendar') === filterStatus;
        return matchesSearch && matchesFilter;
    });

    // Calculate stats
    const stats = {
        total: applicants.length,
        scheduled: applicants.filter(a => a.interview?.interviewStatus === 'Agendada' || a.interview?.interviewStatus === 'Confirmada').length,
        completed: applicants.filter(a => a.interview?.interviewStatus === 'Realizada').length,
        pending: applicants.filter(a => !a.interview?.scheduledDate || a.interview?.interviewStatus === 'Pendiente Agendar').length
    };

    return (
        <PageWrapper
            className="space-y-6"
            title="EVALUACIÓN PRESENCIAL ÉLITE"
            subtitle="Sistema integral de gestión de entrevistas con calendario, pipeline visual y workflow completo"
            icon={CalendarIcon}
            auth={auth}
            onLogout={onLogout}
        >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-indigo-100 text-xs font-black uppercase tracking-wider">Total Candidatos</p>
                            <p className="text-4xl font-black mt-2">{stats.total}</p>
                        </div>
                        <Users size={40} className="opacity-20" />
                    </div>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-xs font-black uppercase tracking-wider">Agendadas</p>
                            <p className="text-4xl font-black mt-2">{stats.scheduled}</p>
                        </div>
                        <CalendarIcon size={40} className="opacity-20" />
                    </div>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-emerald-100 text-xs font-black uppercase tracking-wider">Completadas</p>
                            <p className="text-4xl font-black mt-2">{stats.completed}</p>
                        </div>
                        <TrendingUp size={40} className="opacity-20" />
                    </div>
                </div>
                <div className="bg-gradient-to-br from-slate-500 to-slate-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-100 text-xs font-black uppercase tracking-wider">Pendientes</p>
                            <p className="text-4xl font-black mt-2">{stats.pending}</p>
                        </div>
                        <CalendarIcon size={40} className="opacity-20" />
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar candidato..."
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* View Toggles */}
                    <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl">
                        <button
                            onClick={() => setActiveView('calendar')}
                            className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${activeView === 'calendar'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            <CalendarIcon size={16} />
                            Calendario
                        </button>
                        <button
                            onClick={() => setActiveView('pipeline')}
                            className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${activeView === 'pipeline'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            <LayoutGrid size={16} />
                            Pipeline
                        </button>
                        <button
                            onClick={() => setActiveView('list')}
                            className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${activeView === 'list'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            <List size={16} />
                            Lista
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Views */}
            {activeView === 'calendar' && (
                <InterviewCalendar onRefresh={fetchApplicants} />
            )}

            {activeView === 'pipeline' && (
                <InterviewPipeline
                    applicants={filteredApplicants}
                    loading={loading}
                    onRefresh={fetchApplicants}
                />
            )}

            {activeView === 'list' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full flex items-center justify-center py-20">
                            <Loader2 className="animate-spin text-slate-300" size={48} />
                        </div>
                    ) : filteredApplicants.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
                            <Users size={64} className="opacity-20 mb-4" />
                            <p className="text-lg font-semibold">No se encontraron candidatos</p>
                        </div>
                    ) : (
                        filteredApplicants.map(app => (
                            <InterviewCard
                                key={app._id}
                                applicant={app}
                                onClick={() => handleSelectApplicant(app)}
                            />
                        ))
                    )}
                </div>
            )}

            {/* Interview Form Modal (for list view) */}
            {selectedApplicant && activeView === 'list' && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-black text-2xl">
                                    {selectedApplicant.fullName.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">{selectedApplicant.fullName}</h2>
                                    <p className="text-white/80 text-sm font-semibold mt-1">{selectedApplicant.position}</p>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-slate-700 uppercase tracking-wider">Fecha y Hora</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                        value={interviewData.scheduledDate}
                                        onChange={(e) => setInterviewData({ ...interviewData, scheduledDate: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-black text-slate-700 uppercase tracking-wider">Lugar</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                        placeholder="Ej: Sala 1, Oficina Central"
                                        value={interviewData.location}
                                        onChange={(e) => setInterviewData({ ...interviewData, location: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-black text-slate-700 uppercase tracking-wider">Observaciones</label>
                                <textarea
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all h-32 resize-none"
                                    placeholder="Detalles sobre la entrevista..."
                                    value={interviewData.notes}
                                    onChange={(e) => setInterviewData({ ...interviewData, notes: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setSelectedApplicant(null)}
                                    className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-bold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-bold"
                                >
                                    Guardar Entrevista
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Action Modal */}
            {actionModal.show && (
                <InterviewActionModal
                    applicant={selectedApplicant}
                    action={actionModal.action}
                    onClose={() => setActionModal({ show: false, action: null })}
                    onSuccess={handleActionSuccess}
                />
            )}
        </PageWrapper>
    );
};

export default Interviews;
