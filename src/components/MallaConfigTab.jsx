import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, FileText, Settings, Save, Trash2, Edit2, Check, Search, AlertCircle, Loader2, X } from 'lucide-react';
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

    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <Loader2 className="animate-spin text-indigo-500" size={40} />
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            {/* Master Catalog Action */}
            <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Catálogo Maestro</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gestiona los {type === 'hiring' ? 'Documentos' : 'Cursos y Exámenes'} disponibles para todos los cargos</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl"
                >
                    <Plus size={16} /> Agregar al Catálogo
                </button>
            </div>

            {/* Project & Position Selector */}
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">1. Seleccionar Proyecto</label>
                        <select
                            value={selectedProject}
                            onChange={(e) => setSelectedProject(e.target.value)}
                            className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-black text-sm text-slate-800 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                        >
                            <option value="">-- Ver proyectos registrados --</option>
                            {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                        </select>
                    </div>

                    <div className="space-y-3">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">2. Cargo a configurar</label>
                        <select
                            value={selectedPosition}
                            onChange={(e) => setSelectedPosition(e.target.value)}
                            disabled={!selectedProject}
                            className={`w-full px-6 py-5 border-2 rounded-3xl font-black text-sm transition-all outline-none ${!selectedProject ? 'bg-slate-50 border-slate-100 text-slate-300' : 'bg-white border-indigo-100 text-slate-800 focus:ring-4 focus:ring-indigo-500/10'}`}
                        >
                            <option value="">-- Seleccionar cargo --</option>
                            {availablePositions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                        </select>
                    </div>
                </div>

                {selectedPosition ? (
                    <div className="pt-8 border-t border-slate-50 animate-in fade-in slide-in-from-top-4 space-y-10">
                        {type === 'hiring' ? (
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-4">
                                    <h4 className="font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                                        <FileText size={20} className="text-indigo-600" />
                                        Documentos Obligatorios para {selectedPosition}
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {config.masterHiringDocs?.map(doc => (
                                            <label
                                                key={doc.code}
                                                className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${selectedHiringDocs.includes(doc.code) ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-300'}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={selectedHiringDocs.includes(doc.code)}
                                                    onChange={() => toggleItem(doc.code, selectedHiringDocs, setSelectedHiringDocs)}
                                                />
                                                <div className="flex-1">
                                                    <p className="font-black text-xs uppercase truncate">{doc.name}</p>
                                                    <p className={`text-[10px] font-bold uppercase tracking-wider ${selectedHiringDocs.includes(doc.code) ? 'text-indigo-200' : 'text-slate-400'}`}>{doc.category}</p>
                                                </div>
                                                {selectedHiringDocs.includes(doc.code) && <Check size={18} />}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Courses */}
                                <div className="space-y-4">
                                    <h4 className="font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                                        <BookOpen size={20} className="text-indigo-600" />
                                        Cursos Req.
                                    </h4>
                                    <div className="space-y-2">
                                        {config.masterCourses?.map(course => (
                                            <label
                                                key={course.code}
                                                className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${selectedCourses.includes(course.code) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 hover:border-indigo-300'}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={selectedCourses.includes(course.code)}
                                                    onChange={() => toggleItem(course.code, selectedCourses, setSelectedCourses)}
                                                />
                                                <div className="flex-1">
                                                    <p className="font-black text-xs uppercase">{course.name}</p>
                                                    <p className="text-[10px] uppercase font-bold text-indigo-300">{course.code}</p>
                                                </div>
                                                {selectedCourses.includes(course.code) && <Check size={18} />}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Exams */}
                                <div className="space-y-4">
                                    <h4 className="font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                                        <Activity size={20} className="text-purple-600" />
                                        Exámenes Req.
                                    </h4>
                                    <div className="space-y-2">
                                        {config.masterExams?.map(exam => (
                                            <label
                                                key={exam.code}
                                                className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${selectedExams.includes(exam.code) ? 'bg-purple-600 border-purple-600 text-white' : 'bg-white border-slate-100 hover:border-purple-300'}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={selectedExams.includes(exam.code)}
                                                    onChange={() => toggleItem(exam.code, selectedExams, setSelectedExams)}
                                                />
                                                <div className="flex-1">
                                                    <p className="font-black text-xs uppercase">{exam.name}</p>
                                                    <p className="text-[10px] uppercase font-bold text-purple-300">{exam.code}</p>
                                                </div>
                                                {selectedExams.includes(exam.code) && <Check size={18} />}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-white p-6 rounded-3xl border border-slate-100">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Notas Técnicas para {selectedPosition}</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                rows="3"
                                placeholder="Especifique puntos clave de este perfil..."
                            />
                        </div>

                        <button
                            onClick={handleSave}
                            className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-2xl shadow-indigo-200 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                            <Save size={20} /> Guardar Configuración de Cargo
                        </button>
                    </div>
                ) : (
                    <div className="p-20 text-center space-y-6">
                        <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto">
                            <Settings size={48} className="text-indigo-200 animate-spin-slow" />
                        </div>
                        <div className="max-w-xs mx-auto">
                            <p className="font-black text-slate-800 uppercase tracking-tight text-xl">Configuración de Cargo</p>
                            <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">Selecciona un proyecto y luego un cargo para definir sus requisitos obligatorios</p>
                        </div>
                    </div>
                )}
            </div>

            {showAddModal && <AddMasterItemModal type={type} onClose={() => setShowAddModal(false)} onAdd={handleAddMasterItem} />}
        </div>
    );
};

const AddMasterItemModal = ({ type: defaultType, onClose, onAdd }) => {
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
