import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
    User,
    Mail,
    Phone,
    MapPin,
    GraduationCap,
    Briefcase,
    Calendar,
    Upload,
    CheckCircle2,
    Loader2,
    Shield,
    Globe,
    Zap,
    HeartPulse,
    ChevronDown
} from 'lucide-react';
import API_URL from '../config/api';
import { formatRut, validateRut } from '../utils/rutUtils';
import { chileanRegions } from '../utils/locationData';

const PortfolioPortal = () => {
    const { companyId } = useParams();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [companyName, setCompanyName] = useState('Nuestra Agencia');
    const [communes, setCommunes] = useState([]);

    const [formData, setFormData] = useState({
        rut: '',
        fullName: '',
        birthDate: '',
        studies: '',
        specialty: '',
        nationality: 'Chilena',
        gender: '',
        region: '',
        commune: '',
        workingStatus: '',
        email: '',
        phone: '',
        cvUrl: '',
        companyId: companyId
    });

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/companies/${companyId}/public`);
                setCompanyName(response.data.name);
            } catch (err) {
                console.error('Error fetching company:', err);
            }
        };
        if (companyId) fetchCompany();
    }, [companyId]);

    const handleRegionChange = (e) => {
        const value = e.target.value;
        const region = chileanRegions.find(r => r.name === value);
        setCommunes(region ? region.communes : []);
        setFormData({ ...formData, region: value, commune: '' });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'rut') {
            setFormData({ ...formData, [name]: formatRut(value) });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        const data = new FormData();
        data.append('file', file);
        data.append('upload_preset', 'centralizat_presets');

        try {
            const res = await axios.post(
                'https://api.cloudinary.com/v1_1/dou9m6iky/image/upload',
                data
            );
            setFormData({ ...formData, cvUrl: res.data.secure_url });
            setLoading(false);
        } catch (err) {
            console.error('Upload error:', err);
            setError('Error al subir el CV. Inténtalo de nuevo.');
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateRut(formData.rut)) {
            setError('El RUT ingresado no es válido');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await axios.post(`${API_URL}/api/professionals/public/register`, formData);
            setSuccess(true);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Error en el registro');
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-[#0f172a]">
                <div className="max-w-md w-full bg-white rounded-[40px] p-12 text-center shadow-2xl border-4 border-emerald-500/20">
                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                        <CheckCircle2 size={48} className="text-emerald-600" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">¡REGISTRO EXITOSO!</h2>
                    <p className="text-slate-500 font-medium leading-relaxed mb-8">
                        Tus datos han sido integrados en nuestra Cartera Profesional. Nos pondremos en contacto contigo pronto.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-slate-900 text-white font-black py-4 px-8 rounded-2xl w-full hover:bg-slate-800 transition-all uppercase tracking-widest text-xs"
                    >
                        Volver al Portal
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f172a] text-white flex flex-col font-sans selection:bg-indigo-500/30">
            {/* Header / Hero */}
            <div className="relative overflow-hidden pt-20 pb-16 px-6">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-600/20 blur-[120px] rounded-full -z-10"></div>
                <div className="max-w-4xl mx-auto text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em]">
                        <Zap size={14} /> Cartera Profesional
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none italic uppercase">
                        Únete a <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{companyName}</span>
                    </h1>
                    <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                        Regístrate y posiciónate ante las mejores oportunidades laborales.
                    </p>
                </div>
            </div>

            {/* Form Section */}
            <div className="max-w-5xl mx-auto w-full px-6 pb-24">
                <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-xl rounded-[40px] border border-white/10 p-8 md:p-12 shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                    {loading && (
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-50 rounded-[40px] flex items-center justify-center">
                            <div className="text-center space-y-4">
                                <Loader2 size={48} className="text-indigo-500 animate-spin mx-auto" />
                                <p className="font-black text-xs uppercase tracking-widest text-white">Procesando tu talento...</p>
                            </div>
                        </div>
                    )}

                    {/* Personal Info */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                <User size={20} />
                            </div>
                            <h3 className="font-black text-sm uppercase tracking-widest text-slate-200">Información Personal</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block">Nombre Completo</label>
                                <input required name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Ej: Juan Pérez" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm outline-none focus:border-indigo-500/50" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block">RUT</label>
                                    <input required name="rut" value={formData.rut} onChange={handleChange} placeholder="12.345.678-9" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm outline-none" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block">F. Nacimiento</label>
                                    <input required type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm outline-none [color-scheme:dark]" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block">Sexo</label>
                                    <select required name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-[#0f172a] border border-white/10 rounded-2xl py-4 px-6 text-sm outline-none appearance-none">
                                        <option value="">Seleccionar</option>
                                        <option value="Masculino">Masculino</option>
                                        <option value="Femenino">Femenino</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block">¿Estado Actual?</label>
                                    <select required name="workingStatus" value={formData.workingStatus} onChange={handleChange} className="w-full bg-[#0f172a] border border-white/10 rounded-2xl py-4 px-6 text-sm outline-none appearance-none font-black text-indigo-400">
                                        <option value="">¿Estás Trabajando?</option>
                                        <option value="Trabajando">Trabajando</option>
                                        <option value="Disponibilidad Inmediata">Disponibilidad Inmediata</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Profile & Location */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                                <MapPin size={20} />
                            </div>
                            <h3 className="font-black text-sm uppercase tracking-widest text-slate-200">Ubicación & Perfil</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block">Región</label>
                                    <select required name="region" value={formData.region} onChange={handleRegionChange} className="w-full bg-[#0f172a] border border-white/10 rounded-2xl py-4 px-6 text-sm outline-none appearance-none">
                                        <option value="">Seleccionar</option>
                                        {chileanRegions.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block">Comuna</label>
                                    <select required name="commune" value={formData.commune} onChange={handleChange} disabled={!formData.region} className="w-full bg-[#0f172a] border border-white/10 rounded-2xl py-4 px-6 text-sm outline-none appearance-none disabled:opacity-30">
                                        <option value="">Seleccionar</option>
                                        {communes.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block">Especialidad</label>
                                    <input required name="specialty" value={formData.specialty} onChange={handleChange} placeholder="Ej: Soldador, Dev" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm outline-none" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block">Estudios</label>
                                    <select required name="studies" value={formData.studies} onChange={handleChange} className="w-full bg-[#0f172a] border border-white/10 rounded-2xl py-4 px-6 text-sm outline-none appearance-none">
                                        <option value="">Seleccionar</option>
                                        <option value="Técnico">Técnico</option>
                                        <option value="Universitario">Universitario</option>
                                        <option value="Postgrado">Postgrado</option>
                                        <option value="Otros">Otros</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block">Correo</label>
                                    <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="usuario@ejemplo.com" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm outline-none" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block">Celular</label>
                                    <input required name="phone" value={formData.phone} onChange={handleChange} placeholder="+56 9 ..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm outline-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CV Upload */}
                    <div className="md:col-span-2 mt-4">
                        <div className="relative group/upload">
                            <input type="file" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer z-20" accept=".pdf,.doc,.docx" />
                            <div className={`border-2 border-dashed ${formData.cvUrl ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/10 bg-white/[0.02]'} rounded-[32px] p-10 text-center transition-all group-hover/upload:border-indigo-500/30`}>
                                {formData.cvUrl ? (<div className="flex flex-col items-center gap-2"><CheckCircle2 className="text-emerald-500 mb-2" size={40} /> <span className="font-black text-xs uppercase tracking-[0.2em] text-emerald-400">CV Cargado Correctamente</span> </div>) : (<div className="flex flex-col items-center gap-4"> <div className="w-16 h-16 rounded-[24px] bg-slate-800 flex items-center justify-center text-slate-400 group-hover/upload:scale-110 group-hover/upload:text-indigo-400 transition-all duration-500"> <Upload size={32} /> </div> <p className="font-black text-xs uppercase tracking-[0.2em] text-slate-200">Sube tu Curriculum Vitae</p> </div>)}
                            </div>
                        </div>
                    </div>

                    {error && <div className="md:col-span-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-6 rounded-3xl text-xs font-bold uppercase tracking-widest text-center">{error}</div>}

                    <div className="md:col-span-2">
                        <button type="submit" disabled={loading || !formData.cvUrl} className={`w-full py-6 rounded-3xl font-black uppercase tracking-[0.3em] text-sm transition-all shadow-2xl ${!formData.cvUrl ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50' : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:scale-[1.02]'}`}>
                            Finalizar Registro y Unirse
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PortfolioPortal;
