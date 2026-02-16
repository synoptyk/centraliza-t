import React, { useState, useEffect } from 'react';
import { Loader2, Users } from 'lucide-react';
import InterviewCard, { INTERVIEW_STATUS_COLORS } from './InterviewCard';
import InterviewActionModal from './InterviewActionModal';

const PIPELINE_COLUMNS = [
    { id: 'Pendiente Agendar', title: 'Pendiente Agendar' },
    { id: 'Agendada', title: 'Agendada' },
    { id: 'Confirmada', title: 'Confirmada' },
    { id: 'Realizada', title: 'Realizada' },
    { id: 'Reprogramada', title: 'Reprogramada' },
    { id: 'Cancelada', title: 'Cancelada/Suspendida' }
];

const InterviewPipeline = ({ applicants, loading, onRefresh }) => {
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const [actionModal, setActionModal] = useState({ show: false, action: null });

    // Group applicants by interview status
    const groupedApplicants = PIPELINE_COLUMNS.reduce((acc, column) => {
        if (column.id === 'Cancelada') {
            // Combine Cancelada and Suspendida
            acc[column.id] = applicants.filter(app =>
                app.interview?.interviewStatus === 'Cancelada' ||
                app.interview?.interviewStatus === 'Suspendida'
            );
        } else {
            acc[column.id] = applicants.filter(app =>
                (app.interview?.interviewStatus || 'Pendiente Agendar') === column.id
            );
        }
        return acc;
    }, {});

    const handleCardClick = (applicant) => {
        setSelectedApplicant(applicant);
    };

    const handleAction = (action) => {
        setActionModal({ show: true, action });
    };

    const handleActionSuccess = () => {
        setSelectedApplicant(null);
        setActionModal({ show: false, action: null });
        onRefresh();
    };

    return (
        <div className="space-y-6">
            {/* Pipeline Board */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {PIPELINE_COLUMNS.map(column => {
                    const columnApplicants = groupedApplicants[column.id] || [];
                    const statusConfig = INTERVIEW_STATUS_COLORS[column.id] || INTERVIEW_STATUS_COLORS['Pendiente Agendar'];

                    return (
                        <div key={column.id} className="flex flex-col min-h-[600px]">
                            {/* Column Header */}
                            <div className={`p-4 ${statusConfig.bg} border-2 ${statusConfig.border} rounded-t-2xl`}>
                                <div className="flex items-center justify-between">
                                    <h3 className={`text-xs font-black uppercase tracking-wider ${statusConfig.text}`}>
                                        {column.title}
                                    </h3>
                                    <div className={`w-7 h-7 rounded-lg ${statusConfig.bg} border ${statusConfig.border} flex items-center justify-center`}>
                                        <span className={`text-xs font-black ${statusConfig.text}`}>
                                            {columnApplicants.length}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Column Content */}
                            <div className="flex-1 bg-slate-50 border-2 border-t-0 border-slate-200 rounded-b-2xl p-3 space-y-3 overflow-y-auto">
                                {loading ? (
                                    <div className="flex items-center justify-center py-10">
                                        <Loader2 className="animate-spin text-slate-300" size={32} />
                                    </div>
                                ) : columnApplicants.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                                        <Users size={32} className="opacity-20 mb-2" />
                                        <p className="text-xs font-semibold">Sin candidatos</p>
                                    </div>
                                ) : (
                                    columnApplicants.map(applicant => (
                                        <InterviewCard
                                            key={applicant._id}
                                            applicant={applicant}
                                            onClick={() => handleCardClick(applicant)}
                                            compact
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Selected Applicant Detail Panel */}
            {selectedApplicant && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-indigo-600 shadow-2xl z-40 animate-in slide-in-from-bottom-full">
                    <div className="max-w-7xl mx-auto p-6">
                        <div className="flex items-start justify-between gap-6">
                            {/* Applicant Info */}
                            <div className="flex-1">
                                <InterviewCard applicant={selectedApplicant} onClick={() => { }} />
                            </div>

                            {/* Quick Actions */}
                            <div className="w-80 space-y-3">
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-4">Acciones Rápidas</h3>

                                {selectedApplicant.interview?.interviewStatus !== 'Confirmada' &&
                                    selectedApplicant.interview?.interviewStatus !== 'Realizada' &&
                                    selectedApplicant.interview?.interviewStatus !== 'Cancelada' &&
                                    selectedApplicant.interview?.interviewStatus !== 'Suspendida' && (
                                        <button
                                            onClick={() => handleAction('confirm')}
                                            className="w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-bold text-sm flex items-center justify-center gap-2"
                                        >
                                            Confirmar Entrevista
                                        </button>
                                    )}

                                {selectedApplicant.interview?.interviewStatus !== 'Cancelada' &&
                                    selectedApplicant.interview?.interviewStatus !== 'Suspendida' &&
                                    selectedApplicant.interview?.interviewStatus !== 'Realizada' && (
                                        <button
                                            onClick={() => handleAction('reschedule')}
                                            className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:shadow-lg transition-all font-bold text-sm flex items-center justify-center gap-2"
                                        >
                                            Reprogramar
                                        </button>
                                    )}

                                {selectedApplicant.interview?.interviewStatus !== 'Cancelada' &&
                                    selectedApplicant.interview?.interviewStatus !== 'Realizada' && (
                                        <>
                                            <button
                                                onClick={() => handleAction('cancel')}
                                                className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg transition-all font-bold text-sm flex items-center justify-center gap-2"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={() => handleAction('suspend')}
                                                className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all font-bold text-sm flex items-center justify-center gap-2"
                                            >
                                                Suspender
                                            </button>
                                        </>
                                    )}

                                <button
                                    onClick={() => setSelectedApplicant(null)}
                                    className="w-full px-4 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-bold text-sm"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
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
        </div>
    );
};

export default InterviewPipeline;
