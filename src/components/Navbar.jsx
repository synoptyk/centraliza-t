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
                { name: "Gestión de Proyectos", desc: "No pierdas tiempo gestionando vacantes. Nosotros hacemos lo difícil, tú lideras el equipo.", icon: ClipboardList },
                { name: "Captura de Talento", desc: "Registro integral sin burocracia. Democratizamos el acceso al mejor talento de la región.", icon: UserPlus },
                { name: "Entrevistas Filtro", desc: "Filtros reales, no manuales. Coordinación inteligente para decisiones rápidas.", icon: Calendar },
                { name: "Evaluación Técnica", desc: "Mide lo que importa. Olvida las certificaciones de papel, evalúa competencias reales.", icon: BrainCircuit },
                { name: "Seguridad & Prevención", desc: "Blindaje total. Cumplimiento normativo automático mientras tú te enfocas en crecer.", icon: ShieldCheck },
                { name: "Gestión Documental", desc: "Cero papeles, cero enredos. Expedientes digitales validados al instante.", icon: FileText },
                { name: "Maestro de Personal", desc: "Vista 360 de tu equipo. El control que mereces sin la complejidad de siempre.", icon: Users },
            ]
        },
        {
            category: "Control & Gestión",
            items: [
                { name: "Aprobación de Contrato", desc: "Digitalización real. Valida y contrata en segundos, no en días.", icon: FileCheck },
                { name: "Dashboard Empresa", desc: "Analítica para ejecutivos, no para académicos. KPIs claros para resultados directos.", icon: Activity },
                { name: "Capital Humano 360", desc: "Monitoreo integral. Porque gestionar personas no debería ser una carrera universitaria.", icon: Users },
                { name: "Contenedor", desc: "Portal de cliente transparente. Innovación compartida con tus socios estratégicos.", icon: Folder },
            ]
        },
        {
            category: "Administración",
            items: [
                { name: "Ajustes del Sistema", desc: "Configuración master. Tú tienes el poder, nosotros la infraestructura.", icon: Settings },
                { name: "Planes & Facturas", desc: "Transparencia comercial. Sin letras chicas ni certificaciones obligatorias.", icon: CreditCard },
            ]
        }
    ];

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all ${light ? 'bg-white/80 backdrop-blur-xl border-b border-slate-100' : 'bg-indigo-600/95 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-indigo-500/20'}`}>
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
                        <button
                            onClick={() => {
                                const el = document.getElementById('modulos');
                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                                else navigate('/#modulos');
                            }}
                            className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 ${light ? 'text-slate-500 hover:text-indigo-600' : 'text-white hover:text-indigo-200'}`}
                        >
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
                                                <a href="/#modulos" key={j} className="flex items-start gap-4 group/item cursor-pointer p-3 rounded-2xl transition-all hover:bg-white/5 hover:translate-x-1">
                                                    <div className={`p-2.5 rounded-xl transition-all duration-300 ${light ? 'bg-slate-50 group-hover/item:bg-indigo-50 text-slate-400 group-hover/item:text-indigo-600' : 'bg-white/5 group-hover/item:bg-indigo-600 group-hover/item:text-white group-hover/item:shadow-lg group-hover/item:shadow-indigo-600/20 text-slate-500'}`}>
                                                        <item.icon size={18} />
                                                    </div>
                                                    <div className="pt-1">
                                                        <p className={`text-[10px] font-black uppercase tracking-tight mb-1 transition-colors ${light ? 'text-slate-900 group-hover/item:text-indigo-600' : 'text-white group-hover/item:text-indigo-400'}`}>{item.name}</p>
                                                        <p className="text-[9px] font-medium text-slate-500 leading-tight group-hover/item:text-slate-300 transition-colors">{item.desc}</p>
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <a href="/#features" className={`text-[10px] font-black uppercase tracking-widest transition-colors ${light ? 'text-slate-500 hover:text-indigo-600' : 'text-white hover:text-indigo-200'}`}>Funcionalidades</a>
                    <a href="/#pricing" className={`text-[10px] font-black uppercase tracking-widest transition-colors ${light ? 'text-slate-500 hover:text-indigo-600' : 'text-white hover:text-indigo-200'}`}>Planes</a>
                    <a href="#nosotros" className="text-sm font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest">Nuestro CEO</a>

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
