import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, Menu, X, ChevronDown, ClipboardList, UserPlus, Calendar, BrainCircuit, ShieldCheck, FileText, Users, FileCheck, Activity, Folder, Settings, CreditCard } from 'lucide-react';

const Navbar = ({ isMenuOpen, setIsMenuOpen, light = true, auth = null }) => {
    const navigate = useNavigate();
    const [isModulesOpen, setIsModulesOpen] = useState(false);

    const modules = [
        {
            category: "Flujo de Talento",
            items: [
                { name: "Gestión de Proyectos", desc: "Administración central de vacantes", icon: ClipboardList },
                { name: "Captura de Talento", desc: "Seguimiento integral de postulantes", icon: UserPlus },
                { name: "Entrevistas Filtro", desc: "Coordinación de evaluaciones", icon: Calendar },
                { name: "Evaluación Técnica", desc: "Medición de competencias", icon: BrainCircuit },
                { name: "Seguridad & Prevención", desc: "Cumplimiento normativo", icon: ShieldCheck },
                { name: "Gestión Documental", desc: "Expedientes digitales", icon: FileText },
                { name: "Maestro de Personal", desc: "Vista 360 laboral", icon: Users },
            ]
        },
        {
            category: "Control & Gestión",
            items: [
                { name: "Aprobación de Contrato", desc: "Flujo digital de contratación", icon: FileCheck },
                { name: "Dashboard Empresa", desc: "Analítica en tiempo real", icon: Activity },
                { name: "Capital Humano 360", desc: "Monitorización de desempeño", icon: Users },
                { name: "Contenedor", desc: "Portal para clientes finales", icon: Folder },
            ]
        },
        {
            category: "Administración",
            items: [
                { name: "Ajustes del Sistema", desc: "Configuración global", icon: Settings },
                { name: "Planes & Facturas", desc: "Gestión comercial", icon: CreditCard },
            ]
        }
    ];

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all ${light ? 'bg-white/80 backdrop-blur-xl border-b border-slate-100' : 'bg-slate-950/40 backdrop-blur-xl border-b border-white/5'}`}>
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                        <Rocket className="text-white" size={24} />
                    </div>
                    <span className={`text-xl font-black tracking-tighter ${light ? 'text-slate-900' : 'text-white'}`}>CENTRALIZA-T</span>
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-10">
                    <div className="relative group"
                        onMouseEnter={() => setIsModulesOpen(true)}
                        onMouseLeave={() => setIsModulesOpen(false)}
                    >
                        <button className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${light ? 'text-slate-500 hover:text-indigo-600' : 'text-slate-400 hover:text-indigo-400'}`}>
                            Módulos Centraliza-T
                            <ChevronDown size={14} className={`transition-transform duration-300 ${isModulesOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        <div className={`absolute top-full left-1/2 -translate-x-1/2 pt-4 transition-all duration-300 ${isModulesOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-4'}`}>
                            <div className={`w-[700px] grid grid-cols-3 gap-8 p-10 rounded-[2.5rem] shadow-2xl border ${light ? 'bg-white border-slate-100 shadow-slate-200/50' : 'bg-slate-950 border-white/5 shadow-indigo-500/10'}`}>
                                {modules.map((cat, i) => (
                                    <div key={i} className="space-y-6">
                                        <p className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-4">{cat.category}</p>
                                        <div className="space-y-4">
                                            {cat.items.map((item, j) => (
                                                <a href="/#modulos" key={j} className="flex items-start gap-4 group/item cursor-pointer">
                                                    <div className={`p-2 rounded-xl transition-colors ${light ? 'bg-slate-50 group-hover/item:bg-indigo-50 text-slate-400 group-hover/item:text-indigo-600' : 'bg-white/5 group-hover/item:bg-indigo-500/10 text-slate-500 group-hover/item:text-indigo-400'}`}>
                                                        <item.icon size={16} />
                                                    </div>
                                                    <div>
                                                        <p className={`text-[10px] font-black uppercase tracking-tight mb-1 transition-colors ${light ? 'text-slate-900 group-hover/item:text-indigo-600' : 'text-white group-hover/item:text-indigo-400'}`}>{item.name}</p>
                                                        <p className="text-[9px] font-medium text-slate-400 leading-tight">{item.desc}</p>
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <a href="/#features" className={`text-[10px] font-black uppercase tracking-widest transition-colors ${light ? 'text-slate-500 hover:text-indigo-600' : 'text-slate-400 hover:text-indigo-400'}`}>Funcionalidades</a>
                    <a href="/#pricing" className={`text-[10px] font-black uppercase tracking-widest transition-colors ${light ? 'text-slate-500 hover:text-indigo-600' : 'text-slate-400 hover:text-indigo-400'}`}>Planes</a>
                    <a href="/#nosotros" className={`text-[10px] font-black uppercase tracking-widest transition-colors ${light ? 'text-slate-500 hover:text-indigo-600' : 'text-slate-400 hover:text-indigo-400'}`}>Nosotros</a>

                    {auth ? (
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="bg-indigo-600 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-indigo-200"
                        >
                            Ir al Panel
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate('/login')}
                            className={`${light ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'} px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-lg`}
                        >
                            Acceso Clientes
                        </button>
                    )}
                </div>

                <button className={`${light ? 'text-slate-900' : 'text-white'} md:hidden`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
