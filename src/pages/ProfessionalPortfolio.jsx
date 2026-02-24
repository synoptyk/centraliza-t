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
    MapPin,
    GraduationCap,
    Briefcase,
    Loader2,
    Users,
    Building2,
    Activity,
    FileText,
    Calendar,
    Mail,
    ChevronDown,
    Zap,
    Phone
} from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import api from '../utils/api';
import { format } from 'date-fns';

const ProfessionalPortfolio = ({ auth, onLogout }) => {
    const [professionals, setProfessionals] = useState([]);
    const [corporateRequests, setCorporateRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('professionals');
    const [searchTerm, setSearchTerm] = useState('');
    const [copied, setCopied] = useState(false);
    const [filters, setFilters] = useState({ specialty: '', region: '' });

    const companyId = auth?.company?.slug || auth?.company?._id || auth?.companyId;
    const portalUrl = companyId ? `${window.location.origin}/portal-captacion/${companyId}` : null;

    useEffect(() => {
        fetchData();
    }, [activeTab, filters]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'professionals') {
                const query = new URLSearchParams({ ...filters, search: searchTerm }).toString();
                const response = await api.get(`/professionals?${query}`);
                setProfessionals(response.data);
            } else {
                const response = await api.get(`/professionals/corporate`);
                setCorporateRequests(response.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este registro?')) return;
        try {
            await api.delete(`/professionals/${id}`);
            setProfessionals(professionals.filter(p => p._id !== id));
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(portalUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <PageWrapper
            title="CENTRO DE CAPTACIÓN"
            subtitle="Gestión estratégica de talentos y requerimientos empresariales"
            icon={Zap}
            auth={auth}
            onLogout={onLogout}
        >
            {/* Invitation Bar */}
            <div className="bg-slate-900 rounded-[32px] p-8 text-white mb-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-10"><Zap size={140} /></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black uppercase italic tracking-tight">Tu Portal Público de Captación</h2>
                        <p className="text-slate-400 text-sm font-medium">Comparte este link para recibir postulantes y empresas.</p>
                    </div>
                    <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 w-full md:w-auto">
                        {portalUrl ? (
                            <>
                                <span className="text-[10px] font-bold opacity-40 truncate max-w-[200px]">{portalUrl}</span>
                                <button onClick={copyToClipboard} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-indigo-500 transition-all">
                                    {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copiado' : 'Copiar'}
                                </button>
                            </>
                        ) : (
                            <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest italic">Link no disponible para perfiles CEO</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-8">
                <button
                    onClick={() => setActiveTab('professionals')}
                    className={`flex-1 py-6 rounded-[24px] font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 border-2 ${activeTab === 'professionals' ? 'bg-indigo-100 border-indigo-200 text-indigo-700 shadow-lg shadow-indigo-100' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                >
                    <Users size={18} /> Cartera Profesional
                </button>
                <button
                    onClick={() => setActiveTab('corporate')}
                    className={`flex-1 py-6 rounded-[24px] font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 border-2 ${activeTab === 'corporate' ? 'bg-purple-100 border-purple-200 text-purple-700 shadow-lg shadow-purple-100' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                >
                    <Building2 size={18} /> Cartera Empresarial
                </button>
            </div>

            {/* Main Content */}
            {activeTab === 'professionals' ? (
                <div className="space-y-8">
                    {/* Search & Filters (Existing logic improved) */}
                    <div className="bg-white p-6 rounded-[32px] border-2 border-slate-100 flex flex-wrap gap-4 shadow-sm">
                        <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Nombre o RUT..." className="flex-1 bg-slate-50 border-none rounded-2xl px-6 py-4 outline-none font-bold text-sm" />
                        <button onClick={fetchData} className="bg-slate-900 text-white px-8 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-indigo-600 transition-all">Filtrar</button>
                    </div>

                    {loading ? <div className="text-center py-20"><Loader2 className="animate-spin mx-auto text-indigo-500" size={48} /></div> : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {professionals.map(p => (
                                <div key={p._id} className="bg-white rounded-[32px] border-2 border-slate-50 p-6 flex flex-col md:flex-row gap-6 hover:shadow-2xl transition-all group">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="text-xl font-black text-slate-900 uppercase italic leading-none">{p.fullName}</h4>
                                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-2 px-3 py-1 bg-indigo-50 rounded-lg inline-block">{p.workingStatus}</p>
                                            </div>
                                            <button onClick={() => handleDelete(p._id)} className="p-2 text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 text-[11px] font-bold text-slate-500">
                                            <div className="flex items-center gap-2"><Briefcase size={14} className="opacity-50" /> {p.specialty}</div>
                                            <div className="flex items-center gap-2"><MapPin size={14} className="opacity-50" /> {p.commune}, {p.region}</div>
                                            <div className="flex items-center gap-2"><GraduationCap size={14} className="opacity-50" /> {p.studies}</div>
                                            <div className="flex items-center gap-2"><Phone size={14} className="opacity-50" /> {p.phone}</div>
                                        </div>
                                        {p.observations && (
                                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Observaciones</p>
                                                <p className="text-[11px] font-bold text-slate-600 line-clamp-2 italic">"{p.observations}"</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="md:w-40 flex flex-col gap-2">
                                        <a href={p.cvUrl} target="_blank" rel="noreferrer" className="flex-1 bg-slate-50 rounded-2xl flex flex-col items-center justify-center p-4 border border-slate-100 hover:bg-white hover:border-indigo-200 transition-all border-dashed">
                                            <FileText className="text-slate-300 group-hover:text-indigo-500 transition-colors" size={32} />
                                            <span className="text-[8px] font-black uppercase tracking-tighter mt-2">Ver Curriculum</span>
                                        </a>
                                        <a href={p.cvUrl} download className="bg-slate-900 text-white py-3 rounded-xl text-[9px] font-black uppercase text-center flex items-center justify-center gap-2"><Download size={12} /> Descargar</a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-6">
                    {loading ? <div className="text-center py-20"><Loader2 className="animate-spin mx-auto text-purple-500" size={48} /></div> : (
                        <div className="grid grid-cols-1 gap-6">
                            {corporateRequests.map(r => (
                                <div key={r._id} className="bg-white rounded-[32px] border-2 border-slate-50 p-8 shadow-sm hover:shadow-xl transition-all flex flex-col md:flex-row gap-10">
                                    <div className="flex-1 space-y-6">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">{r.companyName}</h3>
                                                <p className="text-[10px] font-black text-purple-600 uppercase tracking-[0.2em]">{r.companyRut}</p>
                                            </div>
                                            <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest">{r.status}</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black text-slate-400 uppercase">Requerimiento</p>
                                                <p className="text-sm font-bold border-l-2 border-purple-500 pl-3">{r.requiredPosition}</p>
                                                <p className="text-[10px] text-slate-400 font-medium pl-3">{r.projectOrArea}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black text-slate-400 uppercase">Ubicación Obra</p>
                                                <p className="text-sm font-bold border-l-2 border-indigo-500 pl-3">{r.workCommune}</p>
                                                <p className="text-[10px] text-slate-400 font-medium pl-3">{r.workRegion}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black text-slate-400 uppercase">Contacto RRHH</p>
                                                <p className="text-sm font-bold border-l-2 border-emerald-500 pl-3">{r.hrContact}</p>
                                                <a href={`mailto:${r.hrEmail}`} className="text-[10px] text-indigo-500 font-black hover:underline pl-3">{r.hrEmail}</a>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="md:w-64 bg-slate-50 rounded-[28px] p-6 flex flex-col justify-center items-center text-center space-y-4 border border-slate-100">
                                        <Calendar className="text-purple-400" size={32} />
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Fecha Proyectada</p>
                                            <p className="text-lg font-black text-slate-900 tracking-tight">
                                                {r.projectedHiringDate ? (() => {
                                                    try {
                                                        const date = new Date(r.projectedHiringDate);
                                                        return isNaN(date.getTime()) ? 'Pendiente' : format(date, 'dd/MM/yyyy');
                                                    } catch (e) {
                                                        return 'Pendiente';
                                                    }
                                                })() : 'Pendiente'}
                                            </p>
                                        </div>
                                        <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-purple-600 transition-all">Gestionar</button>
                                    </div>
                                </div>
                            ))}
                            {corporateRequests.length === 0 && <div className="text-center py-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-100 text-slate-300 font-black uppercase tracking-widest">Sin solicitudes nuevas</div>}
                        </div>
                    )}
                </div>
            )}
        </PageWrapper>
    );
};

export default ProfessionalPortfolio;
