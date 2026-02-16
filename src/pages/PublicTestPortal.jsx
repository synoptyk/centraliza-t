import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BrainCircuit, Clock, CheckCircle2, AlertCircle, Loader2, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const PublicTestPortal = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [testData, setTestData] = useState(null);
    const [responses, setResponses] = useState({});
    const [completed, setCompleted] = useState(false);
    const [score, setScore] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTestData();
    }, [token]);

    const fetchTestData = async () => {
        try {
            const res = await axios.get(`/api/applicants/tests/public/${token}`);
            setTestData(res.data);

            // Initialize responses
            const initialResponses = {};
            res.data.questions.forEach(q => {
                initialResponses[q.id] = '';
            });
            setResponses(initialResponses);
        } catch (error) {
            setError(error.response?.data?.message || 'Error al cargar el test');
            toast.error(error.response?.data?.message || 'Error al cargar el test');
        } finally {
            setLoading(false);
        }
    };

    const handleResponseChange = (questionId, value) => {
        setResponses(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const validateResponses = () => {
        const allAnswered = Object.values(responses).every(r => r.trim().length >= 50);
        if (!allAnswered) {
            toast.error('Todas las respuestas deben tener al menos 50 caracteres');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateResponses()) return;

        setSubmitting(true);
        try {
            const formattedResponses = testData.questions.map(q => ({
                questionId: q.id,
                question: q.question,
                answer: responses[q.id]
            }));

            const res = await axios.post(`/api/applicants/tests/public/${token}/submit`, {
                responses: formattedResponses
            });

            setScore(res.data.score);
            setCompleted(true);
            toast.success('¡Test completado exitosamente!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al enviar el test');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <Loader2 className="animate-spin text-indigo-500 mx-auto mb-4" size={64} />
                    <p className="text-slate-600 font-semibold">Cargando evaluación...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl w-full text-center">
                    <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle size={48} className="text-red-500" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 mb-4">Test No Disponible</h1>
                    <p className="text-slate-600 text-lg mb-8">{error}</p>
                    <p className="text-sm text-slate-400">Si crees que esto es un error, contacta al equipo de RRHH.</p>
                </div>
            </div>
        );
    }

    if (completed) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl w-full text-center">
                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={48} className="text-emerald-500" />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 mb-4">¡Test Completado!</h1>
                    <p className="text-slate-600 text-lg mb-8">
                        Gracias por completar la evaluación psicolaboral. Tus respuestas han sido registradas exitosamente.
                    </p>
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 mb-8">
                        <p className="text-white/90 text-sm font-bold uppercase tracking-wider mb-2">Puntuación Preliminar</p>
                        <p className="text-white text-6xl font-black">{score}/100</p>
                    </div>
                    <p className="text-sm text-slate-500">
                        El equipo de RRHH revisará tus respuestas y se pondrá en contacto contigo próximamente.
                    </p>
                </div>
            </div>
        );
    }

    const timeRemaining = testData?.expiresAt ? new Date(testData.expiresAt) - new Date() : 0;
    const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                                <BrainCircuit size={32} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">CENTRALIZA-T</h1>
                                <p className="text-slate-600 font-semibold">Evaluación Psicolaboral</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-xl">
                                <Clock size={18} />
                                <span className="font-bold text-sm">{hoursRemaining}h restantes</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border-l-4 border-indigo-500">
                        <p className="text-slate-700 font-semibold mb-2">
                            Hola <span className="text-indigo-600 font-black">{testData.applicant.fullName}</span>,
                        </p>
                        <p className="text-slate-600 text-sm">
                            Estás aplicando para el cargo de <strong>{testData.applicant.position}</strong>.
                            Por favor responde las siguientes 5 preguntas con honestidad y detalle.
                            Cada respuesta debe tener al menos 50 caracteres.
                        </p>
                    </div>
                </div>

                {/* Questions Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {testData.questions.map((question, index) => (
                        <div key={question.id} className="bg-white rounded-3xl shadow-xl p-8">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <span className="text-white font-black text-xl">{index + 1}</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-black text-slate-900 leading-tight mb-2">
                                        {question.question}
                                    </h3>
                                    <p className="text-xs text-slate-400 font-semibold">Mínimo 50 caracteres</p>
                                </div>
                            </div>

                            <textarea
                                value={responses[question.id]}
                                onChange={(e) => handleResponseChange(question.id, e.target.value)}
                                className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all resize-none bg-slate-50"
                                rows="6"
                                placeholder="Escribe tu respuesta aquí... Sé específico y proporciona ejemplos concretos."
                                required
                            />

                            <div className="mt-3 flex items-center justify-between">
                                <span className={`text-sm font-bold ${responses[question.id].length >= 50
                                        ? 'text-emerald-600'
                                        : responses[question.id].length > 0
                                            ? 'text-amber-600'
                                            : 'text-slate-400'
                                    }`}>
                                    {responses[question.id].length} caracteres
                                </span>
                                {responses[question.id].length >= 50 && (
                                    <div className="flex items-center gap-2 text-emerald-600">
                                        <CheckCircle2 size={16} />
                                        <span className="text-xs font-bold">Completo</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Submit Button */}
                    <div className="bg-white rounded-3xl shadow-xl p-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-900 font-black text-lg mb-1">¿Listo para enviar?</p>
                                <p className="text-slate-500 text-sm">
                                    Asegúrate de haber respondido todas las preguntas con detalle.
                                </p>
                            </div>
                            <button
                                type="submit"
                                disabled={submitting || !Object.values(responses).every(r => r.trim().length >= 50)}
                                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl hover:shadow-2xl transition-all font-black text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="animate-spin" size={24} />
                                        Enviando...
                                    </>
                                ) : (
                                    <>
                                        <Send size={24} />
                                        Enviar Evaluación
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="text-center mt-8 text-slate-400 text-sm">
                    <p>© 2026 CENTRALIZA-T - Sistema de Gestión de Recursos Humanos</p>
                    <p className="mt-1">Este test es confidencial y personal. No compartas este enlace.</p>
                </div>
            </div>
        </div>
    );
};

export default PublicTestPortal;
