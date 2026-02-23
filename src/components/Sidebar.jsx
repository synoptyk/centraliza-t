import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, ClipboardList, UserPlus, Calendar,
    BrainCircuit, FileText, FileCheck, ShieldCheck,
    History, Users, Settings, Search, X, Activity,
    ChevronRight, Building2, FolderOpen, CreditCard,
    Zap, Trophy, FilePlus, Plane, LifeBuoy,
    CircleDollarSign, Scale, ShieldAlert, ExternalLink,
    PieChart, Briefcase, Fingerprint, Network, Gavel
} from 'lucide-react';
import api from '../utils/api';
import UserProfileModal from './UserProfileModal';

const CheckSquare = ({ size, className }) => (
    <div className={`border-2 border-current rounded-sm flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
        <div className="w-1.5 h-1.5 bg-current rounded-ss-sm"></div>
    </div>
);

const Sidebar = ({ onOpenCENTRALIZAT, auth, setAuth, onLogout, isOpen, setIsOpen }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const [showProfileModal, setShowProfileModal] = useState(false);
    const [counts, setCounts] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [sections, setSections] = useState({
        intelligence: true,
        strategy: true,
        talent: true,
        capital: false,
        infrastructure: false
    });

    useEffect(() => {
        if (window.innerWidth < 768) {
            setIsOpen(false);
        }
    }, [location.pathname, setIsOpen]);

    const toggleSection = (section) => {
        setSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const isRecruitmentOnly = auth?.company?.serviceMode === 'RECRUITMENT_ONLY';

    // --- COGNITIVE ARCHITECTURE: PHASE-BASED GROUPING ---

    // 1. INTELIGENCIA Y MANDO (Neural Core)
    const intelligenceItems = [
        { id: 'dashboard', name: isRecruitmentOnly ? 'Dashboard Agencia' : 'Dashboard Central', icon: LayoutDashboard, path: isRecruitmentOnly ? '/dashboard-empresa' : '/dashboard', color: 'text-indigo-400' },
        ...(auth?.role === 'Ceo_Centralizat' ? [
            { id: 'admin-command', name: 'Centro de Mando CEO', icon: ShieldCheck, path: '/admin/command-center', color: 'text-amber-400' },
            { id: 'comercial', name: 'Mando Comercial', icon: Trophy, path: '/comercial', color: 'text-emerald-400' }
        ] : [])
    ];

    // 2. GOBERNANZA ESTRATÉGICA (Planning & Control)
    const strategyItems = [
        { id: 'proyectos', name: 'Gestión de Proyectos', icon: Briefcase, path: '/proyectos', color: 'text-blue-400' },
        { id: 'contratacion', name: 'Aprobaciones (Firma)', icon: FileCheck, path: '/contratacion', badge: counts.contratacion, color: 'text-purple-400' },
        { id: 'historial', name: 'Historial Operativo', icon: History, path: '/historial', color: 'text-slate-400' }
    ];

    // 3. EMBUDO DE TALENTO (Acquisition Funnel)
    const talentItems = [
        { id: 'ingreso', name: 'Captura de Talento', icon: UserPlus, path: '/ingreso', color: 'text-indigo-400' },
        { id: 'entrevista', name: 'Entrevistas Filtro', icon: Calendar, path: '/entrevista', badge: counts.entrevista, color: 'text-blue-400' },
        { id: 'tests', name: 'Evaluación Técnica', icon: BrainCircuit, path: '/tests', badge: counts.tests, color: 'text-purple-400' },
        { id: 'acreditacion-prevencion', name: 'Seguridad & PPE', icon: ShieldCheck, path: '/acreditacion-prevencion', badge: counts.acreditacion, color: 'text-emerald-400' },
        { id: 'documentos', name: 'Gestión Documental', icon: FileText, path: '/documentos', badge: counts.documentos, color: 'text-amber-400' },
        { id: 'ficha-colaborador', name: 'Ficha y Validación', icon: Fingerprint, path: '/ficha-colaborador', badge: counts.ficha, color: 'text-rose-400' },
        { id: 'cartera-profesional', name: 'Centro de Captación', icon: Zap, path: '/cartera-profesional', color: 'text-cyan-400' },
    ];

    // 4. CAPITAL HUMANO (Employee Lifecycle)
    const capitalItems = [
        ...(!isRecruitmentOnly ? [
            { id: 'gestion-capital-humano', name: 'Capital Humano 360', icon: Users, path: '/gestion-capital-humano', color: 'text-indigo-400' },
            { id: 'contratados', name: 'Personal Activo', icon: CheckSquare, path: '/contratados', color: 'text-emerald-400' },
            { id: 'contratos', name: 'Contratación (IA)', icon: FilePlus, path: '/contratos', color: 'text-blue-400' },
            { id: 'nomina', name: 'Nómina (Payroll)', icon: CircleDollarSign, path: '/nomina', color: 'text-emerald-400' },
            { id: 'vacaciones', name: 'Vacaciones/Licencias', icon: Plane, path: '/vacaciones', color: 'text-cyan-400' },
            { id: 'relaciones-laborales', name: 'Relaciones Laborales', icon: ShieldAlert, path: '/relaciones-laborales', color: 'text-rose-400' },
            { id: 'finiquitos', name: 'Desvinculaciones', icon: Gavel, path: '/finiquitos', color: 'text-slate-400' }
        ] : []),
        { id: 'contenedor', name: 'Portal Ético/Cliente', icon: FolderOpen, path: '/contenedor', color: 'text-indigo-400' }
    ];

    // 5. INFRAESTRUCTURA (System Integrity)
    const infrastructureItems = [
        { id: 'conexiones', name: 'Conexiones API', icon: Network, path: '#', isFolder: true, color: 'text-indigo-400' },
        { id: 'configuracion', name: 'Ajustes de Sistema', icon: Settings, path: '/configuracion', color: 'text-slate-400' },
        { id: 'parametros-legales', name: 'Parámetros Legales', icon: Scale, path: '/parametros-legales', color: 'text-amber-400' },
        { id: 'suscripcion', name: 'Planes & Facturas', icon: CreditCard, path: '/suscripcion', color: 'text-emerald-400' },
        { id: 'ayuda', name: 'Centro de Ayuda', icon: LifeBuoy, path: '/ayuda', color: 'text-blue-400' }
    ];

    const CheckSquare = ({ size, className }) => <div className={`border-2 border-current rounded-sm ${className}`} style={{ width: size, height: size }} />;

    const checkPermission = (item) => {
        if (auth?.role === 'Ceo_Centralizat' || auth?.role === 'Admin_Centralizat') return true;
        const userPerm = auth?.permissions?.find(p => p.module === item.id);
        return userPerm?.actions?.read === true;
    };

    const NavItem = ({ item, level = 0 }) => (
        <NavLink
            to={item.path}
            className={({ isActive }) =>
                `flex items-center justify-between mx-2 ${level === 1 ? 'pl-10 pr-4 py-3' : 'px-5 py-3.5'} rounded-xl transition-all duration-300 group relative mb-1 ${isActive
                    ? 'bg-indigo-600/10 text-white shadow-[inset_0_0_20px_rgba(79,70,229,0.1)] border border-indigo-500/20'
                    : 'text-slate-400 hover:bg-white/[0.03] hover:text-slate-200'
                }`
            }
        >
            <div className="flex items-center gap-3.5 relative z-10">
                <div className={`p-2 rounded-lg transition-all duration-500 ${location.pathname === item.path ? 'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.4)] text-white' : 'bg-slate-800/50 text-slate-500 group-hover:text-indigo-400 border border-white/5'}`}>
                    <item.icon size={18} />
                </div>
                <span className={`text-[11px] font-bold uppercase tracking-wider transition-all ${location.pathname === item.path ? 'text-white' : 'group-hover:translate-x-1'}`}>
                    {item.name}
                </span>
            </div>

            {item.badge > 0 && (
                <span className="bg-indigo-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md min-w-[18px] text-center shadow-lg shadow-indigo-600/20">
                    {item.badge}
                </span>
            )}

            {location.pathname === item.path && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-l-full shadow-[0_0_10px_#6366f1]"></div>
            )}
        </NavLink>
    );

    const SectionHeader = ({ id, label, icon: Icon, color }) => (
        <button
            onClick={() => toggleSection(id)}
            className="w-full flex items-center justify-between px-6 py-4 mt-2 group transition-all"
        >
            <div className="flex items-center gap-3">
                <div className={`w-1 shadow-[0_0_8px_currentColor] h-3 rounded-full ${color}`}></div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-slate-300 transition-colors">
                    {label}
                </span>
            </div>
            <ChevronRight size={14} className={`text-slate-600 transition-all duration-300 ${sections[id] ? 'rotate-90 text-indigo-400' : ''}`} />
        </button>
    );

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-40 md:hidden animate-in fade-in transition-all" onClick={() => setIsOpen(false)} />
            )}

            <div className={`w-80 h-screen bg-[#020617] text-white flex flex-col fixed left-0 top-0 z-50 shadow-[0_0_50px_rgba(0,0,0,0.5)] border-r border-white/5 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>

                {/* --- HEADER: SPECTACULAR BRANDING --- */}
                <div className="relative p-8 pt-10 group cursor-pointer overflow-hidden" onClick={() => navigate('/dashboard')}>
                    <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-indigo-600/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                    <div className="absolute -top-10 -left-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-all duration-1000"></div>

                    <div className="relative z-10 flex items-center gap-5">
                        <div className="relative">
                            <div className="w-14 h-14 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 overflow-hidden ring-1 ring-white/20">
                                <img src="/logo_centralizat.png" alt="Logo" className="w-9 h-9 object-contain filter brightness-125 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-transparent"></div>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-indigo-600 rounded-lg flex items-center justify-center border-2 border-[#020617] group-hover:scale-110 transition-transform">
                                <Zap size={10} className="text-white fill-white" />
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <h1 className="text-2xl font-black text-white tracking-[-0.02em] leading-none mb-1">
                                CENTRALIZA<span className="text-indigo-500">-</span><span className="italic font-light">T</span>
                            </h1>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></div>
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 group-hover:text-indigo-400 transition-colors">Digital Governance</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SEARCH: COGNITIVE OVERLAY */}
                <div className="px-6 mb-4">
                    <div className="relative group/search">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/search:text-indigo-400 group-focus-within/search:scale-110 transition-all" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar función..."
                            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-[11px] outline-none transition-all placeholder:text-slate-700 font-bold uppercase tracking-wider focus:bg-white/[0.06] focus:border-indigo-500/30 focus:shadow-[0_0_20px_rgba(79,70,229,0.1)]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* --- NAVIGATION: PHASE-BASED FLOW --- */}
                <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar pt-2">

                    {/* PHASE 1: INTELLIGENCE */}
                    <SectionHeader id="intelligence" label="Inteligencia y Mando" icon={PieChart} color="text-indigo-500" />
                    <div className={`space-y-0.5 overflow-hidden transition-all duration-500 ${sections.intelligence ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        {intelligenceItems.filter(checkPermission).map(item => <NavItem key={item.id} item={item} />)}
                    </div>

                    {/* PHASE 2: STRATEGY */}
                    <SectionHeader id="strategy" label="Gobernanza Estratégica" icon={Briefcase} color="text-blue-500" />
                    <div className={`space-y-0.5 overflow-hidden transition-all duration-500 ${sections.strategy ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        {strategyItems.filter(checkPermission).map(item => <NavItem key={item.id} item={item} />)}
                    </div>

                    {/* PHASE 3: TALENT */}
                    <SectionHeader id="talent" label="Embudo de Talento" icon={Zap} color="text-cyan-500" />
                    <div className={`space-y-0.5 overflow-hidden transition-all duration-500 ${sections.talent ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        {talentItems.filter(checkPermission).map(item => <NavItem key={item.id} item={item} />)}
                    </div>

                    {/* PHASE 4: HUMAN CAPITAL */}
                    {!isRecruitmentOnly && (
                        <>
                            <SectionHeader id="capital" label="Gestión Humana 360" icon={Users} color="text-emerald-500" />
                            <div className={`space-y-0.5 overflow-hidden transition-all duration-500 ${sections.capital ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                {capitalItems.filter(checkPermission).map(item => <NavItem key={item.id} item={item} />)}
                            </div>
                        </>
                    )}

                    {/* PHASE 5: INFRASTRUCTURE */}
                    <SectionHeader id="infrastructure" label="Infraestructura" icon={Settings} color="text-slate-500" />
                    <div className={`space-y-0.5 overflow-hidden transition-all duration-500 ${sections.infrastructure ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        {infrastructureItems.filter(checkPermission).map(item => {
                            if (item.isFolder) {
                                // Nested Connections logic simplified
                                return (
                                    <button key={item.id} onClick={() => toggleSection('conexiones_nested')} className="w-full flex items-center justify-between px-5 py-3 rounded-xl text-slate-400 hover:bg-white/[0.03] group transition-all">
                                        <div className="flex items-center gap-3.5">
                                            <div className="p-2 rounded-lg bg-slate-800/50 text-slate-500 group-hover:text-indigo-400 border border-white/5"><item.icon size={18} /></div>
                                            <span className="text-[11px] font-bold uppercase tracking-wider">{item.name}</span>
                                        </div>
                                        <ChevronRight size={12} className="transition-all" />
                                    </button>
                                );
                            }
                            return <NavItem key={item.id} item={item} />;
                        })}
                    </div>
                </nav>

                {/* --- FOOTER: USER PROFILE PREMIUM --- */}
                <div className="p-4 bg-white/5 mt-auto border-t border-white/5">
                    <div
                        onClick={() => setShowProfileModal(true)}
                        className="p-4 rounded-2xl bg-slate-900/50 border border-white/5 cursor-pointer hover:bg-indigo-600/10 hover:border-indigo-500/30 transition-all group/profile flex items-center gap-4"
                    >
                        <div className="relative">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center font-black text-white shadow-xl shadow-indigo-600/20 group-hover/profile:scale-105 transition-all">
                                {auth?.photo ? <img src={auth.photo} className="w-full h-full object-cover rounded-xl" alt="" /> : auth?.name?.charAt(0)}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#0a0f1d] shadow-[0_0_10px_#10b981]"></div>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-[11px] font-black uppercase tracking-widest truncate">{auth?.name || 'Invitado'}</p>
                            <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest truncate mt-0.5">{auth?.role?.replace('_', ' ') || 'Sin Rol'}</p>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover/profile:bg-indigo-600 group-hover/profile:text-white transition-all">
                            <Activity size={12} />
                        </div>
                    </div>
                </div>

                {showProfileModal && (
                    <UserProfileModal
                        user={auth}
                        onClose={() => setShowProfileModal(false)}
                        onUpdate={(updatedUser) => {
                            setAuth(prev => ({ ...prev, ...updatedUser }));
                            localStorage.setItem('centralizat_user', JSON.stringify({ ...auth, ...updatedUser }));
                        }}
                    />
                )}
            </div>
        </>
    );
};

export default Sidebar;
