import React, { useState } from 'react';
import { X, CheckCircle2, RefreshCw, Ban, Pause, Calendar, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const InterviewActionModal = ({ applicant, onClose, onSuccess, action }) => {
    const [formData, setFormData] = useState({
        newDate: applicant?.interview?.scheduledDate || '',
        reason: ''
    });
    const [loading, setLoading] = useState(false);

    const actionConfig = {
        confirm: {
            title: 'Confirmar Entrevista',
            icon: CheckCircle2,
            color: 'indigo',
            description: '¿Confirmar que la entrevista está agendada y el candidato ha sido notificado?',
            showDateField: false,
            showReasonField: false,
            endpoint: `/applicants/${applicant?._id}/interview/confirm`,
            method: 'put'
        },
        reschedule: {
            title: 'Reprogramar Entrevista',
            icon: RefreshCw,
            color: 'amber',
            description: 'Ingresa la nueva fecha y hora, y la razón de la reprogramación.',
            showDateField: true,
            showReasonField: true,
            endpoint: `/applicants/${applicant?._id}/interview/reschedule`,
            method: 'put'
        },
        cancel: {
            title: 'Cancelar Entrevista',
            icon: Ban,
            color: 'red',
            description: 'Esta acción cancelará permanentemente la entrevista. Ingresa la razón de la cancelación.',
            showDateField: false,
            showReasonField: true,
            endpoint: `/applicants/${applicant?._id}/interview/cancel`,
            method: 'put'
        },
        suspend: {
            title: 'Suspender Entrevista',
            icon: Pause,
            color: 'orange',
            description: 'La entrevista se suspenderá temporalmente. Ingresa la razón de la suspensión.',
            showDateField: false,
            showReasonField: true,
            endpoint: `/applicants/${applicant?._id}/interview/suspend`,
            method: 'put'
        }
    };

    const config = actionConfig[action] || actionConfig.confirm;
    const Icon = config.icon;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (config.showReasonField && !formData.reason.trim()) {
            toast.error('Por favor ingresa una razón');
            return;
        }

        if (config.showDateField && !formData.newDate) {
            toast.error('Por favor selecciona una nueva fecha');
            return;
        }

        setLoading(true);
        try {
            await api[config.method](config.endpoint, formData);
            toast.success(`Entrevista ${action === 'confirm' ? 'confirmada' : action === 'reschedule' ? 'reprogramada' : action === 'cancel' ? 'cancelada' : 'suspendida'} exitosamente`);
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al procesar la acción');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-4">
                {/* Header */}
                <div className={`p-6 bg-gradient-to-r from-${config.color}-500 to-${config.color}-600 relative`}>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
                    >
                        <X size={20} className="text-white" />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Icon size={28} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight">{config.title}</h2>
                            <p className="text-white/80 text-sm font-semibold mt-1">{applicant?.fullName}</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Description */}
                    <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <AlertCircle size={20} className="text-slate-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-slate-700">{config.description}</p>
                    </div>

                    {/* Current Interview Info */}
                    <div className="space-y-3 p-4 bg-slate-50 rounded-xl">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">Información Actual</h3>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-slate-400" />
                                <span className="text-sm text-slate-700 font-semibold">
                                    {applicant?.interview?.scheduledDate
                                        ? new Date(applicant.interview.scheduledDate).toLocaleString('es-CL', {
                                            day: '2-digit',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })
                                        : 'Sin fecha agendada'}
                                </span>
                            </div>
                            {applicant?.interview?.location && (
                                <div className="text-sm text-slate-600">
                                    <span className="font-bold">Lugar:</span> {applicant.interview.location}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* New Date Field */}
                    {config.showDateField && (
                        <div className="space-y-2">
                            <label className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                <Calendar size={16} className="text-slate-400" />
                                Nueva Fecha y Hora
                            </label>
                            <input
                                type="datetime-local"
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-semibold"
                                value={formData.newDate}
                                onChange={(e) => setFormData({ ...formData, newDate: e.target.value })}
                                required={config.showDateField}
                            />
                        </div>
                    )}

                    {/* Reason Field */}
                    {config.showReasonField && (
                        <div className="space-y-2">
                            <label className="text-sm font-black text-slate-700 uppercase tracking-wider">
                                Razón {action === 'reschedule' ? 'de Reprogramación' : action === 'cancel' ? 'de Cancelación' : 'de Suspensión'}
                            </label>
                            <textarea
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all h-32 resize-none"
                                placeholder="Describe la razón..."
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                required={config.showReasonField}
                            />
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-bold"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex-1 px-6 py-3 bg-gradient-to-r from-${config.color}-500 to-${config.color}-600 text-white rounded-xl hover:shadow-lg transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Procesando...
                                </>
                            ) : (
                                <>
                                    <Icon size={20} />
                                    Confirmar
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InterviewActionModal;
