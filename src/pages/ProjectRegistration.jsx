import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, ClipboardList, MapPin, Building2, UserCircle, Calendar, Clock, GraduationCap, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import PageWrapper from '../components/PageWrapper';
import usePermissions from '../hooks/usePermissions';

const regionsOfChile = [
    "Arica y Parinacota", "Tarapacá", "Antofagasta", "Atacama", "Coquimbo",
    "Valparaíso", "Metropolitana de Santiago", "Libertador General Bernardo O'Higgins",
    "Maule", "Ñuble", "Biobío", "La Araucanía", "Los Ríos", "Los Lagos",
    "Aysén del General Carlos Ibáñez del Campo", "Magallanes y de la Antártica Chilena"
];

const academicLevels = [
    "Enseñanza Media Completa",
    "Técnico Nivel Medio",
    "Técnico Nivel Superior",
    "Profesional Universitario",
    "Postgrado / Magister",
    "Doctorado"
];

const areas = ["MO Tecnica", "MO Supervision", "MO Jefatura", "MO Estructura"];

const ProjectRegistration = ({ auth, onLogout }) => {
    const [editingProject, setEditingProject] = useState(null);
    const { canCreate, canUpdate, canDelete } = usePermissions('proyectos');

    useEffect(() => {
        // Here we can fetch initial data if needed, or leave empty if not.
    }, []);
    const [project, setProject] = useState({
        clientB2BName: '',
        clientB2BRut: '',
        mainMandante: '',
        name: '',
        durationMonths: 1,
        startDate: '',
        regions: [],
        locations: [''],
        requirements: [{
            position: '',
            area: 'MO Tecnica',
            quantity: 1,
            netSalary: 0,
            assignedRegion: '',
            academicRequirement: 'Enseñanza Media Completa',
            yearsOfExperience: 0,
            description: ''
        }]
    });

    const addLocation = () => {
        setProject({ ...project, locations: [...project.locations, ''] });
    };

    const removeLocation = (index) => {
        const newLocs = project.locations.filter((_, i) => i !== index);
        setProject({ ...project, locations: newLocs });
    };

    const handleLocationChange = (index, value) => {
        const newLocs = [...project.locations];
        newLocs[index] = value;
        setProject({ ...project, locations: newLocs });
    };

    const handleRegionToggle = (region) => {
        const newRegions = project.regions.includes(region)
            ? project.regions.filter(r => r !== region)
            : [...project.regions, region];
        setProject({ ...project, regions: newRegions });
    };

    const addRequirement = () => {
        setProject({
            ...project,
            requirements: [...project.requirements, {
                position: '',
                area: 'MO Tecnica',
                quantity: 1,
                netSalary: 0,
                assignedRegion: project.regions[0] || '',
                academicRequirement: 'Enseñanza Media Completa',
                yearsOfExperience: 0,
                description: ''
            }]
        });
    };

    const removeRequirement = (index) => {
        const newReqs = project.requirements.filter((_, i) => i !== index);
        setProject({ ...project, requirements: newReqs });
    };

    const handleRequirementChange = (index, field, value) => {
        const newReqs = [...project.requirements];
        newReqs[index][field] = value;
        setProject({ ...project, requirements: newReqs });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Project submitted:', project);
        toast.success('Proyecto registrado exitosamente');
        // Reset or redirect
    };

    return (
        <PageWrapper
            className="pb-20"
            title="ARQUITECTURA DE PROYECTOS"
            subtitle="Configuración de requerimientos operativos y dotación estratégica"
            icon={ClipboardList}
            auth={auth}
            onLogout={onLogout}
        >
            <div className="max-w-5xl mx-auto space-y-8">

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Datos del Cliente y Proyecto */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-8">
                        <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                            <Building2 className="text-indigo-500" size={20} />
                            <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest">Información del Cliente y Proyecto</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nombre Cliente B2B</label>
                                <input
                                    type="text" required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300"
                                    placeholder="Ej: Constructora ABC"
                                    value={project.clientB2BName}
                                    onChange={(e) => setProject({ ...project, clientB2BName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Rut Cliente B2B</label>
                                <input
                                    type="text" required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300"
                                    placeholder="76.000.000-0"
                                    value={project.clientB2BRut}
                                    onChange={(e) => setProject({ ...project, clientB2BRut: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Mandante Principal</label>
                                <input
                                    type="text" required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300"
                                    placeholder="Ej: Minera Escondida"
                                    value={project.mainMandante}
                                    onChange={(e) => setProject({ ...project, mainMandante: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5 lg:col-span-2">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nombre de Proyecto</label>
                                <input
                                    type="text" required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300"
                                    placeholder="Ej: Mantenimiento Preventivo 2026"
                                    value={project.name}
                                    onChange={(e) => setProject({ ...project, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Duración (Meses)</label>
                                <div className="relative">
                                    <input
                                        type="number" required min="1"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        value={project.durationMonths}
                                        onChange={(e) => setProject({ ...project, durationMonths: e.target.value })}
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">MESES</span>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Fecha de Inicio</label>
                                <input
                                    type="date" required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    value={project.startDate}
                                    onChange={(e) => setProject({ ...project, startDate: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Ubicaciones y Regiones */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
                            <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                                <div className="flex items-center gap-3">
                                    <MapPin className="text-emerald-500" size={20} />
                                    <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest">Regiones del Proyecto</h3>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400">{project.regions.length} Seleccionadas</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-2 scrollbar-hide">
                                {regionsOfChile.map(region => (
                                    <button
                                        key={region}
                                        type="button"
                                        onClick={() => handleRegionToggle(region)}
                                        className={`text - left px - 3 py - 2 rounded - lg text - xs font - medium transition - all border ${project.regions.includes(region)
                                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                            : 'bg-slate-50 border-slate-100 text-slate-500'
                                            } `}
                                    >
                                        {region}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
                            <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                                <div className="flex items-center gap-3">
                                    <UserCircle className="text-amber-500" size={20} />
                                    <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest">Sedes o Dependencias</h3>
                                </div>
                                <button
                                    type="button" onClick={addLocation}
                                    className="p-1 px-3 bg-amber-50 text-amber-600 rounded-full text-[10px] font-bold hover:bg-amber-100 transition-all"
                                >
                                    AGREGAR
                                </button>
                            </div>
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 scrollbar-hide">
                                {project.locations.map((loc, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <input
                                            type="text"
                                            className="flex-1 px-3 py-2 rounded-lg border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none text-xs font-medium"
                                            placeholder={`Ej: Casa Matriz, Sede Poniente...`}
                                            value={loc}
                                            onChange={(e) => handleLocationChange(idx, e.target.value)}
                                        />
                                        {project.locations.length > 1 && (
                                            <button type="button" onClick={() => removeLocation(idx)} className="text-slate-300 hover:text-red-500 p-1">
                                                <Trash2 size={16} />
                                            </button>
                                        )}

                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Requerimientos de Cargos */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-3">
                                <Briefcase className="text-indigo-600" size={24} />
                                <h3 className="text-xl font-bold text-slate-800">Requerimientos de Dotación</h3>
                            </div>
                            <button
                                type="button"
                                onClick={addRequirement}
                                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-bold text-sm shadow-lg shadow-indigo-100"
                            >
                                <Plus size={18} /> Agregar Cargo
                            </button>
                        </div>

                        <div className="space-y-6">
                            {project.requirements.map((req, idx) => (
                                <div key={idx} className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm space-y-8 relative animate-in fade-in slide-in-from-top-4">
                                    <button
                                        type="button" onClick={() => removeRequirement(idx)}
                                        className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                    >
                                        <Trash2 size={20} />
                                    </button>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Cargo / Posición</label>
                                            <input
                                                type="text" required
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold"
                                                placeholder="Ej: Ingeniero Residente"
                                                value={req.position}
                                                onChange={(e) => handleRequirementChange(idx, 'position', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Área</label>
                                            <select
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold"
                                                value={req.area}
                                                onChange={(e) => handleRequirementChange(idx, 'area', e.target.value)}
                                            >
                                                {areas.map(area => <option key={area} value={area}>{area}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Cantidad</label>
                                            <input
                                                type="number" required min="1"
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold"
                                                value={req.quantity}
                                                onChange={(e) => handleRequirementChange(idx, 'quantity', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Sueldo Líquido</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                                <input
                                                    type="number" required
                                                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold"
                                                    value={req.netSalary}
                                                    onChange={(e) => handleRequirementChange(idx, 'netSalary', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Región Asignada</label>
                                            <select
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold disabled:opacity-50"
                                                disabled={project.regions.length === 0}
                                                value={req.assignedRegion}
                                                onChange={(e) => handleRequirementChange(idx, 'assignedRegion', e.target.value)}
                                            >
                                                <option value="">Seleccionar Región</option>
                                                {project.regions.map(r => <option key={r} value={r}>{r}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Requerimiento Académico</label>
                                            <select
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold"
                                                value={req.academicRequirement}
                                                onChange={(e) => handleRequirementChange(idx, 'academicRequirement', e.target.value)}
                                            >
                                                {academicLevels.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Experiencia (Años)</label>
                                            <input
                                                type="number" required min="0"
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold"
                                                value={req.yearsOfExperience}
                                                onChange={(e) => handleRequirementChange(idx, 'yearsOfExperience', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1.5 lg:col-span-1">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Descripción / Obs.</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold"
                                                placeholder="Detalles adicionales..."
                                                value={req.description}
                                                onChange={(e) => handleRequirementChange(idx, 'description', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end sticky bottom-8">
                        <button
                            type="submit"
                            className="flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-[2rem] hover:bg-slate-800 transition-all font-bold shadow-2xl shadow-slate-300"
                        >
                            <Save size={24} /> Guardar Proyecto Completo
                        </button>
                    </div>
                </form>
            </div>
        </PageWrapper>
    );
};

export default ProjectRegistration;
