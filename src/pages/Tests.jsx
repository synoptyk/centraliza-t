import React, { useState, useEffect } from 'react';
import { BrainCircuit, Search, Loader2, Send, BarChart3, Users, CheckCircle2, Clock, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import PageWrapper from '../components/PageWrapper';
import usePermissions from '../hooks/usePermissions';
import TestCard from '../components/TestCard';
import TestAnalysisModal from '../components/TestAnalysisModal';

const Tests = ({ onOpenCENTRALIZAT, auth, onLogout }) => {
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Todos');
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const [showAnalysisModal, setShowAnalysisModal] = useState(false);
    const { canUpdate } = usePermissions('tests');

    useEffect(() => {
        fetchApplicants();
    }, []);

    const fetchApplicants = async () => {
        setLoading(true);
        try {
            const res = await api.get('/applicants');
            // Filter: En Test status
            const filtered = res.data.filter(a => a.status === 'En Test');
            setApplicants(filtered);
        } catch (error) {
            toast.error('Error al cargar postulantes');
        } finally {
            setLoading(false);
        }
    };

    const handleSendTest = async (applicant) => {
        if (!applicant.email) {
            toast.error('El postulante no tiene email registrado');
            return;
        }

        const confirmed = window.confirm(
            `¿Enviar test psicolaboral a ${applicant.fullName} (${applicant.email})?`
        );

        if (!confirmed) return;

        try {
            await api.post(`/applicants/${applicant._id}/tests/send-psycholabor`);
            toast.success(`Test enviado exitosamente a ${applicant.email}`);
            fetchApplicants();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al enviar test');
        }
    };

    const handleViewResults = async (applicant) => {
        try {
            const res = await api.get(`/applicants/${applicant._id}/tests/results`);
            setSelectedApplicant(res.data.applicant);
            setShowAnalysisModal(true);
        } catch (error) {
            toast.error('Error al cargar resultados');
        }
    };

    // Calculate stats
    const stats = {
        total: applicants.length,
        pending: applicants.filter(a => a.tests?.psycholaborTest?.status === 'Pendiente' || !a.tests?.psycholaborTest?.status).length,
        sent: applicants.filter(a => ['Enviado', 'En Progreso'].includes(a.tests?.psycholaborTest?.status)).length,
        completed: applicants.filter(a => a.tests?.psycholaborTest?.status === 'Completado').length
    };

    // Filter applicants
    const filteredApplicants = applicants.filter(a => {
        const matchesSearch = a.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.rut.includes(searchTerm) ||
            a.position.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        if (statusFilter === 'Todos') return true;

        const testStatus = a.tests?.psycholaborTest?.status || 'Pendiente';
        return testStatus === statusFilter;
    });

    return (
        <PageWrapper
            className="space-y-8"
            title="EVALUACIÓN TÉCNICA PSICOLABORAL"
            subtitle="Sistema inteligente de análisis de competencias"
            icon={BrainCircuit}
            auth={auth}
            onLogout={onLogout}
        >
            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                            <Users size={24} className="text-slate-600" />
                        </div>
                        <span className="text-3xl font-black text-slate-900">{stats.total}</span>
                    </div>
                    <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Total Candidatos</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                            <Clock size={24} className="text-amber-600" />
                        </div>
                        <span className="text-3xl font-black text-amber-600">{stats.pending}</span>
                    </div>
                    <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Pendientes</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Send size={24} className="text-blue-600" />
                        </div>
                        <span className="text-3xl font-black text-blue-600">{stats.sent}</span>
                    </div>
                    <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Enviados</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                            <CheckCircle2 size={24} className="text-emerald-600" />
                        </div>
                        <span className="text-3xl font-black text-emerald-600">{stats.completed}</span>
                    </div>
                    <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Completados</p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    {/* Search */}
                    <div className="relative flex-1 w-full md:w-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, RUT o cargo..."
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-semibold text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-slate-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-sm"
                        >
                            <option value="Todos">Todos los Estados</option>
                            <option value="Pendiente">Pendiente</option>
                            <option value="Enviado">Enviado</option>
                            <option value="En Progreso">En Progreso</option>
                            <option value="Completado">Completado</option>
                            <option value="Vencido">Vencido</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Applicants Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-indigo-500" size={48} />
                </div>
            ) : filteredApplicants.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredApplicants.map(applicant => (
                        <TestCard
                            key={applicant._id}
                            applicant={applicant}
                            onSendTest={handleSendTest}
                            onViewResults={handleViewResults}
                        />
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BrainCircuit size={40} className="text-slate-400" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">No hay candidatos</h3>
                    <p className="text-slate-500">
                        {searchTerm || statusFilter !== 'Todos'
                            ? 'No se encontraron candidatos con los filtros aplicados'
                            : 'No hay candidatos en estado "En Test"'}
                    </p>
                </div>
            )}

            {/* Analysis Modal */}
            {showAnalysisModal && selectedApplicant && (
                <TestAnalysisModal
                    applicant={selectedApplicant}
                    onClose={() => {
                        setShowAnalysisModal(false);
                        setSelectedApplicant(null);
                    }}
                />
            )}
        </PageWrapper>
    );
};

export default Tests;
