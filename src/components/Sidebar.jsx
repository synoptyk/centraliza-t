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
        intelligence: false,
        strategy: false,
        talent: false,
        capital: false,
        infrastructure: false
    });

    useEffect(() => {
        if (window.innerWidth < 768) {
            setIsOpen(false);
        }
        // Collapse all sections on route change to prevent "invasive" UI
        setSections({
            intelligence: false,
            strategy: false,
            talent: false,
            capital: false,
            infrastructure: false
        });
    }, [location.pathname, setIsOpen]);

    const toggleSection = (section) => {
        setSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const isRecruitmentOnly = auth?.company?.serviceMode === 'RECRUITMENT_ONLY';

    // --- COGNITIVE ARCHITECTURE: REBRANDED SECTIONS v6.2 ---

    // 1. CONTROL CEO (Neural Core)
    const intelligenceItems = [
        { id: 'dashboard', name: isRecruitmentOnly ? 'Dashboard Agencia' : 'Dashboard Central', icon: LayoutDashboard, path: isRecruitmentOnly ? '/dashboard-empresa' : '/dashboard', color: 'text-indigo-400' },
        ...(auth?.role === 'Ceo_Centralizat' ? [
            { id: 'admin-command', name: 'Centro de Mando CEO', icon: ShieldCheck, path: '/admin/command-center', color: 'text-amber-400' },
            { id: 'comercial', name: 'Mando Comercial', icon: Trophy, path: '/comercial', color: 'text-emerald-400' }
        ] : [])
    ];

    // 2. ADMINISTRACIÓN (Planning & Control)
    const strategyItems = [
        { id: 'proyectos', name: 'Gestión de Proyectos', icon: Briefcase, path: '/proyectos', color: 'text-blue-400' },
        { id: 'contratacion', name: 'Aprobaciones (Firma)', icon: FileCheck, path: '/contratacion', badge: counts.contratacion, color: 'text-purple-400' },
        { id: 'historial', name: 'Historial Operativo', icon: History, path: '/historial', color: 'text-slate-400' }
    ];

    // 3. RECLUTAMIENTO Y SELECCIÓN (Acquisition Funnel)
    const talentItems = [
        { id: 'ingreso', name: 'Captura de Talento', icon: UserPlus, path: '/ingreso', color: 'text-indigo-400' },
        { id: 'entrevista', name: 'Entrevistas Filtro', icon: Calendar, path: '/entrevista', badge: counts.entrevista, color: 'text-blue-400' },
        { id: 'tests', name: 'Evaluación Técnica', icon: BrainCircuit, path: '/tests', badge: counts.tests, color: 'text-purple-400' },
        { id: 'acreditacion-prevencion', name: 'Seguridad & PPE', icon: ShieldCheck, path: '/acreditacion-prevencion', badge: counts.acreditacion, color: 'text-emerald-400' },
        { id: 'documentos', name: 'Gestión Documental', icon: FileText, path: '/documentos', badge: counts.documentos, color: 'text-amber-400' },
        { id: 'ficha-colaborador', name: 'Ficha y Validación', icon: Fingerprint, path: '/ficha-colaborador', badge: counts.ficha, color: 'text-rose-400' },
        { id: 'cartera-profesional', name: 'Centro de Captación', icon: Zap, path: '/cartera-profesional', color: 'text-cyan-400' },
    ];

    // 4. RELACIONES LABORALES (Employee Lifecycle)
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

    const checkPermission = (item) => {
        if (auth?.role === 'Ceo_Centralizat' || auth?.role === 'Admin_Centralizat') return true;
        const userPerm = auth?.permissions?.find(p => p.module === item.id);
        return userPerm?.actions?.read === true;
    };

    const getIconColors = (colorClass, isActive = false) => {
        if (isActive) return 'bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.5)] text-white ring-2 ring-indigo-400/50';

        const colorMap = {
            'text-indigo-400': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 group-hover:bg-indigo-500/20 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.3)]',
            'text-amber-400': 'bg-amber-500/10 text-amber-400 border-amber-500/20 group-hover:bg-amber-500/20 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.3)]',
            'text-emerald-400': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 group-hover:bg-emerald-500/20 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]',
            'text-blue-400': 'bg-blue-500/10 text-blue-400 border-blue-500/20 group-hover:bg-blue-500/20 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]',
            'text-purple-400': 'bg-purple-500/10 text-purple-400 border-purple-500/20 group-hover:bg-purple-500/20 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]',
            'text-rose-400': 'bg-rose-500/10 text-rose-400 border-rose-500/20 group-hover:bg-rose-500/20 group-hover:shadow-[0_0_15px_rgba(244,63,94,0.3)]',
            'text-cyan-400': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 group-hover:bg-cyan-500/20 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]',
            'text-slate-400': 'bg-slate-500/10 text-slate-400 border-slate-500/20 group-hover:bg-slate-500/20 group-hover:shadow-[0_0_15px_rgba(100,116,139,0.3)]',
            'text-indigo-500': 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20 group-hover:bg-indigo-500/20',
            'text-blue-500': 'bg-blue-500/10 text-blue-500 border-blue-500/20 group-hover:bg-blue-500/20',
            'text-cyan-500': 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20 group-hover:bg-cyan-500/20',
            'text-emerald-500': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 group-hover:bg-emerald-500/20',
            'text-slate-500': 'bg-slate-500/10 text-slate-500 border-slate-500/20 group-hover:bg-slate-500/20'
        };
        return colorMap[colorClass] || 'bg-slate-800/50 text-slate-500 border-white/5';
    };

    const NavItem = ({ item, level = 0 }) => {
        const isActive = location.pathname === item.path;

        return (
            <NavLink
                to={item.path}
                className={({ isActive }) =>
                    `flex items-center justify-between mx-3 ${level === 1 ? 'pl-9 pr-4 py-3' : 'px-5 py-3.5'} rounded-2xl transition-all duration-500 group relative mb-1.5 ${isActive
                        ? 'bg-indigo-600/10 text-white shadow-[inset_0_0_25px_rgba(79,70,229,0.15)] border border-indigo-500/30 ring-1 ring-white/5'
                        : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-100'
                    }`
                }
            >
                <div className="flex items-center gap-4 relative z-10">
                    <div className={`p-2.5 rounded-xl transition-all duration-500 border ${getIconColors(item.color, isActive)} group-hover:scale-110 group-hover:rotate-[5deg]`}>
                        <item.icon size={19} strokeWidth={2.5} />
                    </div>
                    <span className={`text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-500 ${isActive ? 'text-white' : 'group-hover:translate-x-1 group-hover:text-white'}`}>
                        {item.name}
                    </span>
                </div>

                {item.badge > 0 && (
                    <span className="bg-indigo-600 text-white text-[9px] font-black px-2 py-0.5 rounded-lg min-w-[20px] text-center shadow-[0_0_15px_rgba(79,70,229,0.4)] ring-1 ring-white/20">
                        {item.badge}
                    </span>
                )}

                {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-7 bg-indigo-500 rounded-r-full shadow-[0_0_15px_#6366f1] animate-pulse"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none"></div>
            </NavLink>
        );
    };

    const SectionHeader = ({ id, label, icon: Icon, color }) => (
        <button
            onClick={() => toggleSection(id)}
            className={`w-[calc(100%-1.5rem)] flex items-center justify-between mx-3 px-5 py-4 mt-6 group transition-all duration-500 rounded-[20px] border relative overflow-hidden ${sections[id]
                ? 'bg-white/[0.05] border-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.4)] ring-1 ring-white/5'
                : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10'}`}
        >
            {/* Subtle glow effect when open */}
            {sections[id] && (
                <div className="absolute -top-10 -left-10 w-24 h-24 bg-indigo-500/10 rounded-full blur-[40px] pointer-events-none"></div>
            )}

            <div className="flex items-center gap-4 relative z-10">
                <div className={`p-2.5 rounded-xl border transition-all duration-500 ${getIconColors(color)} ${sections[id] ? 'scale-110 rotate-0 shadow-[0_0_20px_rgba(99,102,241,0.3)]' : 'group-hover:scale-110 group-hover:rotate-[8deg]'}`}>
                    <Icon size={18} strokeWidth={2.5} />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${sections[id] ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>
                    {label}
                </span>
            </div>
            <div className={`relative z-10 transition-all duration-500 transform ${sections[id] ? 'rotate-90 scale-125' : ''}`}>
                <ChevronRight size={14} className={sections[id] ? 'text-indigo-400' : 'text-slate-600'} />
            </div>

            {/* Glossy overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        </button>
    );

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-40 md:hidden animate-in fade-in transition-all" onClick={() => setIsOpen(false)} />
            )}

            <div className={`w-80 h-screen bg-[#020617] text-white flex flex-col fixed left-0 top-0 z-50 shadow-[0_0_50px_rgba(0,0,0,0.5)] border-r border-white/5 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>

                {/* --- HEADER: SPECTACULAR BRANDING --- */}
                <div className="relative p-8 pt-12 pb-10 group cursor-pointer overflow-hidden mb-4" onClick={() => navigate('/dashboard')}>
                    <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-indigo-600/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                    <div className="absolute -top-16 -left-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-[80px] group-hover:bg-indigo-500/20 transition-all duration-1000"></div>

                    <div className="relative z-10 flex items-center gap-6">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-[24px] bg-white/[0.03] backdrop-blur-3xl border border-white/10 flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] group-hover:scale-105 group-hover:rotate-[8deg] transition-all duration-700 overflow-hidden ring-1 ring-white/20">
                                <img src="/logo_centralizat.png" alt="Logo" className="w-[42px] h-[42px] object-contain filter brightness-125 contrast-125 drop-shadow-[0_0_12px_rgba(99,102,241,0.8)] animate-pulse" />
                                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/30 to-transparent mix-blend-overlay"></div>
                                <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-45 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                            </div>
                            <div className="absolute -bottom-2 -right-1 w-7 h-7 bg-indigo-600 rounded-xl flex items-center justify-center border-[3px] border-[#020617] shadow-xl group-hover:scale-125 transition-transform group-hover:bg-indigo-500">
                                <Zap size={12} className="text-white fill-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]" />
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <h1 className="text-2xl font-black text-white tracking-[-0.03em] leading-none mb-1.5 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
                                CENTRALIZA<span className="text-indigo-500 font-black">-</span><span className="italic font-medium text-indigo-100">T</span>
                            </h1>
                            <div className="flex items-center gap-2.5 px-0.5">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_12px_#10b981] ring-1 ring-emerald-400/50"></div>
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 group-hover:text-indigo-400 group-hover:tracking-[0.45em] transition-all duration-700">Digital Governance</span>
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

                {/* --- NAVIGATION: PHASE-BASED FLOW v6.2 --- */}
                <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar pt-2 pb-10">

                    {/* PHASE 1: CONTROL CEO */}
                    <SectionHeader id="intelligence" label="CONTROL CEO" icon={ShieldCheck} color="text-indigo-500" />
                    <div className={`space-y-0.5 overflow-hidden transition-all duration-500 ${sections.intelligence ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        {intelligenceItems.filter(checkPermission).map(item => <NavItem key={item.id} item={item} />)}
                    </div>

                    {/* PHASE 2: ADMINISTRACIÓN */}
                    <SectionHeader id="strategy" label="ADMINISTRACIÓN" icon={Building2} color="text-blue-500" />
                    <div className={`space-y-0.5 overflow-hidden transition-all duration-500 ${sections.strategy ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        {strategyItems.filter(checkPermission).map(item => <NavItem key={item.id} item={item} />)}
                    </div>

                    {/* PHASE 3: RECLUTAMIENTO Y SELECCIÓN */}
                    <SectionHeader id="talent" label="RECLUTAMIENTO Y SELECCIÓN" icon={Zap} color="text-cyan-500" />
                    <div className={`space-y-0.5 overflow-hidden transition-all duration-500 ${sections.talent ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        {talentItems.filter(checkPermission).map(item => <NavItem key={item.id} item={item} />)}
                    </div>

                    {/* PHASE 4: RELACIONES LABORALES */}
                    {!isRecruitmentOnly && (
                        <>
                            <SectionHeader id="capital" label="RELACIONES LABORALES" icon={Users} color="text-emerald-500" />
                            <div className={`space-y-0.5 overflow-hidden transition-all duration-500 ${sections.capital ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                {capitalItems.filter(checkPermission).map(item => <NavItem key={item.id} item={item} />)}
                            </div>
                        </>
                    )}

                    {/* PHASE 5: INFRAESTRUCTURA */}
                    <SectionHeader id="infrastructure" label="Infraestructura" icon={Settings} color="text-slate-500" />
                    <div className={`space-y-0.5 overflow-hidden transition-all duration-500 ${sections.infrastructure ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        {infrastructureItems.filter(checkPermission).map(item => {
                            if (item.isFolder) {
                                return (
                                    <button key={item.id} onClick={() => toggleSection('conexiones_nested')} className="w-full flex items-center justify-between px-5 py-3 rounded-xl text-slate-400 hover:bg-white/[0.03] group transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2.5 rounded-xl bg-slate-800/50 text-slate-500 group-hover:text-indigo-400 border border-white/5"><item.icon size={19} strokeWidth={2.5} /></div>
                                            <span className="text-[11px] font-black uppercase tracking-[0.15em]">{item.name}</span>
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
                <div className="p-4 bg-white/5 mt-auto border-t border-white/5 backdrop-blur-md">
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
