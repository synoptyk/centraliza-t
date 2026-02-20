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
    FolderOpen
} from 'lucide-react';

const Sidebar = ({ onOpenCENTRALIZAT, auth, setAuth, onLogout }) => {
    // ... (rest of component)

    const [showProfileModal, setShowProfileModal] = useState(false);
    const [counts, setCounts] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    // State for sections
    const [sections, setSections] = useState({
        centralizat: true, // New Parent Module
        talent: false,
        management: false,
        supervision: false
    });

    const toggleSection = (section) => {
        setSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // ... useEffect ...

    // --- TOP LEVEL ITEMS ---
    const topLevelItems = [
        ...(auth?.role === 'Ceo_Centralizat' ? [{ id: 'admin-command', name: 'Centro de Mando CEO', icon: ShieldCheck, path: '/admin/command-center' }] : []),
    ];

    const settingsItem = { id: 'configuracion', name: 'Ajustes del Sistema', icon: Settings, path: '/configuracion' };

    const talentFlowItems = [
        { id: 'proyectos', name: 'Gestión de Proyectos', icon: ClipboardList, path: '/proyectos' },
        { id: 'ingreso', name: 'Captura de Talento', icon: UserPlus, path: '/ingreso' },
        { id: 'entrevista', name: 'Entrevistas Filtro', icon: Calendar, path: '/entrevista', badge: counts.entrevista },
        { id: 'tests', name: 'Evaluación Técnica', icon: BrainCircuit, path: '/tests', badge: counts.tests },
        { id: 'acreditacion-prevencion', name: 'Seguridad & Prevención', icon: ShieldCheck, path: '/acreditacion-prevencion', badge: counts.acreditacion },
        { id: 'documentos', name: 'Gestión Documental', icon: FileText, path: '/documentos', badge: counts.documentos },
        { id: 'ficha-colaborador', name: 'Maestro de Personal', icon: UserPlus, path: '/ficha-colaborador', badge: counts.ficha },
    ];

    const managementItems = [
        { id: 'contratacion', name: 'Aprobación de Contrato', icon: FileCheck, path: '/contratacion', badge: counts.contratacion },
    ];

    const supervisionItems = [
        { id: 'dashboard-empresa', name: 'Dashboard Empresa', icon: Activity, path: '/dashboard-empresa' },
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
        <div className="w-80 h-screen bg-[#020617] text-white flex flex-col fixed left-0 top-0 z-40 print:hidden shadow-[20px_0_60px_-15px_rgba(0,0,0,0.5)] border-r border-white/5">

            {/* Branding Header ... */}
            <div className="p-10">
                <div className="flex items-center gap-4 group cursor-default">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-fuchsia-600 flex items-center justify-center shadow-xl shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-500 ring-1 ring-white/20">
                        <Building2 className="text-white" size={24} />
                    </div>
                    <div className="space-y-0.5">
                        <h1 className="text-xl font-black text-white tracking-[0.2em] uppercase italic leading-none">CENTRALIZA-T</h1>
                        <p className="text-indigo-400 text-[8px] font-black uppercase tracking-[0.4em] flex items-center gap-2">
                            Ecosystem v5.0
                        </p>
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
            <nav className="flex-1 px-6 space-y-2 overflow-y-auto sidebar-scrollbar scroll-smooth">

                {/* Level 1: Top Level Items */}
                {topLevelItems.filter(checkPermission).map(item => <NavItem key={item.path} item={item} level={0} />)}

                {/* Level 1: CENTRALIZA-T MODULE WRAPPER */}
                <div className="space-y-1 mt-6 pt-6 border-t border-white/5">
                    <button
                        onClick={() => toggleSection('centralizat')}
                        className="w-full flex items-center justify-between px-5 py-3 rounded-2xl transition-all duration-300 hover:bg-white/[0.03] group bg-white/[0.02]"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-110 transition-transform duration-300">
                                <Building2 size={16} className="text-white" />
                            </div>
                            <span className="font-black text-[12px] uppercase tracking-[0.15em] text-indigo-200 group-hover:text-white transition-colors">CENTRALIZA-T</span>
                        </div>
                        <ChevronRight
                            size={14}
                            className={`text-slate-600 transition-transform duration-300 ${sections.centralizat ? 'rotate-90' : ''}`}
                        />
                    </button>

                    <div className={`space-y-1 overflow-hidden transition-all duration-500 pl-2 ${sections.centralizat ? 'max-h-[2000px] opacity-100 pt-2' : 'max-h-0 opacity-0'}`}>

                        {/* Level 2: Settings */}
                        {checkPermission(settingsItem) && <NavItem item={settingsItem} level={1} />}

                        {/* Level 2: Flujo de Talento */}
                        <div className="space-y-1 mt-2">
                            <button
                                onClick={() => toggleSection('talent')}
                                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-300 hover:bg-white/[0.03] group ml-2"
                            >
                                <span className="font-black text-[10px] uppercase tracking-[0.15em] text-slate-400 group-hover:text-indigo-300 transition-colors">Flujo de Talento</span>
                                <ChevronRight
                                    size={12}
                                    className={`text-slate-600 transition-transform duration-300 ${sections.talent ? 'rotate-90' : ''}`}
                                />
                            </button>
                            <div className={`space-y-1 overflow-hidden transition-all duration-500 border-l border-white/5 ml-4 ${sections.talent ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                {talentFlowItems.filter(checkPermission).map((item) => <NavItem key={item.path} item={item} level={2} />)}
                            </div>
                        </div>

                        {/* Level 2: Gestión & Aprobaciones */}
                        <div className="space-y-1 mt-2">
                            <button
                                onClick={() => toggleSection('management')}
                                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-300 hover:bg-white/[0.03] group ml-2"
                            >
                                <span className="font-black text-[10px] uppercase tracking-[0.15em] text-slate-400 group-hover:text-indigo-300 transition-colors">Gestión & Aprobaciones</span>
                                <ChevronRight
                                    size={12}
                                    className={`text-slate-600 transition-transform duration-300 ${sections.management ? 'rotate-90' : ''}`}
                                />
                            </button>
                            <div className={`space-y-1 overflow-hidden transition-all duration-500 border-l border-white/5 ml-4 ${sections.management ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                {managementItems.filter(checkPermission).map((item) => <NavItem key={item.path} item={item} level={2} />)}
                            </div>
                        </div>

                        {/* Level 2: Supervisión */}
                        <div className="space-y-1 mt-2">
                            <button
                                onClick={() => toggleSection('supervision')}
                                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-300 hover:bg-white/[0.03] group ml-2"
                            >
                                <span className="font-black text-[10px] uppercase tracking-[0.15em] text-slate-400 group-hover:text-indigo-300 transition-colors">Supervisión</span>
                                <ChevronRight
                                    size={12}
                                    className={`text-slate-600 transition-transform duration-300 ${sections.supervision ? 'rotate-90' : ''}`}
                                />
                            </button>
                            <div className={`space-y-1 overflow-hidden transition-all duration-500 border-l border-white/5 ml-4 ${sections.supervision ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                {supervisionItems.filter(checkPermission).map((item) => <NavItem key={item.path} item={item} level={2} />)}
                            </div>
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
    );
};

export default Sidebar;
