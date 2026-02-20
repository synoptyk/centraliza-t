import React, { useState, useEffect } from 'react';
import {
    Save, Plus, Trash2, CheckCircle2, Loader2, AlertCircle,
    Share2, Send, MessageCircle, FileText, Eye, Edit3, Edit2,
    User, Users, Mail, Phone, MapPin, Briefcase, GraduationCap,
    Printer, Smartphone, UserPlus
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import PageWrapper from '../components/PageWrapper';
import usePermissions from '../hooks/usePermissions';

const ApplicantEntry = ({ auth, onLogout }) => {
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState('edit'); // 'edit', 'preview'
    const [currentPage, setCurrentPage] = useState(1);
    const applicantsPerPage = 10;
    const { canCreate, canRead, canUpdate, canDelete } = usePermissions('ingreso');
    const [projects, setProjects] = useState([]);
    const [allApplicants, setAllApplicants] = useState([]);
    const [availablePositions, setAvailablePositions] = useState([]);

    const initialApplicantState = {
        fullName: '',
        email: '',
        phone: '',
        rut: '',
        address: '',
        projectId: '',
        position: '',
        clientFormatNumber: '',
        education: [{ degree: '', institution: '', year: '' }],
        workHistory: [{ position: '', company: '', from: '', to: '' }],
        currentWorkSituation: '',
        references: [{ name: '', position: '', company: '', phone: '' }],
        conflictOfInterest: {
            hasFamilyInCompany: false,
            relationship: '',
            employeeName: ''
        },
        assignedLocation: '',
        isWaitlisted: false
    };

    const [applicant, setApplicant] = useState(initialApplicantState);
    const [showWaitlistModal, setShowWaitlistModal] = useState(false);
    const [calculatedLocation, setCalculatedLocation] = useState('');
    const [isFullyOccupied, setIsFullyOccupied] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [projRes, appRes] = await Promise.all([
                api.get('/projects'),
                api.get('/applicants')
            ]);
            setProjects(projRes.data);
            setAllApplicants(appRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            // toast.error('Error al cargar datos de proyectos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (applicant.projectId && applicant.position) {
            const selectedProject = projects.find(p => p._id === applicant.projectId);
            const req = selectedProject?.requirements.find(r => r.position === applicant.position);

            if (req && req.locationDistribution && req.locationDistribution.length > 0) {
                // Find first location with available spots
                let assignedLoc = '';
                let fullyOccupied = true;

                for (const dist of req.locationDistribution) {
                    const currentlyRegistered = allApplicants.filter(a =>
                        a.projectId === applicant.projectId &&
                        a.position === applicant.position &&
                        a.assignedLocation === dist.location &&
                        a.status !== 'Rechazado'
                    ).length;

                    if (currentlyRegistered < dist.quantity) {
                        assignedLoc = dist.location;
                        fullyOccupied = false;
                        break;
                    }
                }

                setCalculatedLocation(assignedLoc);
                setIsFullyOccupied(fullyOccupied);
                setApplicant(prev => ({ ...prev, assignedLocation: assignedLoc }));
            } else {
                setCalculatedLocation('');
                setIsFullyOccupied(false);
                setApplicant(prev => ({ ...prev, assignedLocation: '' }));
            }
        } else {
            setCalculatedLocation('');
            setIsFullyOccupied(false);
            setApplicant(prev => ({ ...prev, assignedLocation: '' }));
        }
    }, [applicant.projectId, applicant.position, projects, allApplicants]);

    const getProgress = (posName) => {
        if (!applicant.projectId) return null;
        const required = availablePositions.find(r => r.position === posName)?.quantity || 0;
        const registered = allApplicants.filter(a => a.projectId === applicant.projectId && a.position === posName).length;
        return { registered, required };
    };

    const handleAddField = (module) => {
        const emptyField = module === 'education' ? { degree: '', institution: '', year: '' } :
            module === 'workHistory' ? { position: '', company: '', from: '', to: '' } :
                { name: '', position: '', company: '', phone: '' };
        setApplicant({ ...applicant, [module]: [...applicant[module], emptyField] });
    };

    const handleRemoveField = (module, index) => {
        const filtered = applicant[module].filter((_, i) => i !== index);
        setApplicant({ ...applicant, [module]: filtered });
    };

    const handleTableChange = (module, index, field, value) => {
        const updated = [...applicant[module]];
        updated[index][field] = value;
        setApplicant({ ...applicant, [module]: updated });
    };

    const shareWhatsApp = () => {
        if (!applicant.fullName) return toast.error('Ingrese nombre del postulante');
        const text = `Hola, te comparto la ficha de postulación de: ${applicant.fullName}. Cargo: ${applicant.position || 'No especificado'}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    const shareEmail = () => {
        if (!applicant.fullName) return toast.error('Ingrese nombre del postulante');
        const subject = `Ficha de Postulación - ${applicant.fullName}`;
        const body = `Se adjunta información del postulante ${applicant.fullName} para el cargo ${applicant.position}.`;
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    const handleEdit = (applicantToEdit) => {
        setApplicant(applicantToEdit);
        setView('edit');
        toast.success('Modo edición activado');
    };

    const handleDelete = async (id) => {
        if (!id) return;
        if (!window.confirm('¿Está seguro de eliminar esta ficha?')) return;

        setLoading(true);
        try {
            await api.delete(`/applicants/${id}`);
            toast.success('Ficha eliminada exitosamente');
            setApplicant(initialApplicantState);
            fetchData();
        } catch (error) {
            console.error('Error deleting:', error);
            toast.error('Error al eliminar la ficha');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        // Waitlist check for new applicants
        if (!applicant._id && applicant.position && isFullyOccupied && !applicant.isWaitlisted) {
            setShowWaitlistModal(true);
            return;
        }

        executeSave(applicant);
    };

    const handleWaitlistAccept = () => {
        const waitlistedApplicant = {
            ...applicant,
            isWaitlisted: true,
            status: 'Lista de Espera',
            assignedLocation: 'Sin Asignación (Lista de Espera)'
        };
        setShowWaitlistModal(false);
        executeSave(waitlistedApplicant);
    };

    const executeSave = async (dataToSave) => {
        setLoading(true);
        try {
            if (dataToSave._id) {
                await api.put(`/applicants/${dataToSave._id}`, dataToSave);
                toast.success('Ficha de Postulación actualizada');
            } else {
                await api.post('/applicants', dataToSave);
                toast.success(dataToSave.isWaitlisted ? 'Postulante guardado en Lista de Espera' : 'Ficha guardada exitosamente');
            }
            setApplicant(initialApplicantState);
            setCalculatedLocation('');
            setIsFullyOccupied(false);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al guardar la ficha');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageWrapper
            className="pb-20"
            title="INGRESO ESTRATÉGICO DE TALENTO"
            subtitle="Captura y registro de candidatos en el ecosistema"
            icon={UserPlus}
            auth={auth}
            onLogout={onLogout}
        >
            <div className="max-w-6xl mx-auto space-y-8 print:p-0 print:m-0 print:max-w-none">
                {/* STICKY CONTROL TOOLBAR - Hidden on Print */}
                <div className="sticky top-24 z-20 bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-slate-200 shadow-2xl shadow-slate-200/50 flex flex-wrap items-center justify-between gap-4 print:hidden">
                    <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
                        <button
                            onClick={() => setView('edit')}
                            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'edit' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Edit3 size={14} /> Gestión
                        </button>
                        <button
                            onClick={() => setView('preview')}
                            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'preview' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Eye size={14} /> Vista Documento
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="h-8 w-px bg-slate-200 mx-2"></div>
                        <button
                            onClick={shareWhatsApp}
                            className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all group"
                            title="Compartir WhatsApp"
                        >
                            <MessageCircle size={18} />
                        </button>
                        <button
                            onClick={shareEmail}
                            className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all"
                            title="Compartir por Email"
                        >
                            <Mail size={18} />
                        </button>
                        <div className="flex gap-2">
                            {canUpdate && (
                                <button
                                    onClick={() => handleEdit(applicant)}
                                    className="p-2 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 border border-slate-100 transition-all shadow-sm"
                                    title="Editar"
                                >
                                    <Edit2 size={16} />
                                </button>
                            )}
                            {canDelete && (
                                <button
                                    onClick={() => handleDelete(applicant._id)}
                                    className="p-2 bg-white text-red-500 rounded-xl hover:bg-red-50 border border-slate-100 transition-all shadow-sm"
                                    title="Eliminar"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => window.print()}
                            className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 transition-all flex items-center gap-2 px-6 ml-2 group"
                        >
                            <Printer size={18} className="group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Imprimir</span>
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-8 py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            Guardar Ficha
                        </button>
                    </div >
                </div >

                {view === 'edit' ? (
                    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">

                        {/* DASHBOARD SUMMARY (PROYECTOS) */}
                        {applicant.projectId && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {availablePositions.map((pos, idx) => {
                                    const prog = getProgress(pos.position);
                                    const isFull = prog.registered >= prog.required;
                                    return (
                                        <div key={idx} className={`p-6 rounded-[2.5rem] border transition-all duration-300 ${isFull ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-100 shadow-sm'}`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{pos.position}</span>
                                                {isFull ? <CheckCircle2 size={18} className="text-emerald-500" /> : <AlertCircle size={18} className="text-amber-500" />}
                                            </div>
                                            <div className="flex items-end justify-between">
                                                <div className="flex items-baseline gap-1">
                                                    <span className={`text-4xl font-black tracking-tighter ${isFull ? 'text-emerald-700' : 'text-slate-900'}`}>{prog.registered}</span>
                                                    <span className="text-slate-400 font-bold text-sm">/ {prog.required}</span>
                                                </div>
                                                <div className={`text-[10px] font-black px-3 py-1 rounded-xl ${isFull ? 'bg-emerald-200/50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                    {Math.round((prog.registered / (prog.required || 1)) * 100)}%
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* VERTICAL FORM CARDS */}
                        <div className="space-y-8">
                            {/* 1. SECCIÓN IDENTIFICACIÓN */}
                            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8">
                                <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><User size={24} /></div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">1. Identificación</h3>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Datos Personales y del Proyecto</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Nombre Completo</label>
                                        <input type="text" className="w-full px-6 py-4 bg-slate-50 border-0 rounded-2xl font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" placeholder="EJ: JUAN PÉREZ" value={applicant.fullName} onChange={(e) => setApplicant({ ...applicant, fullName: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">RUT</label>
                                        <input type="text" className="w-full px-6 py-4 bg-slate-50 border-0 rounded-2xl font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" placeholder="12.345.678-9" value={applicant.rut} onChange={(e) => setApplicant({ ...applicant, rut: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Teléfono</label>
                                        <input type="text" className="w-full px-6 py-4 bg-slate-50 border-0 rounded-2xl font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" placeholder="+56 9..." value={applicant.phone} onChange={(e) => setApplicant({ ...applicant, phone: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email</label>
                                        <input type="email" className="w-full px-6 py-4 bg-slate-50 border-0 rounded-2xl font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" placeholder="juan@ejemplo.com" value={applicant.email} onChange={(e) => setApplicant({ ...applicant, email: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Dirección</label>
                                        <input type="text" className="w-full px-6 py-4 bg-slate-50 border-0 rounded-2xl font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" placeholder="Calle Ejemplo #123" value={applicant.address} onChange={(e) => setApplicant({ ...applicant, address: e.target.value })} />
                                    </div>
                                    <div className="space-y-4 md:col-span-2 pt-6 border-t border-slate-50">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Proyecto Asignado</label>
                                            <select className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all outline-none cursor-pointer" value={applicant.projectId} onChange={(e) => setApplicant({ ...applicant, projectId: e.target.value, position: '' })}>
                                                <option value="">SELECCIONAR PROYECTO...</option>
                                                {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cargo a Postular</label>
                                            <select className="w-full px-6 py-4 bg-indigo-50 text-indigo-700 border-0 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-400 transition-all outline-none cursor-pointer disabled:opacity-30" disabled={!applicant.projectId} value={applicant.position} onChange={(e) => setApplicant({ ...applicant, position: e.target.value })}>
                                                <option value="">SELECCIONAR CARGO...</option>
                                                {availablePositions.map((req, idx) => <option key={idx} value={req.position}>{req.position}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>


                            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><GraduationCap size={24} /></div>
                                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">2. Antecedentes Educacionales</h3>
                                    </div>
                                    <button onClick={() => handleAddField('education')} className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all"><Plus size={20} /></button>
                                </div>
                                <div className="space-y-4">
                                    {applicant.education.map((ed, idx) => (
                                        <div key={idx} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 relative group">
                                            <button onClick={() => handleRemoveField('education', idx)} className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 bg-white shadow-sm rounded-xl opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>
                                            <div className="grid grid-cols-4 gap-4">
                                                <input className="col-span-4 px-4 py-2 bg-white rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Grado / Título" value={ed.degree} onChange={(e) => handleTableChange('education', idx, 'degree', e.target.value)} />
                                                <input className="col-span-3 px-4 py-2 bg-white rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Institución" value={ed.institution} onChange={(e) => handleTableChange('education', idx, 'institution', e.target.value)} />
                                                <input className="col-span-1 px-4 py-2 bg-white rounded-xl text-xs font-black text-center outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Año" value={ed.year} onChange={(e) => handleTableChange('education', idx, 'year', e.target.value)} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Briefcase size={24} /></div>
                                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">3. Trayectoria Laboral</h3>
                                    </div>
                                    <button onClick={() => handleAddField('workHistory')} className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all"><Plus size={20} /></button>
                                </div>
                                <div className="space-y-4">
                                    {applicant.workHistory.map((work, idx) => (
                                        <div key={idx} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 relative group">
                                            <button onClick={() => handleRemoveField('workHistory', idx)} className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 bg-white shadow-sm rounded-xl opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <input className="col-span-1 md:col-span-2 px-4 py-3 bg-white rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Cargo" value={work.position} onChange={(e) => handleTableChange('workHistory', idx, 'position', e.target.value)} />
                                                <input className="px-4 py-3 bg-white rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Empresa" value={work.company} onChange={(e) => handleTableChange('workHistory', idx, 'company', e.target.value)} />
                                                <div className="flex gap-2">
                                                    <input className="w-full px-2 py-3 bg-white rounded-xl text-[10px] font-black text-center outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Desde" value={work.from} onChange={(e) => handleTableChange('workHistory', idx, 'from', e.target.value)} />
                                                    <input className="w-full px-2 py-3 bg-white rounded-xl text-[10px] font-black text-center outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Hasta" value={work.to} onChange={(e) => handleTableChange('workHistory', idx, 'to', e.target.value)} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* REFERENCES CARD (NEW) */}
                            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><Users size={24} /></div>
                                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">4. Referencias Laborales</h3>
                                    </div>
                                    <button onClick={() => handleAddField('references')} className="p-3 bg-amber-50 text-amber-600 rounded-2xl hover:bg-amber-600 hover:text-white transition-all"><Plus size={20} /></button>
                                </div>
                                <div className="space-y-4">
                                    {applicant.references.map((ref, idx) => (
                                        <div key={idx} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 relative group">
                                            <button onClick={() => handleRemoveField('references', idx)} className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 bg-white shadow-sm rounded-xl opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>
                                            <div className="grid grid-cols-2 gap-4">
                                                <input className="col-span-2 px-4 py-2 bg-white rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500" placeholder="Nombre Referencia" value={ref.name} onChange={(e) => handleTableChange('references', idx, 'name', e.target.value)} />
                                                <input className="px-4 py-2 bg-white rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500" placeholder="Cargo" value={ref.position} onChange={(e) => handleTableChange('references', idx, 'position', e.target.value)} />
                                                <input className="px-4 py-2 bg-white rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500" placeholder="Teléfono" value={ref.phone} onChange={(e) => handleTableChange('references', idx, 'phone', e.target.value)} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* CONFLICT OF INTEREST CARD (NEW) */}
                            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl"><AlertCircle size={24} /></div>
                                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">5. Conflicto de Interés</h3>
                                </div>
                                <div className="space-y-6">
                                    <div className="flex items-center gap-6 bg-slate-50 p-6 rounded-3xl">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">¿Tiene familiares en la empresa?</span>
                                        <div className="flex gap-4">
                                            <button onClick={() => setApplicant({ ...applicant, conflictOfInterest: { ...applicant.conflictOfInterest, hasFamilyInCompany: true } })} className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${applicant.conflictOfInterest.hasFamilyInCompany ? 'bg-rose-600 text-white shadow-lg shadow-rose-200' : 'bg-white text-slate-400 border border-slate-100'}`}>Sí</button>
                                            <button onClick={() => setApplicant({ ...applicant, conflictOfInterest: { ...applicant.conflictOfInterest, hasFamilyInCompany: false, relationship: '', employeeName: '' } })} className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!applicant.conflictOfInterest.hasFamilyInCompany ? 'bg-slate-600 text-white shadow-lg shadow-slate-200' : 'bg-white text-slate-400 border border-slate-100'}`}>No</button>
                                        </div>
                                    </div>
                                    {applicant.conflictOfInterest.hasFamilyInCompany && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Relación / Vínculo</label>
                                                <input className="w-full px-5 py-3 bg-slate-50 border-0 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-rose-500" placeholder="EJ: HERMANO/A" value={applicant.conflictOfInterest.relationship} onChange={(e) => setApplicant({ ...applicant, conflictOfInterest: { ...applicant.conflictOfInterest, relationship: e.target.value } })} />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre del Funcionario</label>
                                                <input className="w-full px-5 py-3 bg-slate-50 border-0 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-rose-500" placeholder="NOMBRE COMPLETO" value={applicant.conflictOfInterest.employeeName} onChange={(e) => setApplicant({ ...applicant, conflictOfInterest: { ...applicant.conflictOfInterest, employeeName: e.target.value } })} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                ) : (
                    /* THE FORM (LA FICHA - PRINT OPTIMIZED) */
                    <div className="bg-white shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)] rounded-[0.5rem] border border-slate-200 overflow-hidden font-sans print:shadow-none print:border-slate-400 transition-all animate-in zoom-in-95 duration-500">
                        {/* Header Table Layout */}
                        <div className="grid grid-cols-12 border-b-2 border-slate-900">
                            <div className="col-span-2 border-r-2 border-slate-900 p-6 flex flex-col items-center justify-center text-center">
                                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-2 font-black text-[10px]">LOGO</div>
                                <span className="text-[8px] font-black text-slate-400 uppercase leading-tight">CLIENTE</span>
                            </div>
                            <div className="col-span-10 p-0 flex flex-col">
                                <div className="p-4 flex items-center justify-center border-b-2 border-slate-900 bg-slate-50/30">
                                    <h1 className="text-xl font-black text-slate-900 tracking-[0.25em] uppercase">FICHA DE POSTULACIÓN</h1>
                                </div>
                                <div className="p-3 flex items-center justify-center h-full">
                                    <span className="text-[10px] font-black text-indigo-600 tracking-widest uppercase">FORM: {applicant.clientFormatNumber || 'SIN FORMATO ESPECIFICADO'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-10 space-y-12">
                            {/* SECTION: IDENTIFICACIÓN */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest bg-slate-900 text-white px-4 py-1.5 rounded-sm">IDENTIFICACIÓN DEL POSTULANTE</h2>
                                    <div className="flex-1 h-[2px] bg-slate-100"></div>
                                </div>
                                <div className="grid grid-cols-1 space-y-[-1px] text-[11px]">
                                    {[
                                        { label: 'Nombre Completo', value: applicant.fullName },
                                        { label: 'Rut:', value: applicant.rut },
                                        { label: 'Teléfono Directo:', value: applicant.phone },
                                        { label: 'Email:', value: applicant.email },
                                        { label: 'Dirección:', value: applicant.address }
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex border border-slate-300">
                                            <label className="w-1/3 px-3 py-2 font-black text-[9px] text-slate-400 uppercase tracking-widest border-r border-slate-100">{item.label}</label>
                                            <span className="w-2/3 px-3 py-2 font-bold text-slate-800 uppercase">{item.value || '-'}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* SECTION: ANTECEDENTES EDUCACIONALES */}
                            <section className="space-y-4">
                                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">ANTECEDENTES EDUCACIONALES</h2>
                                <table className="w-full text-left border-2 border-slate-900">
                                    <thead>
                                        <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
                                            <th className="p-3 border-r border-slate-700 w-[55%]">Título y Capacitaciones</th>
                                            <th className="p-3 border-r border-slate-700 w-[35%]">Institución</th>
                                            <th className="p-3 w-[10%] text-center">Año</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {applicant.education.map((ed, idx) => (
                                            <tr key={idx} className="border-b border-slate-200">
                                                <td className="p-3 text-[11px] font-bold text-slate-700 uppercase">{ed.degree || '-'}</td>
                                                <td className="p-3 text-[11px] font-bold text-slate-700 uppercase">{ed.institution || '-'}</td>
                                                <td className="p-3 text-[11px] font-black text-slate-500 text-center uppercase">{ed.year || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </section>

                            {/* SECTION: TRAYECTORIA LABORAL */}
                            <section className="space-y-4">
                                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">TRAYECTORIA LABORAL</h2>
                                <table className="w-full text-left border-2 border-slate-900">
                                    <thead>
                                        <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
                                            <th className="p-3 border-r border-slate-700 w-[40%]">Cargo</th>
                                            <th className="p-3 border-r border-slate-700 w-[36%]">Empresa</th>
                                            <th className="p-3 border-r border-slate-700 w-[12%] text-center">Desde</th>
                                            <th className="p-3 w-[12%] text-center">Hasta</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {applicant.workHistory.map((work, idx) => (
                                            <tr key={idx} className="border-b border-slate-200">
                                                <td className="p-3 text-[11px] font-bold text-slate-700 uppercase">{work.position || '-'}</td>
                                                <td className="p-3 text-[11px] font-bold text-slate-700 uppercase">{work.company || '-'}</td>
                                                <td className="p-3 text-[11px] font-bold text-center text-slate-500 uppercase">{work.from || '-'}</td>
                                                <td className="p-3 text-[11px] font-bold text-center text-slate-500 uppercase">{work.to || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </section>

                            {/* SECTION: CARGO Y SITUACIÓN */}
                            <div className="grid grid-cols-2 border-2 border-slate-900">
                                <div className="p-3 border-r border-slate-900">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cargo a Postular</label>
                                    <p className="text-sm font-black text-indigo-600 uppercase mt-1">{applicant.position || 'POR DEFINIR'}</p>
                                </div>
                                <div className="p-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Situación Laboral</label>
                                    <p className="text-sm font-bold text-slate-800 uppercase mt-1">{applicant.currentWorkSituation || 'N/A'}</p>
                                </div>
                            </div>

                            {/* SECTION: REFERENCIAS */}
                            <section className="space-y-4">
                                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">REFERENCIAS LABORALES</h2>
                                <table className="w-full text-left border-2 border-slate-900">
                                    <thead>
                                        <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
                                            <th className="p-3 border-r border-slate-700 w-[35%]">Nombre</th>
                                            <th className="p-3 border-r border-slate-700 w-[25%]">Cargo</th>
                                            <th className="p-3 border-r border-slate-700 w-[25%]">Empresa</th>
                                            <th className="p-3 w-[15%]">Fono</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {applicant.references.map((ref, idx) => (
                                            <tr key={idx} className="border-b border-slate-200">
                                                <td className="p-3 text-[11px] font-bold text-slate-700 uppercase">{ref.name || '-'}</td>
                                                <td className="p-3 text-[11px] font-bold text-slate-700 uppercase">{ref.position || '-'}</td>
                                                <td className="p-3 text-[11px] font-bold text-slate-700 uppercase">{ref.company || '-'}</td>
                                                <td className="p-3 text-[11px] font-black text-slate-500 uppercase">{ref.phone || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </section>

                            {/* SECTION: CONFLICTO DE INTERÉS */}
                            <section className="space-y-4 p-6 border-2 border-slate-900 bg-slate-50/30">
                                <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Declaración de Conflicto de Interés</h2>
                                <div className="flex items-center gap-6 text-[11px]">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-4 h-4 border border-slate-900 flex items-center justify-center ${applicant.conflictOfInterest.hasFamilyInCompany ? 'bg-slate-900' : ''}`}>
                                            {applicant.conflictOfInterest.hasFamilyInCompany && <div className="w-2 h-2 bg-white"></div>}
                                        </div>
                                        <span className="font-bold uppercase">Sí</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-4 h-4 border border-slate-900 flex items-center justify-center ${!applicant.conflictOfInterest.hasFamilyInCompany ? 'bg-slate-900' : ''}`}>
                                            {!applicant.conflictOfInterest.hasFamilyInCompany && <div className="w-2 h-2 bg-white"></div>}
                                        </div>
                                        <span className="font-bold uppercase">No</span>
                                    </div>
                                    <div className="flex-1 border-b border-slate-400 pb-1">
                                        <span className="text-[9px] font-black text-slate-400 uppercase mr-2">Vínculo:</span>
                                        <span className="font-bold uppercase">{applicant.conflictOfInterest.relationship || 'N/A'}</span>
                                    </div>
                                    <div className="flex-1 border-b border-slate-400 pb-1">
                                        <span className="text-[9px] font-black text-slate-400 uppercase mr-2">Funcionario:</span>
                                        <span className="font-bold uppercase">{applicant.conflictOfInterest.employeeName || 'N/A'}</span>
                                    </div>
                                </div>
                            </section>

                            {/* FOOTER: FIRMAS */}
                            <section className="space-y-6 pt-10 border-t-2 border-dashed border-slate-200 mt-20">
                                <p className="text-[10px] font-bold text-slate-500 italic max-w-3xl leading-relaxed">
                                    Declaro que la información entregada en esta ficha es fidedigna y autorizo a la empresa a realizar las validaciones que estime convenientes.
                                </p>
                                <div className="flex justify-between items-end pt-20">
                                    <div className="text-center w-[40%]">
                                        <div className="border-t-2 border-slate-900 mb-2"></div>
                                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Firma del Postulante</span>
                                        <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">{applicant.fullName}</p>
                                    </div>
                                    <div className="text-center w-[30%]">
                                        <div className="border-t-2 border-slate-900 mb-2"></div>
                                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Fecha</span>
                                        <p className="text-[9px] font-bold text-slate-400 mt-1">{new Date().toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                )}

                {/* WAITLIST ADVISORY MODAL */}
                {showWaitlistModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="p-8 text-center space-y-6">
                                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-500">
                                    <AlertCircle size={40} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Cupos Cubiertos</h2>
                                    <p className="text-sm font-bold text-slate-500 mt-2">
                                        Las vacantes establecidas en todas las Sedes para el cargo de <span className="text-slate-800">"{applicant.position}"</span> ya han sido cubiertas.
                                    </p>
                                    <p className="text-xs font-bold text-amber-600 mt-4 bg-amber-50 p-4 rounded-xl border border-amber-200">
                                        ¿Deseas guardar a este postulante en la <span className="font-black uppercase">Lista de Espera</span> del proyecto?
                                    </p>
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={() => setShowWaitlistModal(false)}
                                        className="flex-1 px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-all"
                                    >
                                        Cancelar Registro
                                    </button>
                                    <button
                                        onClick={handleWaitlistAccept}
                                        className="flex-1 px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-white bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-200 transition-all"
                                    >
                                        Guardar en Espera
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div >
        </PageWrapper >
    );
};

export default ApplicantEntry;
