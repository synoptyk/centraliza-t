import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowRight, Zap, Play, CheckCircle2, Building2, LayoutDashboard, Database, ShieldCheck, Mail, Send, Users, Rocket, Briefcase, ClipboardList, UserPlus, Calendar, BrainCircuit, FileText, FileCheck, Activity, Folder, Settings, CreditCard } from 'lucide-react';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import ContactExecutiveModal from '../components/ContactExecutiveModal';

const LandingPage = ({ auth }) => {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [plans, setPlans] = useState([
        {
            _id: 'default_startup',
            name: 'Plan Startup',
            description: 'Ideal para empresas pequeñas que buscan agilizar su reclutamiento.',
            priceUF: 1.5,
            isPublic: true,
            isTrial: true,
            limits: { adminUsers: 2, monthlyApplicants: 50, projects: 5, storageGB: 5 },
            features: ['Soporte por Email', 'Evaluaciones Estándar']
        },
        {
            _id: 'default_business',
            name: 'Plan Business',
            description: 'Potencia total para medianas empresas con flujos complejos.',
            priceUF: 4.5,
            isPublic: true,
            isTrial: false,
            limits: { adminUsers: 10, monthlyApplicants: 200, projects: 20, storageGB: 50 },
            features: ['Soporte Prioritario', 'Personalización de Marca']
        },
        {
            _id: 'default_enterprise',
            name: 'Plan Enterprise',
            description: 'Control absoluto y personalización sin límites para grandes corporaciones.',
            priceUF: 12.0,
            isPublic: true,
            isTrial: false,
            limits: { adminUsers: 50, monthlyApplicants: 1000, projects: 100, storageGB: 500 },
            features: ['Soporte 24/7', 'API Personalizada']
        }
    ]);

    const modules = [
        {
            category: "Gestión Centraliza-T",
            items: [
                { name: "Gestión de Proyectos", desc: "No pierdas tiempo operando vacantes. Nosotros hacemos lo difícil, tú lideras el avance técnico.", icon: ClipboardList },
                { name: "Captura de Talento", desc: "Registro inteligente sin burocracia. Democratizamos el acceso al mejor talento del mercado.", icon: UserPlus },
                { name: "Entrevistas Filtro", desc: "Filtros reales, no manuales. Coordinación de élite para decisiones que no esperan.", icon: Calendar },
                { name: "Evaluación Técnica", desc: "Mide lo que importa. Olvida las certificaciones obsoletas, evalúa la competencia real.", icon: BrainCircuit },
                { name: "Seguridad & Prevención", desc: "Blindaje normativo total. Cumplimiento de estándares internacionales sin fricción.", icon: ShieldCheck },
                { name: "Gestión Documental", desc: "Cero papeles, cero demoras. Expedientes validados y listos en segundos.", icon: FileText },
                { name: "Maestro de Personal", desc: "Vista 360 de tu infraestructura humana. El control absoluto en una sola pantalla.", icon: Users },
            ]
        },
        {
            category: "Control Administrativo",
            items: [
                { name: "APROBACIÓN CDT", desc: "Digitalización real. Valida, aprueba y contrata con velocidad disruptiva.", icon: FileCheck },
                { name: "Dashboard Operativo", desc: "Analítica para resultados, no para reportes. KPIs críticos para el éxito directo.", icon: Activity },
                { name: "Capital Humano 360", desc: "Monitoreo integral. Porque gestionar personas no debe ser una carga administrativa.", icon: Users },
                { name: "Contenedor", desc: "Transparencia absoluta. Innovación compartida con tus socios estratégicos.", icon: Folder },
            ]
        },
        {
            category: "Nivel Enterprise",
            items: [
                { name: "Configuración Master", desc: "Control total del ecosistema. Tú defines las reglas, nosotros la potencia.", icon: Settings },
                { name: "Facturación & Planes", desc: "Transparencia comercial absoluta. Sin letras chicas ni enredos burocráticos.", icon: CreditCard },
            ]
        }
    ];

    const slides = [
        {
            image: '/assets/landing/hero1.png',
            title: "LIBERA TU POTENCIA OPERATIVA HOY",
            subtitle: "Mientras 'LA COMPETENCIA' te entierra en burocracia y manuales arcaicos, Centraliza-T desbloquea tu capacidad con herramientas diseñadas para los que ejecutan resultados."
        },
        {
            image: '/assets/landing/hero2.png',
            title: "MIENTRAS ELLOS SE CREEN UNIVERSIDAD...",
            subtitle: "Nosotros trabajamos para tu empresa. Deja de acumular diplomas de software y empieza a producir resultados reales. Cambialos hoy y CENTRALIZA-T."
        },
        {
            image: '/assets/landing/hero3.png',
            title: "INNOVACIÓN REAL VS. LENTITUD ACADÉMICA",
            subtitle: "Democratizamos el acceso al talento de élite eliminando los filtros obsoletos del pasado. El futuro pertenece a los ágiles, no solo a los certificados."
        },
        {
            image: '/assets/landing/hero4.png',
            title: "UN ECOSISTEMA BLINDADO PARA GANAR",
            subtitle: "Centraliza-T es la respuesta disruptiva frente a sistemas rígidos. Hacemos lo difícil, para que tu éxito sea lo único importante.",
            special: true
        }
    ];

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const { data } = await api.get('/subscriptions/plans');
                if (data && data.length > 0) {
                    // Filtrar solo planes públicos
                    setPlans(data.filter(p => p.isPublic));
                }
            } catch (error) {
                console.warn("Backend no disponible, usando planes estáticos por defecto.");
            }
        };
        fetchPlans();

        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    const features = [
        {
            icon: Users,
            title: "Talento sin Filtros",
            desc: "Gestiona el ciclo de vida del colaborador sin diplomas de adorno. Resultados reales desde el primer día."
        },
        {
            icon: LayoutDashboard,
            title: "Control Intuitivo",
            desc: "Interfaces diseñadas para humanos, no para robots. Visualiza tu éxito operativo sin manuales de 400 páginas."
        },
        {
            icon: ShieldCheck,
            title: "Blindaje de Verdad",
            desc: "Seguridad y cumplimiento normativo en ADN. Nosotros hacemos lo difícil de la ley, tú haces lo importante."
        },
        {
            icon: Zap,
            title: "Eficiencia Extrema",
            desc: "Automatización radical que elimina la burocracia. Hacemos que tu eficiencia llegue al máximo nivel posible."
        }
    ];

    return (
        <div className="min-h-screen bg-[#020617] text-white selection:bg-indigo-500/30">
            <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} auth={auth} light={false} />

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        className="fixed inset-0 z-40 bg-[#020617]/95 backdrop-blur-2xl pt-24 px-8 md:hidden shadow-2xl flex flex-col justify-between pb-12"
                    >
                        <div className="flex flex-col gap-8">
                            <a href="#features" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-white uppercase tracking-widest">Funcionalidades</a>
                            <a href="#modulos" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-white uppercase tracking-widest">Módulos</a>
                            <a href="#pricing" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-white uppercase tracking-widest">Planes</a>
                            <a href="#nosotros" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-white uppercase tracking-widest">Nuestro CEO</a>
                            <button
                                onClick={() => navigate(auth ? '/dashboard' : '/login')}
                                className="bg-indigo-600 text-white w-full py-4 rounded-2xl text-sm font-bold uppercase tracking-widest"
                            >
                                {auth ? 'Ir al Panel' : 'Acceso Clientes'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hero Section - DEEPEST BACKGROUND */}
            <section className="pt-24 pb-20 md:pt-32 md:pb-32 px-6 relative overflow-hidden bg-[#020617]">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-6">
                            <Zap size={14} className="text-indigo-400" />
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Lanzamiento Ecosistema v1.0</span>
                        </div>
                        <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-white leading-[1.1] mb-8 tracking-tight uppercase">
                            {slides[currentSlide].title}
                        </h1>
                        <p className="text-lg text-slate-400 leading-relaxed mb-10 max-w-xl">
                            {slides[currentSlide].subtitle}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-5">
                            <button
                                onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}
                                className="bg-indigo-600 text-white px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-white hover:text-indigo-600 transition-all shadow-2xl shadow-indigo-600/20 flex items-center justify-center gap-3 group"
                            >
                                Ver Planes
                                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <motion.button
                                onClick={() => setIsContactModalOpen(true)}
                                animate={{
                                    boxShadow: ["0 0 0 0px rgba(99, 102, 241, 0)", "0 0 0 10px rgba(99, 102, 241, 0)", "0 0 0 0px rgba(99, 102, 241, 0)"],
                                    scale: [1, 1.02, 1]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="bg-slate-900/40 border-2 border-indigo-500/50 text-white px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-widest hover:border-indigo-400 hover:bg-indigo-600/10 transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
                            >
                                <span className="relative z-10 flex items-center gap-3">
                                    Contactar Ejecutivo
                                    <Zap size={16} className="text-amber-400 animate-pulse" />
                                </span>
                                <motion.div
                                    className="absolute inset-0 bg-indigo-500/20"
                                    animate={{ opacity: [0, 0.2, 0] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                />
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Image Carousel */}
                    <div className="relative h-[300px] sm:h-[450px] lg:h-[600px] rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white/10">
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={currentSlide}
                                src={slides[currentSlide].image}
                                initial={{ opacity: 0, scale: slides[currentSlide].special ? 1.2 : 1.1, x: slides[currentSlide].special ? 50 : 0 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95, x: slides[currentSlide].special ? -50 : 0 }}
                                transition={{ duration: slides[currentSlide].special ? 1.2 : 0.8, ease: "easeOut" }}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        </AnimatePresence>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/80 to-transparent" />

                        {/* Dots */}
                        <div className="absolute bottom-10 left-10 flex gap-3">
                            {slides.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-2 rounded-full transition-all duration-500 ${currentSlide === i ? 'w-10 bg-white' : 'w-2 bg-white/40'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Manifesto Section (Disruptive) - VIBRANT BLUE RETURNED */}
            <section className="py-24 md:py-40 bg-indigo-600 relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#020617] to-transparent opacity-40"></div>
                    <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#020617] to-transparent opacity-40"></div>

                    {/* Decorative blobs */}
                    <div className="absolute top-1/2 left-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 -ml-48"></div>
                    <div className="absolute top-1/2 right-0 w-96 h-96 bg-slate-900/40 rounded-full blur-[100px] -translate-y-1/2 -mr-48"></div>
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <p className="text-xs font-black text-indigo-200 uppercase tracking-[0.5em] mb-6">Nuestra Filosofía</p>
                            <h2 className="text-2xl sm:text-4xl lg:text-6xl font-black text-white leading-tight mb-8 italic tracking-tighter uppercase">
                                Nosotros haremos lo difícil<br />
                                <span className="text-slate-900">para que tú hagas lo importante.</span>
                            </h2>
                            <p className="text-indigo-100 text-lg leading-relaxed mb-10 font-medium">
                                Mientras la competencia te obliga a certificarte en sus plataformas para "entenderlas", nosotros democratizamos la potencia. No somos un centro educacional; somos el motor que escala tu empresa.
                            </p>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-4 bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-sm">
                                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/20">
                                        <CheckCircle2 size={24} />
                                    </div>
                                    <span className="text-slate-200 font-bold text-sm">Cero Academias: Úsalo hoy, domínalo hoy.</span>
                                </div>
                                <div className="flex items-center gap-4 bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-sm">
                                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/20">
                                        <CheckCircle2 size={24} />
                                    </div>
                                    <span className="text-slate-200 font-bold text-sm">Sin "DIPLOMAS" de relleno en el CV.</span>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="bg-slate-950 p-12 rounded-[3.5rem] border border-white/10 shadow-2xl relative"
                        >
                            <div className="absolute -top-6 -right-6 bg-amber-400 text-slate-950 font-black px-8 py-3 rounded-2xl text-[10px] uppercase tracking-widest shadow-xl rotate-12">
                                100% Disruptivo
                            </div>
                            <h3 className="text-2xl font-black text-white mb-10 italic uppercase border-b border-white/10 pb-6 tracking-tighter">
                                Innovación vs Copia
                            </h3>
                            <div className="space-y-10">
                                <div className="space-y-4 opacity-50">
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">LA COMPETENCIA</p>
                                    <div className="h-3 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                                        <div className="h-full bg-slate-700 w-[35%]"></div>
                                    </div>
                                    <p className="text-sm font-medium text-slate-400 italic font-mono">"Te confunden con burocracia y certificaciones académicas."</p>
                                </div>

                                <div className="space-y-5 pt-4">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-black text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-3">
                                            <Zap size={18} className="fill-indigo-400" /> Ecosistema Centraliza-T
                                        </p>
                                        <span className="text-[10px] font-black text-indigo-400/50 uppercase tracking-widest">Poder Absoluto</span>
                                    </div>
                                    <div className="h-5 bg-slate-900 rounded-full overflow-hidden border border-indigo-500/30 shadow-[0_0_25px_rgba(79,70,229,0.2)]">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: '100%' }}
                                            transition={{ duration: 1.5, delay: 0.5 }}
                                            className="h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.6)] relative"
                                        >
                                            <motion.div
                                                animate={{ x: ['-100%', '100%'] }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                            />
                                        </motion.div>
                                    </div>
                                    <p className="text-lg md:text-2xl font-black text-white leading-tight tracking-tight">
                                        "Hacemos lo difícil. <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Resultados reales sin manuales.</span>"
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Trust Banner - NEW Signals of Authority */}
            <div className="bg-slate-900 border-y border-white/5 py-12 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60 hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="text-indigo-400" size={24} />
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-white">Seguridad de Grado Bancario</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Database className="text-indigo-400" size={24} />
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-white">Infraestructura Multi-Region</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Activity className="text-indigo-400" size={24} />
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-white">99.9% Uptime Garantizado</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Users className="text-indigo-400" size={24} />
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-white">Soporte Synoptyk Directo</span>
                    </div>
                </div>
            </div>

            {/* Features section moved down - DARK SLATE */}
            <section id="features" className="py-24 md:py-40 bg-[#0f172a] relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <p className="text-xs font-black text-indigo-400 uppercase tracking-[0.4em] mb-4">¿Por qué Centraliza-t?</p>
                        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">Diseñado para la Excelencia Operativa</h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((f, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -10, scale: 1.02 }}
                                className="bg-white/5 backdrop-blur-xl p-10 rounded-[3rem] border border-white/10 shadow-xl hover:shadow-indigo-500/10 transition-all group"
                            >
                                <div className="w-16 h-16 bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-indigo-600/40 transition-all duration-500">
                                    <f.icon size={30} />
                                </div>
                                <h3 className="text-xl font-black text-white mb-4 italic uppercase tracking-tight">{f.title}</h3>
                                <p className="text-slate-400 leading-relaxed text-sm font-medium">{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Modules section - DARKEST SLATE */}
            <section id="modulos" className="py-24 md:py-40 bg-[#020617] relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <p className="text-xs font-black text-indigo-400 uppercase tracking-[0.4em] mb-4">Ecosistema Completo</p>
                        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">Módulos Centraliza-T</h2>
                        <div className="h-1.5 w-24 bg-indigo-600 mx-auto mt-6 rounded-full"></div>
                    </div>

                    <div className="space-y-32">
                        {modules.map((cat, i) => (
                            <div key={i}>
                                <div className="flex items-center gap-8 mb-16">
                                    <h3 className="text-2xl font-black text-white uppercase tracking-[0.4em] italic">{cat.category}</h3>
                                    <div className="h-[2px] bg-gradient-to-r from-indigo-500/50 to-transparent flex-1"></div>
                                </div>
                                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                                    {cat.items.map((m, j) => (
                                        <motion.div
                                            key={j}
                                            whileHover={{ y: -12, scale: 1.02 }}
                                            className="bg-indigo-600/5 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/5 hover:border-indigo-500/40 transition-all duration-500 group relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-600/20 transition-colors"></div>

                                            <div className="w-16 h-16 bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-center mb-8 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-xl group-hover:shadow-indigo-600/40 transition-all duration-500">
                                                <m.icon size={28} />
                                            </div>

                                            <h4 className="text-lg font-black text-white uppercase tracking-wider mb-4 group-hover:text-indigo-400 transition-colors italic">{m.name}</h4>
                                            <p className="text-sm text-slate-400 leading-relaxed font-medium">{m.desc}</p>

                                            <div className="mt-8 flex items-center gap-2 text-[10px] font-black text-indigo-400/0 group-hover:text-indigo-400 transition-all duration-500 uppercase tracking-widest">
                                                Explorar Módulo <ArrowRight size={12} />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CEO Visionary Section - PREMIUM DISRUPTIVE ARCHITECT STYLE */}
            <section id="nosotros" className="py-24 md:py-40 bg-slate-950 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_70%_50%,rgba(79,70,229,0.2),transparent_50%)]"></div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        {/* Visual Column */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1 }}
                            className="relative group lg:order-last"
                        >
                            <div className="absolute -inset-4 bg-indigo-600/20 rounded-[4rem] blur-3xl group-hover:bg-indigo-600/30 transition-all duration-700"></div>
                            <div className="relative rounded-[3.5rem] overflow-hidden border-2 border-white/10 shadow-2xl">
                                <img
                                    src="/assets/landing/ceo_visionary.png"
                                    alt="Mauricio Barrientos - CEO Empresa Synoptyk"
                                    className="w-full grayscale hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
                                />
                                <div className="absolute inset-x-0 bottom-0 p-10 bg-gradient-to-t from-slate-950/90 to-transparent">
                                    <p className="text-white font-black text-2xl uppercase tracking-tighter italic">Mauricio Barrientos</p>
                                    <p className="text-indigo-400 text-xs font-black uppercase tracking-[0.3em]">Fundador & Visionario Arquitecto</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Text Column */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="space-y-10"
                        >
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                                    <BrainCircuit size={14} className="text-indigo-400" />
                                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">El Cerebro Detrás del Ecosistema</span>
                                </div>
                                <h2 className="text-2xl sm:text-4xl lg:text-6xl font-black text-white leading-tight italic uppercase tracking-tighter">
                                    De la Resistencia al <span className="text-indigo-500">Poder Absoluto</span>
                                </h2>
                            </div>

                            <div className="space-y-6 text-slate-400 text-base leading-relaxed font-medium">
                                <p>
                                    <b className="text-white">Empresa Synoptyk</b> es el ecosistema padre de <b className="text-indigo-400 font-black">CENTRALIZA-T</b>, y Mauricio "Mauro" Barrientos es el cerebro detrás de cada línea de código, cada innovación y cada idea que hoy impulsa tu crecimiento.
                                </p>
                                <p>
                                    Con más de 15 años de experiencia liderando flujos administrativos, financieros y operativos, Mauro detectó una verdad incómoda: <i className="text-slate-300">las empresas mueren por la lentitud en sus decisiones.</i> En 2010, cuando la tecnología era un lujo para pocos, él ya diseñaba procesos integrales para obtener datos en línea, sabiendo que la eficiencia no es una opción, sino un arma de supervivencia.
                                </p>
                                <p className="border-l-4 border-indigo-600 pl-8 italic py-4 bg-indigo-600/5 rounded-r-3xl">
                                    "Me cansé de las limitaciones de 'los señores del Excel' y de las visiones administrativas que frenan la innovación. Decidí que mi objetivo transversal no tendría más escalas intermedias."
                                </p>
                                <p>
                                    CENTRALIZA-T nace de esa independencia. Es la democratización de la gestión empresarial. Es el fin de la burocracia académica para dar paso a herramientas amigables pero letalmente eficientes. Mauro no solo creó un software; diseñó una revolución para que tú nunca más tengas que pedir permiso para innovar.
                                </p>
                            </div>

                            <div className="pt-6">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    className="px-10 py-5 bg-white text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-indigo-600 hover:text-white transition-all shadow-xl"
                                    onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}
                                >
                                    Únete a la Revolución
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>


            {/* Pricing Section - VIBRANT BLUE */}
            <section id="pricing" className="py-24 px-6 bg-indigo-600 relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#020617] to-transparent opacity-40"></div>
                    <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#020617] to-transparent opacity-40"></div>
                </div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-20">
                        <p className="text-xs font-black text-indigo-100 uppercase tracking-[0.4em] mb-4">Inversión Inteligente</p>
                        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-6">Planes que se Adaptan a tu Crecimiento</h2>
                        <p className="text-indigo-50 max-w-2xl mx-auto">Selecciona la solución que mejor se adapte a las necesidades de tu empresa. Todos nuestros planes incluyen soporte técnico prioritario.</p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-10">
                        {plans.map((plan, i) => (
                            <div
                                key={i}
                                className={`relative bg-slate-900/90 backdrop-blur-xl rounded-[3.5rem] p-12 border-2 transition-all hover:scale-[1.02] duration-500 ${plan.isTrial ? 'border-amber-400/50 shadow-2xl shadow-amber-400/20' : 'border-white/10'}`}
                            >
                                {plan.isTrial && (
                                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/30">
                                        Más Popular
                                    </div>
                                )}
                                <div className="mb-10">
                                    <h4 className="text-2xl font-black text-white mb-2">{plan.name}</h4>
                                    <p className="text-slate-400 text-sm leading-relaxed mb-8 h-12 overflow-hidden">{plan.description}</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-black text-white tracking-tighter">UF {plan.priceUF}</span>
                                        <span className="text-slate-500 font-bold text-sm">/mes</span>
                                    </div>
                                    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                                        <Zap size={10} className="text-amber-400" />
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Retorno de Inversión Inmediato</span>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-10">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 size={18} className="text-indigo-400 flex-shrink-0" />
                                        <span className="text-sm font-bold text-slate-300">
                                            {plan.limits.adminUsers === 50 ? 'Acceso Ilimitado' : `${plan.limits.adminUsers} Usuarios Administrativos`}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 size={18} className="text-indigo-400 flex-shrink-0" />
                                        <span className="text-sm font-bold text-slate-300">Hasta {plan.limits.monthlyApplicants} Postulantes/Mes</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 size={18} className="text-indigo-400 flex-shrink-0" />
                                        <span className="text-sm font-bold text-slate-300">{plan.limits.projects} Proyectos Activos</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 size={18} className="text-indigo-400 flex-shrink-0" />
                                        <span className="text-sm font-bold text-slate-300">{plan.limits.storageGB} GB Almacenamiento</span>
                                    </div>
                                    {plan.features.map((feature, fIndex) => (
                                        <div key={fIndex} className="flex items-center gap-3">
                                            <CheckCircle2 size={18} className="text-indigo-400 flex-shrink-0" />
                                            <span className="text-sm font-bold text-slate-300">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => navigate(`/register?plan=${plan._id}`)}
                                    className={`w-full py-5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${plan.isTrial ? 'bg-indigo-600 text-white hover:bg-white hover:text-indigo-600 shadow-xl shadow-indigo-500/20 scale-105' : 'bg-white text-slate-950 hover:bg-indigo-600 hover:text-white'}`}
                                >
                                    {plan.name === 'Plan Enterprise' ? 'Contactar Especialista' : 'Comenzar Ahora'}
                                </button>

                                <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-center gap-2 grayscale opacity-40">
                                    <ShieldCheck size={14} />
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Garantía de Potencia Synoptyk</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 text-center">
                        <p className="text-indigo-200/50 text-xs font-medium italic">
                            * Precios expresados en Unidades de Fomento (UF). Facturación mensual exenta de IVA según normativa vigente.
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer - ALIGNED WITH DEEPEST BACKGROUND */}
            <footer className="bg-[#020617] border-t border-white/5 py-20 px-6">
                <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-16">
                    <div className="col-span-2">
                        <div className="flex items-center gap-2 mb-8 cursor-pointer"
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        >
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                                <Rocket className="text-white" size={24} />
                            </div>
                            <span className="text-xl font-black text-white tracking-tighter">CENTRALIZA-T</span>
                        </div>
                        <p className="text-slate-400 max-w-sm leading-relaxed mb-6 font-medium">
                            Transformando la gestión empresarial con tecnología de vanguardia y un ecosistema diseñado para la eficiencia máxima en el mercado latinoamericano.
                        </p>
                        <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                            Un producto de elite de Empresa Synoptyk.
                        </p>
                        <div className="flex gap-4">
                            <a href="https://synoptyk.cl" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-xl text-slate-400 group">
                                <Building2 size={20} className="group-hover:scale-110 transition-transform" />
                            </a>
                            <a href="mailto:centraliza-t@synoptyk.cl" className="w-12 h-12 bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-xl text-slate-400 group">
                                <Mail size={20} className="group-hover:scale-110 transition-transform" />
                            </a>
                            <a href="#" className="w-12 h-12 bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-xl text-slate-400 group">
                                <Activity size={20} className="group-hover:scale-110 transition-transform" />
                            </a>
                        </div>
                    </div>

                    <div className="grid gap-6">
                        <p className="text-white font-black uppercase tracking-widest text-[10px] italic underline decoration-indigo-500 underline-offset-8">Ecosistema</p>
                        <a href="#features" className="text-slate-400 text-sm font-bold hover:text-indigo-400 transition-colors">Funcionalidades</a>
                        <a href="#pricing" className="text-slate-400 text-sm font-bold hover:text-indigo-400 transition-colors">Planes Corporativos</a>
                        <a href="#modulos" className="text-slate-400 text-sm font-bold hover:text-indigo-400 transition-colors">Maestro de Módulos</a>
                    </div>

                    <div className="grid gap-6">
                        <p className="text-white font-black uppercase tracking-widest text-[10px] italic underline decoration-indigo-500 underline-offset-8">Corporativo</p>
                        <a href="https://synoptyk.cl" target="_blank" rel="noopener noreferrer" className="text-slate-400 text-sm font-bold hover:text-indigo-400 transition-colors">Sobre Synoptyk</a>
                        <a href="mailto:centraliza-t@synoptyk.cl" className="text-slate-400 text-sm font-bold hover:text-indigo-400 transition-colors">Soporte Técnico</a>
                        <a href="#" className="text-slate-400 text-sm font-bold hover:text-indigo-400 transition-colors">Base de Conocimiento</a>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto pt-20 mt-20 border-t border-white/5 flex flex-col md:flex-row justify-between gap-8 items-center">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-loose text-center md:text-left">
                        © 2026 CENTRALIZA-T. TECNOLOGÍA PROPIETARIA DE EMPRESA SYNOPTYK. <br className="hidden md:block" />
                        TODOS LOS DERECHOS RESERVADOS.
                    </p>
                    <div className="flex gap-10">
                        <a href="#" className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] hover:text-white transition-all">Privacidad</a>
                        <a href="#" className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] hover:text-white transition-all">Términos Legales</a>
                    </div>
                </div>
            </footer>

            <ContactExecutiveModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
            />
        </div>
    );
};

export default LandingPage;
