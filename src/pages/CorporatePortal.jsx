import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
    Building2,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    Calendar,
    CheckCircle2,
    Loader2,
    Shield,
    Globe,
    Zap,
    Users,
    ChevronDown
} from 'lucide-react';
import API_URL from '../config/api';
import { formatRut } from '../utils/rutUtils';
import { chileanRegions } from '../utils/locationData';

const CorporatePortal = () => {
    const { companyId } = useParams();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [companyName, setCompanyName] = useState('Nuestra Agencia');
    const [communes, setCommunes] = useState([]);

    const [formData, setFormData] = useState({
        companyRut: '',
        companyName: '',
        companyRegion: '',
        projectOrArea: '',
        requiredPosition: '',
        workRegion: '',
        workCommune: '',
        hrContact: '',
        hrEmail: '',
        projectedHiringDate: '',
        companyId: companyId
    });

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/companies/${companyId}/public`);
                setCompanyName(response.data.name);
                // Resolve slug/id to real ObjectID for backend data integrity
                setFormData(prev => ({ ...prev, companyId: response.data._id }));
            } catch (err) {
                console.error('Error fetching company:', err);
            }
        };
        if (companyId) fetchCompany();
    }, [companyId]);

    const handleRegionChange = (e, field) => {
        const value = e.target.value;
        setFormData({ ...formData, [field]: value });

        if (field === 'workRegion') {
            const region = chileanRegions.find(r => r.name === value);
            setCommunes(region ? region.communes : []);
            setFormData(prev => ({ ...prev, workRegion: value, workCommune: '' }));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'companyRut') {
            setFormData({ ...formData, [name]: formatRut(value) });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await axios.post(`${API_URL}/api/professionals/public/corporate-register`, formData);
            setSuccess(true);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Error en el envío de la solicitud');
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-[#0f172a]">
                <div className="max-w-md w-full bg-white rounded-[40px] p-12 text-center shadow-2xl border-4 border-purple-500/20">
                    <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                        <CheckCircle2 size={48} className="text-purple-600" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">¡SOLICITUD ENVIADA!</h2>
                    <p className="text-slate-500 font-medium leading-relaxed mb-8">
                        Hemos recibido tus requerimientos de personal. Un consultor estratégico de {companyName} se contactará contigo a la brevedad.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-purple-600 text-white font-black py-4 px-8 rounded-2xl w-full hover:bg-purple-700 transition-all uppercase tracking-widest text-xs"
                    >
                        Nueva Solicitud
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f172a] text-white flex flex-col font-sans selection:bg-purple-500/30">
            {/* Header */}
            <div className="relative overflow-hidden pt-20 pb-16 px-6 text-center">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-purple-600/10 blur-[120px] rounded-full -z-10"></div>
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-[0.3em]">
                        <Building2 size={14} /> Red de Especialistas Centraliza-T
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-none italic uppercase">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">GARANTÍA HUMANA</span>
                    </h1>
                    <p className="text-slate-300 text-lg md:text-2xl font-black italic max-w-2xl mx-auto leading-tight uppercase tracking-tight">
                        "En Centraliza-T no delegamos tu búsqueda a algoritmos. Validamos humanamente cada perfil para conectar tu empresa con los expertos que realmente necesitas."
                    </p>
                </div>
            </div>

            {/* Form */}
            <div className="max-w-5xl mx-auto w-full px-6 pb-24">
                <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-xl rounded-[40px] border border-white/10 p-8 md:p-12 shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                    {loading && (
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-50 rounded-[40px] flex items-center justify-center">
                            <div className="text-center space-y-4">
                                <Loader2 size={48} className="text-purple-500 animate-spin mx-auto" />
                                <p className="font-black text-xs uppercase tracking-widest text-white">Enviando requerimientos...</p>
                            </div>
                        </div>
                    )}

                    {/* Section 1: Company Info */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                                <Building2 size={20} />
                            </div>
                            <h3 className="font-black text-sm uppercase tracking-widest text-slate-200">Datos de la Empresa</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="relative">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block">Nombre Empresa</label>
                                <input required name="companyName" value={formData.companyName} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm outline-none focus:border-purple-500/50" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block">RUT Empresa</label>
                                    <input required name="companyRut" value={formData.companyRut} onChange={handleChange} placeholder="76.123.456-7" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm outline-none focus:border-purple-500/50" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block">Región Casa Matriz</label>
                                    <select required name="companyRegion" value={formData.companyRegion} onChange={(e) => handleRegionChange(e, 'companyRegion')} className="w-full bg-[#0f172a] border border-white/10 rounded-2xl py-4 px-6 text-sm outline-none focus:border-purple-500/50 appearance-none">
                                        <option value="">Seleccionar</option>
                                        {chileanRegions.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Requirements */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                <Zap size={20} />
                            </div>
                            <h3 className="font-black text-sm uppercase tracking-widest text-slate-200">Requerimiento de Personal</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block">Proyecto o Área</label>
                                    <input required name="projectOrArea" value={formData.projectOrArea} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm outline-none" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block">Cargo Vacante</label>
                                    <input required name="requiredPosition" value={formData.requiredPosition} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm outline-none" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block">Región de Despliegue</label>
                                    <select required name="workRegion" value={formData.workRegion} onChange={(e) => handleRegionChange(e, 'workRegion')} className="w-full bg-[#0f172a] border border-white/10 rounded-2xl py-4 px-6 text-sm outline-none appearance-none">
                                        <option value="">Seleccionar</option>
                                        {chileanRegions.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block">Comuna</label>
                                    <select required name="workCommune" value={formData.workCommune} onChange={handleChange} disabled={!formData.workRegion} className="w-full bg-[#0f172a] border border-white/10 rounded-2xl py-4 px-6 text-sm outline-none appearance-none disabled:opacity-30">
                                        <option value="">Seleccionar</option>
                                        {communes.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: HR Contact & Date */}
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-white/10">
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block">Contacto RRHH</label>
                            <input required name="hrContact" value={formData.hrContact} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm outline-none" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block">Correo RRHH</label>
                            <input required type="email" name="hrEmail" value={formData.hrEmail} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm outline-none" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block">Fecha Contratación</label>
                            <input required type="date" name="projectedHiringDate" value={formData.projectedHiringDate} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm outline-none [color-scheme:dark]" />
                        </div>
                    </div>

                    {error && <div className="md:col-span-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-6 rounded-3xl text-xs font-bold uppercase tracking-widest text-center">{error}</div>}

                    <div className="md:col-span-2">
                        <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 py-6 rounded-3xl font-black uppercase tracking-[0.3em] text-sm hover:scale-[1.02] transition-all">
                            Enviar Requerimiento
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CorporatePortal;
