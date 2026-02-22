import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import api from '../utils/api';
import UserProfileModal from './UserProfileModal';

import {
    LayoutDashboard,
    ClipboardList,
    UserPlus,
    Calendar,
    BrainCircuit,
    FileText,
    CheckCircle,
    FileCheck,
    ShieldCheck,
    History,
    Users,
    Settings,
    Search,
    Loader2,
    X,
    Activity,
    ChevronRight,
    Building2,
    FolderOpen,
    CreditCard,
    Zap,
    Trophy,
    FilePlus,
    LifeBuoy
} from 'lucide-react';

import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ onOpenCENTRALIZAT, auth, setAuth, onLogout, isOpen, setIsOpen }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Close sidebar on route change on mobile
    useEffect(() => {
        if (window.innerWidth < 768) {
            setIsOpen(false);
        }
    }, [location.pathname, setIsOpen]);
    // ... (rest of component)

    const [showProfileModal, setShowProfileModal] = useState(false);
    const [counts, setCounts] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [sections, setSections] = useState({
        ceo: false,
        centralizat: false,
        recruitment: false,
        management: false,
        administration: false
    });

    const toggleSection = (section) => {
        setSections(prev => {
            const newState = { ...prev, [section]: !prev[section] };
            return newState;
        });
    };

    // ... useEffect ...

    // --- TOP LEVEL ITEMS ---
    const topLevelItems = [
        ...(auth?.role === 'Ceo_Centralizat' ? [{ id: 'admin-command', name: 'Centro de Mando CEO', icon: ShieldCheck, path: '/admin/command-center' }] : []),
        ...(auth?.role === 'Ceo_Centralizat' ? [{ id: 'comercial', name: 'Mando Comercial', icon: Trophy, path: '/comercial' }] : []),
    ];

    const settingsItem = { id: 'configuracion', name: 'Ajustes del Sistema', icon: Settings, path: '/configuracion' };
    const subscriptionItem = { id: 'suscripcion', name: 'Planes & Facturas', icon: CreditCard, path: '/suscripcion' };

    const recruitmentItems = [
        { id: 'ingreso', name: 'Captura de Talento', icon: UserPlus, path: '/ingreso' },
        { id: 'entrevista', name: 'Entrevistas Filtro', icon: Calendar, path: '/entrevista', badge: counts.entrevista },
        { id: 'tests', name: 'Evaluación Técnica', icon: BrainCircuit, path: '/tests', badge: counts.tests },
        { id: 'acreditacion-prevencion', name: 'Seguridad & Prevención', icon: ShieldCheck, path: '/acreditacion-prevencion', badge: counts.acreditacion },
        { id: 'documentos', name: 'Gestión Documental', icon: FileText, path: '/documentos', badge: counts.documentos },
        { id: 'ficha-colaborador', name: 'Ficha y Validación', icon: UserPlus, path: '/ficha-colaborador', badge: counts.ficha },
    ];

    const managementItems = [
        { id: 'contratos', name: 'CONTRATACIONES', icon: FilePlus, path: '/contratos' },
    ];

    const administrationItems = [
        { id: 'dashboard', name: 'Módulo de Cliente', icon: LayoutDashboard, path: '/dashboard' },
        { id: 'proyectos', name: 'Gestión de Proyectos', icon: ClipboardList, path: '/proyectos' },
        { id: 'contratacion', name: 'APROBACIONES', icon: FileCheck, path: '/contratacion', badge: counts.contratacion },
        { id: 'gestion-capital-humano', name: 'Capital Humano 360', icon: Users, path: '/gestion-capital-humano' },
        { id: 'contenedor', name: 'Contenedor (Portal Cliente)', icon: FolderOpen, path: '/contenedor' },
    ];

    // Filter items based on user permissions
    const checkPermission = (item) => {
        if (auth?.role === 'Ceo_Centralizat') return true;
        if (auth?.role === 'Admin_Centralizat') return true;
        const userPerm = auth?.permissions?.find(p => p.module === item.id);
        return userPerm?.actions?.read === true;
    };

    const NavItem = ({ item, level = 0 }) => (
        <NavLink
            to={item.path}
            className={({ isActive }) =>
                `flex items-center justify-between ${level === 2 ? 'pl-10 pr-5 py-3.5' : level === 1 ? 'pl-7 pr-5 py-4' : 'px-6 py-5'} rounded-2xl transition-all duration-500 group relative overflow-hidden mb-2 ${isActive
                    ? 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 text-white shadow-[0_10px_40px_-10px_rgba(79,70,229,0.6)] scale-[1.02]'
                    : 'text-slate-400 hover:bg-gradient-to-r hover:from-white/[0.08] hover:to-white/[0.04] hover:text-white hover:scale-[1.01]'
                }`
            }
        >
            <div className="flex items-center gap-4 relative z-10">
                <div className={`${level === 2 ? 'w-8 h-8' : level === 1 ? 'w-9 h-9' : 'w-10 h-10'} rounded-xl bg-gradient-to-br from-slate-700/50 to-slate-800/50 flex items-center justify-center group-hover:from-indigo-500/20 group-hover:to-purple-500/20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 border border-white/5 group-hover:border-indigo-400/30`}>
                    <item.icon size={level === 2 ? 16 : level === 1 ? 18 : 20} className={`transition-all duration-500 ${counts[item.name.toLowerCase().replace(' ', '')] > 0 ? 'animate-pulse text-indigo-400' : ''}`} />
                </div>
                <span className={`font-black ${level === 2 ? 'text-[11px]' : level === 1 ? 'text-[12px]' : 'text-[13px]'} uppercase tracking-[0.12em] group-hover:tracking-[0.15em] transition-all`}>{item.name}</span>
            </div>
            {/* ... badges and chevrons ... */}
            {item.badge > 0 && (
                <div className="flex items-center gap-2 relative z-10">
                    <span className="bg-white/10 text-white text-[10px] font-black px-2.5 py-1 rounded-lg border border-white/10 group-hover:bg-white group-hover:text-indigo-900 transition-all shadow-xl">
                        {item.badge}
                    </span>
                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
            )}
            {!item.badge && (
                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-slate-600" />
            )}

            <div className="absolute inset-0 bg-gradient-to-r from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        </NavLink>
    );

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-[#020617]/80 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div className={`w-80 h-screen bg-[#020617] text-white flex flex-col fixed left-0 top-0 z-50 print:hidden shadow-[20px_0_60px_-15px_rgba(0,0,0,0.5)] border-r border-white/5 transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>

                {/* Mobile Close Button */}
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-xl md:hidden text-slate-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Branding Header ... */}
                <div className="p-10">
                    <div className="flex items-center gap-4 group cursor-default">
                        <div className="w-12 h-12 rounded-2xl bg-transparent flex items-center justify-center group-hover:scale-110 transition-transform duration-500 ring-1 ring-white/10 overflow-hidden">
                            <img src="/logo_centralizat.png" alt="Logo" className="w-full h-full object-contain filter brightness-110 contrast-125" />
                        </div>
                        <div className="space-y-0.5">
                            <h1 className="text-xl font-black text-white tracking-[0.2em] uppercase italic leading-none">CENTRALIZA-T</h1>
                            <div className="flex flex-col gap-0.5">
                                <p className="text-indigo-400 text-[8px] font-black uppercase tracking-[0.4em] flex items-center gap-2">
                                    Ecosystem v5.0
                                </p>
                                {auth?.company?.name && (
                                    <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.1em] truncate max-w-[150px]">
                                        {auth.company.name}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Global Search ... */}
                <div className="px-8 mb-6 relative">
                    {/* ... existing search code ... */}
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Escanear Ecosistema..."
                            className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-[11px] focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-700 font-black uppercase tracking-widest bg-white/[0.02]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                                <X size={16} />
                            </button>
                        )}
                    </div>
                    {/* ... search results ... */}
                    {searchResults.length > 0 && (
                        <div className="absolute left-8 right-8 top-full mt-3 bg-[#0a0f1d] border border-white/10 rounded-2xl shadow-[0_30px_60px_-10px_rgba(0,0,0,0.8)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 backdrop-blur-3xl">
                            {searchResults.map(app => (
                                <button
                                    key={app._id}
                                    onClick={() => {
                                        onOpenCENTRALIZAT(app);
                                        setSearchTerm('');
                                    }}
                                    className="w-full p-5 text-left hover:bg-white/[0.03] transition-all flex flex-col gap-1.5 border-b border-white/5 last:border-0 group/result"
                                >
                                    <span className="font-black text-[10px] uppercase tracking-wider text-slate-200 group-hover:text-indigo-400 transition-colors">{app.fullName}</span>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] text-slate-600 font-bold">{app.rut}</span>
                                        <span className="text-[8px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter group-hover:bg-indigo-600 group-hover:text-white transition-all">{app.status}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Navigation Menu Perfeccionado */}
                <nav className="flex-1 px-6 space-y-4 overflow-y-auto sidebar-scrollbar scroll-smooth pt-4">

                    {/* Dashboard Principal - MOVIDO A SUPERVISIÓN COMO MÓDULO DE CLIENTE */}

                    {/* SECCIÓN: ECOSISTEMA CEO */}
                    {auth?.role === 'Ceo_Centralizat' && (
                        <div className="space-y-1">
                            <button
                                onClick={() => toggleSection('ceo')}
                                className="w-full flex items-center justify-between px-6 py-5 rounded-2xl transition-all duration-500 group bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 active:scale-[0.98]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-600/20 group-hover:scale-110 transition-transform">
                                        <Zap size={20} className="text-white" />
                                    </div>
                                    <span className="font-black text-[13px] uppercase tracking-[0.15em] text-white">Ecosistema CEO</span>
                                </div>
                                <ChevronRight
                                    size={14}
                                    className={`text-slate-500 transition-transform duration-300 ${sections.ceo ? 'rotate-90' : ''}`}
                                />
                            </button>

                            <div className={`space-y-1 overflow-hidden transition-all duration-500 ${sections.ceo ? 'max-h-[500px] opacity-100 pt-2' : 'max-h-0 opacity-0'}`}>
                                {topLevelItems.map(item => <NavItem key={item.path} item={item} level={1} />)}
                            </div>
                        </div>
                    )}

                    {/* SECCIÓN OPERATIVA: GESTIÓN CENTRALIZA-T */}
                    <div className="space-y-1">
                        <button
                            onClick={() => toggleSection('centralizat')}
                            className="w-full flex items-center justify-between px-6 py-5 rounded-2xl transition-all duration-500 group bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 active:scale-[0.98]"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform">
                                    <Building2 size={20} className="text-white" />
                                </div>
                                <span className="font-black text-[13px] uppercase tracking-[0.15em] text-white">Gestión Centraliza-T</span>
                            </div>
                            <ChevronRight
                                size={14}
                                className={`text-slate-500 transition-transform duration-300 ${sections.centralizat ? 'rotate-90' : ''}`}
                            />
                        </button>

                        <div className={`space-y-4 overflow-hidden transition-all duration-500 ${sections.centralizat ? 'max-h-[3000px] opacity-100 pt-4' : 'max-h-0 opacity-0'}`}>

                            {/* 1. ADMINISTRACIÓN */}
                            <div className="space-y-1">
                                <button
                                    onClick={() => toggleSection('administration')}
                                    className="w-full flex items-center justify-between px-6 py-4 rounded-xl transition-all duration-500 group bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 ml-2"
                                >
                                    <div className="flex items-center gap-3">
                                        <ShieldCheck size={16} className="text-blue-400" />
                                        <span className="font-black text-[11px] uppercase tracking-[0.15em] text-slate-300 group-hover:text-white transition-colors">Administración</span>
                                    </div>
                                    <ChevronRight
                                        size={12}
                                        className={`text-slate-600 transition-transform duration-300 ${sections.administration ? 'rotate-90' : ''}`}
                                    />
                                </button>
                                <div className={`space-y-1 overflow-hidden transition-all duration-500 border-l border-white/5 ml-6 ${sections.administration ? 'max-h-[1000px] opacity-100 pt-2' : 'max-h-0 opacity-0'}`}>
                                    {administrationItems.filter(checkPermission).map((item) => <NavItem key={item.path} item={item} level={1} />)}
                                </div>
                            </div>

                            {/* 2. RECLUTAMIENTO */}
                            <div className="space-y-1">
                                <button
                                    onClick={() => toggleSection('recruitment')}
                                    className="w-full flex items-center justify-between px-6 py-4 rounded-xl transition-all duration-500 group bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 ml-2"
                                >
                                    <div className="flex items-center gap-3">
                                        <Users size={16} className="text-purple-400" />
                                        <span className="font-black text-[11px] uppercase tracking-[0.15em] text-slate-300 group-hover:text-white transition-colors">Reclutamiento</span>
                                    </div>
                                    <ChevronRight
                                        size={12}
                                        className={`text-slate-600 transition-transform duration-300 ${sections.recruitment ? 'rotate-90' : ''}`}
                                    />
                                </button>
                                <div className={`space-y-1 overflow-hidden transition-all duration-500 border-l border-white/5 ml-6 ${sections.recruitment ? 'max-h-[1000px] opacity-100 pt-2' : 'max-h-0 opacity-0'}`}>
                                    {recruitmentItems.filter(checkPermission).map((item) => <NavItem key={item.path} item={item} level={1} />)}
                                </div>
                            </div>

                            {/* 3. GESTIÓN & APROBACIONES */}
                            <div className="space-y-1">
                                <button
                                    onClick={() => toggleSection('management')}
                                    className="w-full flex items-center justify-between px-6 py-4 rounded-xl transition-all duration-500 group bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 ml-2"
                                >
                                    <div className="flex items-center gap-3">
                                        <FileCheck size={16} className="text-emerald-400" />
                                        <span className="font-black text-[11px] uppercase tracking-[0.15em] text-slate-300 group-hover:text-white transition-colors">CONTRATACIONES</span>
                                    </div>
                                    <ChevronRight
                                        size={12}
                                        className={`text-slate-600 transition-transform duration-300 ${sections.management ? 'rotate-90' : ''}`}
                                    />
                                </button>
                                <div className={`space-y-1 overflow-hidden transition-all duration-500 border-l border-white/5 ml-6 ${sections.management ? 'max-h-[500px] opacity-100 pt-2' : 'max-h-0 opacity-0'}`}>
                                    {managementItems.filter(checkPermission).map((item) => <NavItem key={item.path} item={item} level={1} />)}
                                </div>
                            </div>

                            {/* 4. AJUSTES Y PLANES */}
                            <div className="space-y-1 pt-4 border-t border-white/5 ml-2">
                                {checkPermission(settingsItem) && <NavItem item={settingsItem} level={1} />}
                                {checkPermission(subscriptionItem) && <NavItem item={subscriptionItem} level={1} />}
                                <NavItem item={{ id: 'ayuda', name: 'Centro de Ayuda', icon: LifeBuoy, path: '/ayuda' }} level={1} />
                            </div>

                        </div>
                    </div>
                </nav>

                {/* User Access Profile Section (Interactive) */}
                <div
                    onClick={() => setShowProfileModal(true)}
                    className="p-8 border-t border-white/5 bg-white/[0.01] cursor-pointer hover:bg-white/[0.05] transition-colors group/user relative"
                >
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-800 flex items-center justify-center font-black shadow-xl shadow-indigo-600/30 ring-2 ring-white/10 hover:rotate-[360deg] transition-all duration-1000 overflow-hidden">
                                {auth?.photo ? (
                                    <img src={auth.photo} alt={auth.name} className="w-full h-full object-cover" />
                                ) : (
                                    auth?.name?.charAt(0) || 'U'
                                )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#020617]"></div>
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-[11px] font-black uppercase tracking-widest text-white truncate max-w-[120px] group-hover/user:text-indigo-400 transition-colors">{auth?.name || 'Usuario'}</p>
                            <div className="flex items-center gap-2">
                                <Activity size={10} className="text-indigo-400" />
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter truncate max-w-[100px]">{auth?.role?.replace('_', ' ')}</p>
                            </div>
                        </div>
                        <div className="absolute right-4 opacity-0 group-hover/user:opacity-100 transition-opacity">
                            <Settings size={14} className="text-slate-400" />
                        </div>
                    </div>
                </div>

                {/* Profile Modal */}
                {showProfileModal && (
                    <UserProfileModal
                        user={auth}
                        onClose={() => setShowProfileModal(false)}
                        onUpdate={(updatedUser) => {
                            if (setAuth) {
                                setAuth(prev => ({ ...prev, ...updatedUser }));
                                localStorage.setItem('centralizat_user', JSON.stringify({ ...auth, ...updatedUser }));
                            } else {
                                window.location.reload();
                            }
                        }}
                    />
                )}
            </div>
        </>
    );
};

export default Sidebar;
