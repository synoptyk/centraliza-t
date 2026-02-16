import React from 'react';
import { Calendar, MapPin, User, Clock, CheckCircle2, XCircle, AlertCircle, RefreshCw, Ban, Pause } from 'lucide-react';

const INTERVIEW_STATUS_COLORS = {
    'Pendiente Agendar': { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300', icon: Clock },
    'Agendada': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', icon: Calendar },
    'Confirmada': { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-300', icon: CheckCircle2 },
    'Realizada': { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300', icon: CheckCircle2 },
    'Reprogramada': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300', icon: RefreshCw },
    'Cancelada': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', icon: Ban },
    'Suspendida': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', icon: Pause }
};

const InterviewCard = ({ applicant, onClick, compact = false }) => {
    const interview = applicant.interview || {};
    const status = interview.interviewStatus || 'Pendiente Agendar';
    const statusConfig = INTERVIEW_STATUS_COLORS[status] || INTERVIEW_STATUS_COLORS['Pendiente Agendar'];
    const StatusIcon = statusConfig.icon;

    const formatDate = (date) => {
        if (!date) return 'Sin agendar';
        return new Date(date).toLocaleString('es-CL', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (compact) {
        return (
            <button
                onClick={onClick}
                className="w-full p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all text-left group"
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <h4 className="font-black text-sm text-slate-900 uppercase tracking-tight truncate group-hover:text-indigo-600 transition-colors">
                            {applicant.fullName}
                        </h4>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{applicant.position}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <Clock size={12} className="text-slate-400" />
                            <span className="text-[10px] text-slate-600 font-bold">{formatDate(interview.scheduledDate)}</span>
                        </div>
                    </div>
                    <div className={`px-2.5 py-1 rounded-lg ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border} flex items-center gap-1.5`}>
                        <StatusIcon size={12} />
                        <span className="text-[9px] font-black uppercase tracking-wider">{status}</span>
                    </div>
                </div>
            </button>
        );
    }

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all cursor-pointer group overflow-hidden"
        >
            {/* Header with Status */}
            <div className={`p-4 ${statusConfig.bg} border-b ${statusConfig.border} flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                    <StatusIcon size={18} className={statusConfig.text} />
                    <span className={`text-xs font-black uppercase tracking-wider ${statusConfig.text}`}>{status}</span>
                </div>
                {interview.result && interview.result !== 'Pendiente' && (
                    <div className={`px-2.5 py-1 rounded-lg ${interview.result === 'OK' ? 'bg-emerald-500' : 'bg-red-500'} text-white`}>
                        <span className="text-[10px] font-black uppercase">{interview.result}</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
                {/* Applicant Info */}
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg">
                        {applicant.fullName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-black text-lg text-slate-900 uppercase tracking-tight truncate group-hover:text-indigo-600 transition-colors">
                            {applicant.fullName}
                        </h3>
                        <p className="text-sm text-slate-600 font-semibold truncate">{applicant.position}</p>
                        <p className="text-xs text-slate-400 mt-1">{applicant.rut}</p>
                    </div>
                </div>

                {/* Interview Details */}
                <div className="space-y-2.5 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                            <Calendar size={16} className="text-slate-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Fecha y Hora</p>
                            <p className="text-sm text-slate-900 font-black">{formatDate(interview.scheduledDate)}</p>
                        </div>
                    </div>

                    {interview.location && (
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                <MapPin size={16} className="text-slate-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Ubicación</p>
                                <p className="text-sm text-slate-900 font-black">{interview.location}</p>
                            </div>
                        </div>
                    )}

                    {interview.confirmedBy && (
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                                <User size={16} className="text-indigo-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Confirmado por</p>
                                <p className="text-sm text-slate-900 font-black">{interview.confirmedBy}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Notes Preview */}
                {interview.notes && (
                    <div className="pt-3 border-t border-slate-100">
                        <p className="text-xs text-slate-600 line-clamp-2">{interview.notes}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InterviewCard;
export { INTERVIEW_STATUS_COLORS };
