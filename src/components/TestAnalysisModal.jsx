import React from 'react';
import { X, TrendingUp, TrendingDown, Award, AlertCircle, FileText } from 'lucide-react';

const TestAnalysisModal = ({ applicant, onClose }) => {
    if (!applicant || !applicant.tests?.psycholaborTest) return null;

    const test = applicant.tests.psycholaborTest;
    const analysis = test.analysis || {};
    const traits = analysis.personalityTraits || {};

    const getScoreColor = (score) => {
        if (score >= 70) return 'text-emerald-600';
        if (score >= 50) return 'text-amber-600';
        return 'text-red-600';
    };

    const getScoreBg = (score) => {
        if (score >= 70) return 'bg-emerald-100';
        if (score >= 50) return 'bg-amber-100';
        return 'bg-red-100';
    };

    const traitLabels = {
        teamwork: 'Trabajo en Equipo',
        problemSolving: 'Resolución de Problemas',
        adaptability: 'Adaptabilidad',
        leadership: 'Liderazgo',
        ethics: 'Ética Profesional'
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-indigo-500 to-purple-600 p-6 relative z-10">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl transition-colors flex items-center justify-center text-white font-bold"
                    >
                        <X size={20} />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-black text-3xl">
                            {applicant.fullName.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white uppercase tracking-tight">
                                Análisis Psicolaboral
                            </h2>
                            <p className="text-white/90 text-lg font-semibold mt-1">
                                {applicant.fullName} - {applicant.position}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8">
                    {/* Overall Score */}
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8 text-center">
                        <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Puntuación General</p>
                        <div className={`text-7xl font-black ${getScoreColor(analysis.overallScore || 0)} mb-4`}>
                            {analysis.overallScore || 0}<span className="text-4xl">/100</span>
                        </div>
                        <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl ${getScoreBg(analysis.overallScore || 0)} ${getScoreColor(analysis.overallScore || 0)} font-bold`}>
                            <Award size={20} />
                            {analysis.overallScore >= 70 ? 'Excelente' : analysis.overallScore >= 50 ? 'Aceptable' : 'Requiere Mejora'}
                        </div>
                    </div>

                    {/* Personality Traits */}
                    <div>
                        <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight flex items-center gap-2">
                            <Award className="text-indigo-500" size={24} />
                            Perfil de Competencias
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(traits).map(([key, value]) => (
                                <div key={key} className="bg-slate-50 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-bold text-slate-700">{traitLabels[key]}</span>
                                        <span className={`text-lg font-black ${getScoreColor(value || 0)}`}>
                                            {value || 0}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${value >= 70 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' :
                                                    value >= 50 ? 'bg-gradient-to-r from-amber-400 to-amber-600' :
                                                        'bg-gradient-to-r from-red-400 to-red-600'
                                                }`}
                                            style={{ width: `${value || 0}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Strengths & Weaknesses */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Strengths */}
                        <div className="bg-emerald-50 rounded-2xl p-6 border-l-4 border-emerald-500">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="text-emerald-600" size={24} />
                                <h4 className="text-lg font-black text-emerald-900 uppercase tracking-tight">Fortalezas</h4>
                            </div>
                            {analysis.strengths && analysis.strengths.length > 0 ? (
                                <ul className="space-y-2">
                                    {analysis.strengths.map((strength, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-emerald-800">
                                            <span className="text-emerald-500 font-black">•</span>
                                            <span className="text-sm font-semibold">{strength}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-emerald-600 italic">No se identificaron fortalezas destacadas</p>
                            )}
                        </div>

                        {/* Weaknesses */}
                        <div className="bg-amber-50 rounded-2xl p-6 border-l-4 border-amber-500">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingDown className="text-amber-600" size={24} />
                                <h4 className="text-lg font-black text-amber-900 uppercase tracking-tight">Áreas de Desarrollo</h4>
                            </div>
                            {analysis.weaknesses && analysis.weaknesses.length > 0 ? (
                                <ul className="space-y-2">
                                    {analysis.weaknesses.map((weakness, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-amber-800">
                                            <span className="text-amber-500 font-black">•</span>
                                            <span className="text-sm font-semibold">{weakness}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-amber-600 italic">No se identificaron debilidades significativas</p>
                            )}
                        </div>
                    </div>

                    {/* Recommendations */}
                    {analysis.recommendations && (
                        <div className="bg-indigo-50 rounded-2xl p-6 border-l-4 border-indigo-500">
                            <div className="flex items-center gap-2 mb-3">
                                <AlertCircle className="text-indigo-600" size={24} />
                                <h4 className="text-lg font-black text-indigo-900 uppercase tracking-tight">Recomendación</h4>
                            </div>
                            <p className="text-indigo-800 font-semibold leading-relaxed">
                                {analysis.recommendations}
                            </p>
                        </div>
                    )}

                    {/* Detailed Feedback */}
                    {analysis.detailedFeedback && (
                        <div className="bg-slate-50 rounded-2xl p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <FileText className="text-slate-600" size={24} />
                                <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">Análisis Detallado</h4>
                            </div>
                            <pre className="text-sm text-slate-700 font-mono whitespace-pre-wrap leading-relaxed">
                                {analysis.detailedFeedback}
                            </pre>
                        </div>
                    )}

                    {/* Responses */}
                    {test.responses && test.responses.length > 0 && (
                        <div>
                            <h4 className="text-lg font-black text-slate-900 mb-4 uppercase tracking-tight">Respuestas del Candidato</h4>
                            <div className="space-y-4">
                                {test.responses.map((response, idx) => (
                                    <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5">
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <span className="text-white font-black text-sm">{idx + 1}</span>
                                            </div>
                                            <p className="text-sm font-bold text-slate-700 leading-tight">{response.question}</p>
                                        </div>
                                        <p className="text-sm text-slate-600 pl-11 leading-relaxed bg-slate-50 p-4 rounded-lg">
                                            {response.answer}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TestAnalysisModal;
