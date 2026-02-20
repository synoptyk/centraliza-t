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
    const [showAddModal, setShowAddModal] = useState(false);

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

    const handleAddMasterItem = async (formData) => {
        try {
            let endpoint = '';
            if (formData.type === 'course') endpoint = '/curriculum/courses';
            else if (formData.type === 'exam') endpoint = '/curriculum/exams';
            else if (formData.type === 'hiring') endpoint = '/curriculum/hiring-docs';

            const res = await api.post(endpoint, formData);
            setConfig(res.data);
            toast.success('Ítem agregado al catálogo maestro');
            setShowAddModal(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al agregar ítem');
        }
    };

    const handleQuickAssign = (profileVariant) => {
        if (!config) return;

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
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl whitespace-nowrap"
                >
                    <Plus size={16} /> Crear Ítem Maestro
                </button>
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
                                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 border border-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-md active:scale-95"
                                >
                                    <Check size={16} /> Asignar 14 Docs Estándar
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => handleQuickAssign('bat1')}
                                        className="flex items-center gap-2 px-6 py-3 bg-orange-600 border border-orange-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-orange-700 transition-all shadow-md active:scale-95"
                                    >
                                        <Check size={16} /> Aplicar Perfil BAT 1 (Terreno)
                                    </button>
                                    <button
                                        onClick={() => handleQuickAssign('bat2')}
                                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 border border-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-blue-700 transition-all shadow-md active:scale-95"
                                    >
                                        <Check size={16} /> Aplicar Perfil BAT 2 (Administrativo)
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

            {showAddModal && <AddMasterItemModal type={type} onClose={() => setShowAddModal(false)} onAdd={handleAddMasterItem} />}
        </div>
    );
}; const AddMasterItemModal = ({ type: defaultType, onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        type: defaultType === 'hiring' ? 'hiring' : 'course',
        code: '',
        name: '',
        category: 'Legal',
        description: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd(formData);
    };

    const categories = {
        hiring: ['Legal', 'Social', 'Educacional', 'Personal', 'Otros'],
        course: ['Seguridad', 'Técnico', 'Operacional', 'Administrativo', 'Salud'],
        exam: ['Médico', 'Psicológico', 'Técnico', 'Físico']
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl border border-white/20 animate-in zoom-in-95 duration-200">
                <div className="p-10 space-y-8">
                    <div className="flex justify-between items-center">
                        <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Nuevo Ítem Maestro</h3>
                        <button onClick={onClose} className="p-3 bg-slate-100 rounded-2xl text-slate-400 hover:bg-slate-900 hover:text-white transition-all"><X size={20} /></button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {defaultType === 'prevention' && (
                            <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-2xl">
                                <button type="button" onClick={() => setFormData({ ...formData, type: 'course', category: 'Seguridad' })} className={`py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.type === 'course' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400'}`}>Cursos</button>
                                <button type="button" onClick={() => setFormData({ ...formData, type: 'exam', category: 'Médico' })} className={`py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.type === 'exam' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400'}`}>Exámenes</button>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-4">Código Unificado</label>
                                <input
                                    type="text"
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                    placeholder="EJ: RUT-001, IHN-01"
                                    value={formData.code}
                                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-4">Nombre Descriptivo</label>
                                <input
                                    type="text"
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                    placeholder="EJ: Fotocopia de Carné"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-4">Categoría</label>
                                <select
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {categories[formData.type].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all">Cancelar</button>
                            <button type="submit" className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-xl">Guardar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MallaConfigTab;
