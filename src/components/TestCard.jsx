import React from 'react';
import { Clock, CheckCircle2, Send, AlertCircle, XCircle, Loader2 } from 'lucide-react';

export const TEST_STATUS_COLORS = {
    'Pendiente': { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300', icon: Clock },
    'Enviado': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', icon: Send },
    'En Progreso': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300', icon: Loader2 },
    'Completado': { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300', icon: CheckCircle2 },
    'Vencido': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', icon: XCircle }
};

const TestCard = ({ applicant, onSendTest, onViewResults, compact = false }) => {
    const test = applicant.tests?.psycholaborTest || {};
    const status = test.status || 'Pendiente';
    const statusConfig = TEST_STATUS_COLORS[status];
    const StatusIcon = statusConfig.icon;

    const getActionButton = () => {
        switch (status) {
            case 'Pendiente':
                return (
                    <button
                        onClick={() => onSendTest(applicant)}
                        className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-bold text-sm"
                    >
                        Enviar Test
                    </button>
                );
            case 'Completado':
                return (
                    <button
                        onClick={() => onViewResults(applicant)}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all font-bold text-sm"
                    >
                        Ver Resultados
                    </button>
                );
            case 'Enviado':
            case 'En Progreso':
                return (
                    <div className="text-xs text-slate-500 font-semibold">
                        Esperando respuesta...
                    </div>
                );
            case 'Vencido':
                return (
                    <button
                        onClick={() => onSendTest(applicant)}
                        className="px-4 py-2 bg-slate-600 text-white rounded-xl hover:bg-slate-700 transition-all font-bold text-sm"
                    >
                        Reenviar
                    </button>
                );
            default:
                return null;
        }
    };

    if (compact) {
        return (
            <div className={`p-4 rounded-xl border-2 ${statusConfig.border} ${statusConfig.bg} transition-all hover:shadow-md`}>
                <div className="flex items-center justify-between mb-2">
                    <h4 className="font-black text-slate-900 text-sm uppercase tracking-tight">{applicant.fullName}</h4>
                    <StatusIcon size={16} className={statusConfig.text} />
                </div>
                <p className="text-xs text-slate-600 font-semibold mb-2">{applicant.position}</p>
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg ${statusConfig.bg} ${statusConfig.text} text-[10px] font-bold uppercase`}>
                    {status}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all">
            {/* Header */}
            <div className={`flex items-center justify-between mb-4 pb-4 border-b-2 ${statusConfig.border}`}>
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${statusConfig.bg} flex items-center justify-center`}>
                        <StatusIcon size={24} className={statusConfig.text} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{applicant.fullName}</h3>
                        <p className="text-sm text-slate-600 font-semibold">{applicant.position}</p>
                    </div>
                </div>
                <div className={`px-4 py-2 rounded-xl ${statusConfig.bg} ${statusConfig.text} font-bold text-sm uppercase tracking-wider`}>
                    {status}
                </div>
            </div>

            {/* Details */}
            <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-semibold">Email:</span>
                    <span className="text-slate-900 font-bold">{applicant.email}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-semibold">RUT:</span>
                    <span className="text-slate-900 font-bold">{applicant.rut}</span>
                </div>

                {test.sentAt && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 font-semibold">Enviado:</span>
                        <span className="text-slate-900 font-bold">
                            {new Date(test.sentAt).toLocaleDateString('es-CL')}
                        </span>
                    </div>
                )}

                {test.completedAt && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 font-semibold">Completado:</span>
                        <span className="text-slate-900 font-bold">
                            {new Date(test.completedAt).toLocaleDateString('es-CL')}
                        </span>
                    </div>
                )}

                {status === 'Completado' && test.analysis?.overallScore !== undefined && (
                    <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-100">
                        <span className="text-slate-500 font-semibold">Puntuación:</span>
                        <span className={`font-black text-lg ${test.analysis.overallScore >= 70 ? 'text-emerald-600' :
                                test.analysis.overallScore >= 50 ? 'text-amber-600' :
                                    'text-red-600'
                            }`}>
                            {test.analysis.overallScore}/100
                        </span>
                    </div>
                )}
            </div>

            {/* Action Button */}
            <div className="pt-4 border-t border-slate-100">
                {getActionButton()}
            </div>
        </div>
    );
};

export default TestCard;
