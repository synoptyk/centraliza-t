import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, FileText, Settings, Save, Trash2, Edit2, Check, Search, AlertCircle, Loader2, X, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const MallaConfigTab = ({ type, projects, initialProject, initialPosition }) => {
    // type: 'hiring' (Documentos), 'prevention' (Cursos y Exámenes)
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState(initialProject || '');
    const [selectedPosition, setSelectedPosition] = useState(initialPosition || '');

    // UI state
    const [isApplyingProfile, setIsApplyingProfile] = useState(false);

    // List of positions for selected project
    const [availablePositions, setAvailablePositions] = useState([]);

    // Selection state
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [selectedExams, setSelectedExams] = useState([]);
    const [selectedHiringDocs, setSelectedHiringDocs] = useState([]);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        fetchConfig();
    }, []);

    useEffect(() => {
        if (selectedProject) {
            const project = projects.find(p => p._id === selectedProject);
            if (project) {
                const positions = new Set();
                project.requirements?.forEach(req => {
                    if (req.position) positions.add(req.position);
                });
                setAvailablePositions(Array.from(positions).sort());
            } else {
                setAvailablePositions([]);
            }
        } else {
            setAvailablePositions([]);
        }
        if (initialPosition && availablePositions.includes(initialPosition)) {
            setSelectedPosition(initialPosition);
        } else {
            setSelectedPosition('');
        }
    }, [selectedProject, projects, initialPosition]);

    useEffect(() => {
        if (selectedPosition && config) {
            const posConfig = config.positionCurriculum?.find(p => p.position === selectedPosition);
            if (posConfig) {
                setSelectedCourses(posConfig.requiredCourses || []);
                setSelectedExams(posConfig.requiredExams || []);
                setSelectedHiringDocs(posConfig.requiredHiringDocs || []);
                setNotes(posConfig.notes || '');
            } else {
                setSelectedCourses([]);
                setSelectedExams([]);
                setSelectedHiringDocs([]);
                setNotes('');
            }
        }
    }, [selectedPosition, config]);

    const fetchConfig = async () => {
        setLoading(true);
        try {
            const res = await api.get('/curriculum/config');
            setConfig(res.data);
        } catch (error) {
            toast.error('Error al cargar configuración');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!selectedPosition) {
            toast.error('Selecciona un cargo');
            return;
        }

        try {
            await api.post('/curriculum/position', {
                position: selectedPosition,
                requiredCourses: selectedCourses,
                requiredExams: selectedExams,
                requiredHiringDocs: selectedHiringDocs,
                notes
            });
            toast.success(`Configuración para ${selectedPosition} guardada`);
            fetchConfig();
        } catch (error) {
            toast.error('Error al guardar configuración');
        }
    };

    const toggleItem = (code, list, setList) => {
        setList(prev =>
            prev.includes(code) ? prev.filter(i => i !== code) : [...prev, code]
        );
    };



    const handleQuickAssign = (profileVariant) => {
        if (!config) return;
        setIsApplyingProfile(profileVariant);

        setTimeout(() => {
            if (profileVariant === 'hiring') {
                const allHiringDocs = config.masterHiringDocs.map(d => d.code);
                setSelectedHiringDocs(allHiringDocs);
                toast.success('Todos los documentos de ingreso han sido asignados.');
            } else if (profileVariant === 'bat1') {
                const allCourses = config.masterCourses.map(c => c.code);
                const bat1Exams = ['ALT-FIS', 'AUD-MET', 'GRA-ALT', 'ORI-COM', 'SIL-ICE', 'DRO-BAT', 'PRE-OCU', 'PSI-LOG', 'AV-RIES', 'PSI-SEN'];
                const examsToAssign = config.masterExams.filter(e => bat1Exams.includes(e.code)).map(e => e.code);

                setSelectedCourses(allCourses);
                setSelectedExams(examsToAssign);
                toast.success('Perfil BAT 1 (Terreno) aplicado correctamente.');
            } else if (profileVariant === 'bat2') {
                const allCourses = config.masterCourses.map(c => c.code);
                const bat2Exams = ['GRA-ALT', 'ORI-COM', 'AUD-MET', 'DRO-BAT'];
                const examsToAssign = config.masterExams.filter(e => bat2Exams.includes(e.code)).map(e => e.code);

                setSelectedCourses(allCourses);
                setSelectedExams(examsToAssign);
                toast.success('Perfil BAT 2 (Administrativo) aplicado correctamente.');
            }
            setIsApplyingProfile(false);
        }, 800); // Simulated delay for visual feedback
    };

    if (loading) return (
        <div className="flex justify-center p-20">
            <Loader2 className="animate-spin text-indigo-500" size={40} />
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white p-6 rounded-3xl border border-slate-100 shadow-sm gap-4">
                <div>
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Administrador de Mallas Requeridas</h3>
                    <p className="text-xs font-bold text-slate-400 mt-1">Configura rápidamente los requisitos exigibles por cargo</p>
                </div>
            </div>

            {/* Selection Area */}
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">1. Seleccionar Proyecto</label>
                        <select
                            value={selectedProject}
                            onChange={(e) => setSelectedProject(e.target.value)}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all cursor-pointer"
                        >
                            <option value="">-- Proyectos Registrados --</option>
                            {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                        </select>
                    </div>

                    <div className="flex-1 space-y-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">2. Seleccionar Cargo</label>
                        <select
                            value={selectedPosition}
                            onChange={(e) => setSelectedPosition(e.target.value)}
                            disabled={!selectedProject}
                            className={`w-full px-5 py-4 border rounded-2xl font-bold transition-all outline-none cursor-pointer ${!selectedProject ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' : 'bg-white border-slate-300 text-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'}`}
                        >
                            <option value="">-- Cargos del Proyecto --</option>
                            {availablePositions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Configuration Area */}
            {selectedPosition && (
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm animate-in fade-in slide-in-from-top-4 space-y-8">
                    {/* Quick Assignment Buttons */}
                    <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-4">
                        <h4 className="font-black text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                            <Activity size={18} className="text-indigo-600" />
                            Asignación Automática de Perfiles
                        </h4>
                        <div className="flex flex-wrap gap-4">
                            {type === 'hiring' ? (
                                <button
                                    onClick={() => handleQuickAssign('hiring')}
                                    disabled={isApplyingProfile === 'hiring'}
                                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 border border-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-md active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
                                >
                                    {isApplyingProfile === 'hiring' ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                    {isApplyingProfile === 'hiring' ? 'Cargando Requisitos...' : 'Asignar 14 Docs Estándar'}
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => handleQuickAssign('bat1')}
                                        disabled={isApplyingProfile === 'bat1'}
                                        className="flex items-center gap-2 px-6 py-3 bg-orange-600 border border-orange-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-orange-700 transition-all shadow-md active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
                                    >
                                        {isApplyingProfile === 'bat1' ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                        {isApplyingProfile === 'bat1' ? 'Cargando Perfil...' : 'Aplicar Perfil BAT 1 (Terreno)'}
                                    </button>
                                    <button
                                        onClick={() => handleQuickAssign('bat2')}
                                        disabled={isApplyingProfile === 'bat2'}
                                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 border border-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-blue-700 transition-all shadow-md active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
                                    >
                                        {isApplyingProfile === 'bat2' ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                        {isApplyingProfile === 'bat2' ? 'Cargando Perfil...' : 'Aplicar Perfil BAT 2 (Administrativo)'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Lists */}
                    {type === 'hiring' ? (
                        <div className="space-y-4">
                            <h4 className="font-black text-slate-800 uppercase tracking-tight">Documentos Obligatorios Requeridos</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                {config.masterHiringDocs?.map(doc => (
                                    <label
                                        key={doc.code}
                                        className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${selectedHiringDocs.includes(doc.code) ? 'bg-indigo-50 border-indigo-500' : 'bg-white border-slate-200 hover:border-indigo-300'}`}
                                    >
                                        <div className={`mt-0.5 min-w-5 h-5 rounded flex items-center justify-center border ${selectedHiringDocs.includes(doc.code) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'}`}>
                                            {selectedHiringDocs.includes(doc.code) && <Check size={14} strokeWidth={4} />}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={selectedHiringDocs.includes(doc.code)}
                                            onChange={() => toggleItem(doc.code, selectedHiringDocs, setSelectedHiringDocs)}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-bold text-xs uppercase leading-snug break-words ${selectedHiringDocs.includes(doc.code) ? 'text-indigo-900' : 'text-slate-700'}`}>{doc.name}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Courses */}
                            <div className="space-y-4">
                                <h4 className="font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                                    <BookOpen size={20} className="text-indigo-600" />
                                    Cursos de Seguridad y Competencias
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                    {config.masterCourses?.map(course => (
                                        <label
                                            key={course.code}
                                            className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${selectedCourses.includes(course.code) ? 'bg-indigo-50 border-indigo-500' : 'bg-white border-slate-200 hover:border-indigo-300'}`}
                                        >
                                            <div className={`mt-0.5 min-w-5 h-5 rounded flex items-center justify-center border ${selectedCourses.includes(course.code) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'}`}>
                                                {selectedCourses.includes(course.code) && <Check size={14} strokeWidth={4} />}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={selectedCourses.includes(course.code)}
                                                onChange={() => toggleItem(course.code, selectedCourses, setSelectedCourses)}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className={`font-bold text-xs uppercase leading-snug break-words ${selectedCourses.includes(course.code) ? 'text-indigo-900' : 'text-slate-700'}`}>{course.name}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Exams */}
                            <div className="space-y-4">
                                <h4 className="font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                                    <Activity size={20} className="text-orange-600" />
                                    Exámenes de Salud Ocupacional (BAT)
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                    {config.masterExams?.map(exam => (
                                        <label
                                            key={exam.code}
                                            className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${selectedExams.includes(exam.code) ? 'bg-orange-50 border-orange-500' : 'bg-white border-slate-200 hover:border-orange-300'}`}
                                        >
                                            <div className={`mt-0.5 min-w-5 h-5 rounded flex items-center justify-center border ${selectedExams.includes(exam.code) ? 'bg-orange-600 border-orange-600 text-white' : 'border-slate-300 bg-white'}`}>
                                                {selectedExams.includes(exam.code) && <Check size={14} strokeWidth={4} />}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={selectedExams.includes(exam.code)}
                                                onChange={() => toggleItem(exam.code, selectedExams, setSelectedExams)}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className={`font-bold text-xs uppercase leading-snug break-words ${selectedExams.includes(exam.code) ? 'text-orange-900' : 'text-slate-700'}`}>{exam.name}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="pt-6 border-t border-slate-100 flex items-center justify-end">
                        <button
                            onClick={handleSave}
                            className="w-full md:w-auto px-10 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                            <Save size={20} /> Guardar Configuración Exacta de Cargo
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MallaConfigTab;
