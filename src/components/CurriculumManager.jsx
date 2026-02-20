import React, { useState, useEffect } from 'react';
import { X, Plus, BookOpen, FileText, Settings, Save, Trash2, Edit2, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const CurriculumManager = ({ onClose }) => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('courses'); // courses, exams, positions
    const [showAddModal, setShowAddModal] = useState(false);
    const [positions, setPositions] = useState([]);
    const [selectedPosition, setSelectedPosition] = useState('');

    useEffect(() => {
        fetchConfig();
        fetchPositions();
    }, []);

    const fetchConfig = async () => {
        try {
            const res = await api.get('/curriculum/config');
            setConfig(res.data);
        } catch (error) {
            toast.error('Error al cargar configuración');
        } finally {
            setLoading(false);
        }
    };

    const fetchPositions = async () => {
        try {
            const res = await api.get('/projects');
            const allPositions = new Set();
            res.data.forEach(project => {
                // Read from the new requirements structure
                project.requirements?.forEach(req => {
                    if (req.position) {
                        allPositions.add(req.position);
                    }
                });
            });
            setPositions(Array.from(allPositions).sort());
        } catch (error) {
            console.error('Error fetching positions:', error);
            toast.error('Error al cargar cargos de proyectos');
        }
    };


    const handleAddCourse = async (courseData) => {
        try {
            const res = await api.post('/curriculum/courses', courseData);
            setConfig(res.data);
            toast.success('Curso agregado exitosamente');
            setShowAddModal(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al agregar curso');
        }
    };

    const handleAddExam = async (examData) => {
        try {
            const res = await api.post('/curriculum/exams', examData);
            setConfig(res.data);
            toast.success('Examen agregado exitosamente');
            setShowAddModal(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al agregar examen');
        }
    };

    const handleConfigurePosition = async (positionData) => {
        try {
            const res = await api.post('/curriculum/position', positionData);
            setConfig(res.data);
            toast.success('Configuración de cargo guardada');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al configurar cargo');
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white rounded-3xl p-8">
                    <p className="text-slate-600 font-semibold">Cargando configuración...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl transition-colors flex items-center justify-center text-white"
                    >
                        <X size={20} />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Settings size={28} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white uppercase tracking-tight">
                                Configuración de Mallas Curriculares
                            </h2>
                            <p className="text-white/90 text-sm font-semibold mt-1">
                                Gestión de cursos, exámenes y asignación por cargo
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 bg-slate-50 px-6">
                    <button
                        onClick={() => setActiveTab('courses')}
                        className={`px-6 py-4 font-bold text-sm uppercase tracking-wider transition-all ${activeTab === 'courses'
                            ? 'text-indigo-600 border-b-4 border-indigo-600'
                            : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        <BookOpen size={16} className="inline mr-2" />
                        Cursos ({config?.masterCourses?.length || 0})
                    </button>
                    <button
                        onClick={() => setActiveTab('exams')}
                        className={`px-6 py-4 font-bold text-sm uppercase tracking-wider transition-all ${activeTab === 'exams'
                            ? 'text-indigo-600 border-b-4 border-indigo-600'
                            : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        <FileText size={16} className="inline mr-2" />
                        Exámenes ({config?.masterExams?.length || 0})
                    </button>
                    <button
                        onClick={() => setActiveTab('positions')}
                        className={`px-6 py-4 font-bold text-sm uppercase tracking-wider transition-all ${activeTab === 'positions'
                            ? 'text-indigo-600 border-b-4 border-indigo-600'
                            : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        <Settings size={16} className="inline mr-2" />
                        Configuración por Cargo
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'courses' && (
                        <CoursesTab
                            courses={config?.masterCourses || []}
                            onAdd={() => setShowAddModal(true)}
                            onRefresh={fetchConfig}
                        />
                    )}
                    {activeTab === 'exams' && (
                        <ExamsTab
                            exams={config?.masterExams || []}
                            onAdd={() => setShowAddModal(true)}
                            onRefresh={fetchConfig}
                        />
                    )}
                    {activeTab === 'positions' && (
                        <PositionsTab
                            positions={positions}
                            config={config}
                            onConfigure={handleConfigurePosition}
                        />
                    )}
                </div>

                {/* Add Modal */}
                {showAddModal && (
                    <AddItemModal
                        type={activeTab}
                        onClose={() => setShowAddModal(false)}
                        onAdd={activeTab === 'courses' ? handleAddCourse : handleAddExam}
                    />
                )}
            </div>
        </div>
    );
};

// Courses Tab Component
const CoursesTab = ({ courses, onAdd, onRefresh }) => {
    const categories = ['Seguridad', 'Técnico', 'Operacional', 'Administrativo', 'Salud'];
    const [filter, setFilter] = useState('Todos');

    const filteredCourses = filter === 'Todos'
        ? courses
        : courses.filter(c => c.category === filter);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm"
                >
                    <option value="Todos">Todas las Categorías</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
                <button
                    onClick={onAdd}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-bold text-sm"
                >
                    <Plus size={18} />
                    Agregar Curso
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCourses.map(course => (
                    <div key={course.code} className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <span className="text-xs font-black text-indigo-600 uppercase tracking-wider">
                                    {course.code}
                                </span>
                                <h4 className="text-lg font-black text-slate-900 mt-1">{course.name}</h4>
                            </div>
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${course.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                }`}>
                                {course.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-3">{course.description || 'Sin descripción'}</p>
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-500">Categoría: {course.category}</span>
                            <span className="font-bold text-slate-500">Vigencia: {course.validityMonths} meses</span>
                        </div>
                    </div>
                ))}
            </div>

            {filteredCourses.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                    <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="font-bold">No hay cursos en esta categoría</p>
                </div>
            )}
        </div>
    );
};

// Exams Tab Component
const ExamsTab = ({ exams, onAdd, onRefresh }) => {
    const categories = ['Médico', 'Psicológico', 'Técnico', 'Físico'];
    const [filter, setFilter] = useState('Todos');

    const filteredExams = filter === 'Todos'
        ? exams
        : exams.filter(e => e.category === filter);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm"
                >
                    <option value="Todos">Todas las Categorías</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
                <button
                    onClick={onAdd}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-bold text-sm"
                >
                    <Plus size={18} />
                    Agregar Examen
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredExams.map(exam => (
                    <div key={exam.code} className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <span className="text-xs font-black text-purple-600 uppercase tracking-wider">
                                    {exam.code}
                                </span>
                                <h4 className="text-lg font-black text-slate-900 mt-1">{exam.name}</h4>
                            </div>
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${exam.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                }`}>
                                {exam.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-3">{exam.description || 'Sin descripción'}</p>
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-500">Categoría: {exam.category}</span>
                            <span className="font-bold text-slate-500">Vigencia: {exam.validityMonths} meses</span>
                        </div>
                    </div>
                ))}
            </div>

            {filteredExams.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                    <FileText size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="font-bold">No hay exámenes en esta categoría</p>
                </div>
            )}
        </div>
    );
};

// Positions Tab Component
const PositionsTab = ({ positions, config, onConfigure }) => {
    const [selectedPosition, setSelectedPosition] = useState('');
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [selectedExams, setSelectedExams] = useState([]);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (selectedPosition && config) {
            const posConfig = config.positionCurriculum?.find(p => p.position === selectedPosition);
            if (posConfig) {
                setSelectedCourses(posConfig.requiredCourses || []);
                setSelectedExams(posConfig.requiredExams || []);
                setNotes(posConfig.notes || '');
            } else {
                setSelectedCourses([]);
                setSelectedExams([]);
                setNotes('');
            }
        }
    }, [selectedPosition, config]);

    const handleSave = () => {
        if (!selectedPosition) {
            toast.error('Selecciona un cargo');
            return;
        }

        onConfigure({
            position: selectedPosition,
            requiredCourses: selectedCourses,
            requiredExams: selectedExams,
            notes
        });
    };

    const toggleCourse = (code) => {
        setSelectedCourses(prev =>
            prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
        );
    };

    const toggleExam = (code) => {
        setSelectedExams(prev =>
            prev.includes(code) ? prev.filter(e => e !== code) : [...prev, code]
        );
    };

    return (
        <div className="space-y-6">
            <div className="bg-indigo-50 rounded-2xl p-6 border-l-4 border-indigo-500">
                <h3 className="font-black text-indigo-900 mb-4">Seleccionar Cargo</h3>
                <select
                    value={selectedPosition}
                    onChange={(e) => setSelectedPosition(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-xl font-bold text-sm"
                >
                    <option value="">-- Selecciona un cargo --</option>
                    {positions.map(pos => (
                        <option key={pos} value={pos}>{pos}</option>
                    ))}
                </select>
            </div>

            {selectedPosition && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Courses */}
                        <div className="bg-slate-50 rounded-2xl p-6">
                            <h4 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                                <BookOpen size={20} className="text-indigo-500" />
                                Cursos Requeridos ({selectedCourses.length})
                            </h4>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {config?.masterCourses?.filter(c => c.isActive).map(course => (
                                    <label
                                        key={course.code}
                                        className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 cursor-pointer transition-all"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedCourses.includes(course.code)}
                                            onChange={() => toggleCourse(course.code)}
                                            className="w-5 h-5 text-indigo-600 rounded"
                                        />
                                        <div className="flex-1">
                                            <p className="font-bold text-sm text-slate-900">{course.name}</p>
                                            <p className="text-xs text-slate-500">{course.code} - {course.category}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Exams */}
                        <div className="bg-slate-50 rounded-2xl p-6">
                            <h4 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                                <FileText size={20} className="text-purple-500" />
                                Exámenes Requeridos ({selectedExams.length})
                            </h4>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {config?.masterExams?.filter(e => e.isActive).map(exam => (
                                    <label
                                        key={exam.code}
                                        className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 hover:border-purple-300 cursor-pointer transition-all"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedExams.includes(exam.code)}
                                            onChange={() => toggleExam(exam.code)}
                                            className="w-5 h-5 text-purple-600 rounded"
                                        />
                                        <div className="flex-1">
                                            <p className="font-bold text-sm text-slate-900">{exam.name}</p>
                                            <p className="text-xs text-slate-500">{exam.code} - {exam.category}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-6">
                        <label className="block font-black text-slate-900 mb-2">Notas Adicionales</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl resize-none"
                            rows="3"
                            placeholder="Información adicional sobre los requisitos de este cargo..."
                        />
                    </div>

                    <button
                        onClick={handleSave}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-black text-sm uppercase tracking-wider"
                    >
                        <Save size={20} />
                        Guardar Configuración
                    </button>
                </>
            )}
        </div>
    );
};

// Add Item Modal
const AddItemModal = ({ type, onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        category: type === 'courses' ? 'Técnico' : 'Médico',
        description: '',
        validityMonths: 12
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd(formData);
    };

    const courseCategories = ['Seguridad', 'Técnico', 'Operacional', 'Administrativo', 'Salud'];
    const examCategories = ['Médico', 'Psicológico', 'Técnico', 'Físico'];
    const categories = type === 'courses' ? courseCategories : examCategories;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
                <h3 className="text-2xl font-black text-slate-900 mb-6">
                    Agregar {type === 'courses' ? 'Curso' : 'Examen'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Código</label>
                        <input
                            type="text"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                            placeholder="CURSO-001"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Nombre</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                            placeholder="Trabajo en Altura"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Categoría</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Descripción</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl resize-none"
                            rows="3"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Vigencia (meses)</label>
                        <input
                            type="number"
                            value={formData.validityMonths}
                            onChange={(e) => setFormData({ ...formData, validityMonths: parseInt(e.target.value) })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                            min="1"
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-all font-bold"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-bold"
                        >
                            Agregar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CurriculumManager;
