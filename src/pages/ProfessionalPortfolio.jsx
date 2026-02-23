import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Download,
    Trash2,
    ExternalLink,
    Copy,
    Check,
    User,
    Mail,
    Phone,
    MapPin,
    GraduationCap,
    Briefcase,
    Loader2,
    Building2,
    Users,
    Activity,
    FileText
} from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import api from '../utils/api';
import { format } from 'date-fns';

const ProfessionalPortfolio = ({ auth, onLogout }) => {
    const [professionals, setProfessionals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [copied, setCopied] = useState(false);
    const [filters, setFilters] = useState({
        specialty: '',
        region: ''
    });

    const portalUrl = `${window.location.origin}/portal-profesional/${auth?.company?._id}`;

    useEffect(() => {
        fetchProfessionals();
    }, [filters]);

    const fetchProfessionals = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                ...filters,
                search: searchTerm
            }).toString();
            const response = await api.get(`/api/professionals?${query}`);
            setProfessionals(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching professionals:', error);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar a este profesional de la cartera?')) return;
        try {
            await api.delete(`/api/professionals/${id}`);
            setProfessionals(professionals.filter(p => p._id !== id));
        } catch (error) {
            console.error('Error deleting professional:', error);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(portalUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <PageWrapper
            title="CARTERA PROFESIONAL"
            subtitle="Gestión y captación masiva de talentos para tu agencia"
            icon={Users}
            auth={auth}
            onLogout={onLogout}
        >
            {/* Invitation Section */}
            <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-[32px] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden mb-12">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                    <Users size={200} />
                </div>
                <div className="relative z-10 max-w-2xl space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-xs font-black uppercase tracking-widest">
                        <Activity size={14} /> Canal de Captación Activo
                    </div>
                    <h2 className="text-4xl font-black tracking-tight leading-tight uppercase italic">
                        Expande tu <span className="text-indigo-200">Red de Talentos</span>
                    </h2>
                    <p className="text-indigo-100 font-medium opacity-80 leading-relaxed">
                        Comparte este enlace único en tus comunidades, redes sociales y grupos de reclutamiento. Todos los que se registren aparecerán automáticamente en tu cartera.
                    </p>

                    <div className="flex flex-col md:flex-row gap-4 pt-4">
                        <div className="flex-1 bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 px-6 py-4 flex items-center justify-between group overflow-hidden">
                            <span className="text-xs font-bold opacity-60 truncate mr-4">
                                {portalUrl}
                            </span>
                            <button
                                onClick={copyToClipboard}
                                className="flex items-center gap-2 bg-white text-indigo-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg active:scale-95"
                            >
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                                {copied ? 'Copiado' : 'Copiar Link'}
                            </button>
                        </div>
                        <a
                            href={portalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-indigo-500 hover:bg-indigo-400 text-white px-8 py-4 rounded-2xl flex items-center justify-center gap-3 transition-all font-black uppercase tracking-widest text-[11px] shadow-xl hover:shadow-indigo-500/30"
                        >
                            <ExternalLink size={16} /> Previsualizar Portal
                        </a>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-8 rounded-[32px] border-2 border-slate-100 shadow-xl mb-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="relative md:col-span-2">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o RUT..."
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none focus:border-indigo-500/30 transition-all placeholder:text-slate-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchProfessionals()}
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Especialidad..."
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none focus:border-indigo-500/30 transition-all"
                            value={filters.specialty}
                            onChange={(e) => setFilters({ ...filters, specialty: e.target.value })}
                        />
                    </div>
                    <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Región..."
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none focus:border-indigo-500/30 transition-all"
                            value={filters.region}
                            onChange={(e) => setFilters({ ...filters, region: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            {/* Content List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <Loader2 size={48} className="text-indigo-600 animate-spin" />
                    <p className="font-black text-xs uppercase tracking-widest text-slate-400">Escaneando Cartera...</p>
                </div>
            ) : professionals.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
                    <Users size={64} className="mx-auto text-slate-200 mb-6" />
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Cartera Vacía</h3>
                    <p className="text-slate-400 font-medium mt-2">No se encontraron profesionales con los filtros aplicados.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {professionals.map(prof => (
                        <div key={prof._id} className="bg-white rounded-[40px] border-2 border-slate-100 p-8 shadow-lg hover:shadow-2xl transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform">
                                <Briefcase size={120} />
                            </div>

                            <div className="relative z-10 flex flex-col md:flex-row gap-8">
                                <div className="flex-1 space-y-6">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <h4 className="text-2xl font-black text-slate-900 tracking-tight leading-tight uppercase italic">{prof.fullName}</h4>
                                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">{prof.specialty}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleDelete(prof._id)}
                                                className="p-3 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                                <User size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">RUT</p>
                                                <p className="text-xs font-bold text-slate-700">{prof.rut}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                                <MapPin size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Residencia</p>
                                                <p className="text-xs font-bold text-slate-700">{prof.region}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                                <Phone size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contacto</p>
                                                <p className="text-xs font-bold text-slate-700">{prof.phone}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                                <GraduationCap size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Estudios</p>
                                                <p className="text-xs font-bold text-slate-700">{prof.studies}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Mail size={14} className="text-slate-300" />
                                            <span className="text-[11px] font-bold text-slate-500">{prof.email}</span>
                                        </div>
                                        <span className="text-[10px] bg-slate-50 text-slate-400 px-3 py-1 rounded-full font-black uppercase tracking-widest">
                                            Registrado: {format(new Date(prof.createdAt), 'dd/MM/yy')}
                                        </span>
                                    </div>
                                </div>

                                <div className="md:w-48 flex flex-col gap-3">
                                    <div className="flex-1 bg-slate-50 rounded-3xl border-2 border-slate-100 flex flex-col items-center justify-center p-6 space-y-4 group/cv transition-all hover:bg-white hover:border-indigo-500/20 shadow-inner">
                                        <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-lg group-hover/cv:scale-110 group-hover/cv:bg-indigo-600 group-hover/cv:text-white transition-all duration-500">
                                            <FileText size={32} />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Currículum Vitae</p>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase">{prof.fullName.split(' ')[0]}.pdf</p>
                                        </div>
                                    </div>
                                    <a
                                        href={prof.cvUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full bg-slate-900 text-white py-4 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px] hover:bg-indigo-600 transition-all shadow-xl active:scale-95"
                                    >
                                        <Download size={14} /> Descargar CV
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </PageWrapper>
    );
};

export default ProfessionalPortfolio;
