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

    const slides = [
        {
            image: '/assets/landing/hero1.png',
            title: "NOSOTROS HAREMOS LO DIFICIL PARA QUE TU HAGAS LO IMPORTANTE",
            subtitle: "Olvídate de certificaciones eternas y burocracia académica. Centraliza-T democratiza la gestión de talento para los que realmente ejecutan."
        },
        {
            image: '/assets/landing/hero2.png',
            title: "La Innovación no Necesita un Manual de 400 Páginas",
            subtitle: "Mientras otros te venden cursos, nosotros te vendemos eficiencia. Control total del flujo de talento sin complicaciones."
        },
        {
            image: '/assets/landing/hero3.png',
            title: "Nos podrán copiar, pero jamás igualar la Innovación",
            subtitle: "Analítica avanzada y dashboards diseñados para la toma de decisiones, no para decorar el CV de tus empleados."
        },
        {
            image: '/assets/landing/hero4.png',
            title: "El Fin de la Burocracia en RRHH",
            subtitle: "Un ecosistema disruptivo de Empresa Synoptyk diseñado para maximizar tu rentabilidad operativa hoy.",
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
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 z-40 bg-indigo-600 pt-24 px-6 md:hidden shadow-2xl"
                    >
                        <div className="flex flex-col gap-8">
                            <a href="#features" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-white uppercase tracking-widest">Funcionalidades</a>
                            <a href="#modulos" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-white uppercase tracking-widest">Módulos</a>
                            <a href="#pricing" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-white uppercase tracking-widest">Planes</a>
                            <a href="#nosotros" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-white uppercase tracking-widest">Nosotros</a>
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
            <section className="pt-32 pb-32 px-6 relative overflow-hidden bg-[#020617]">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-6">
                            <Zap size={14} className="text-indigo-400" />
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Lanzamiento Ecosistema v1.0</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] mb-8 tracking-tight">
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
                    <div className="relative h-[500px] md:h-[600px] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white/10">
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
            <section className="py-40 bg-indigo-600 relative overflow-hidden">
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
                            <h2 className="text-4xl md:text-6xl font-black text-white leading-tight mb-8 italic tracking-tighter uppercase">
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
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">La Competencia (Buk, Talana, etc)</p>
                                    <div className="h-4 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                                        <div className="h-full bg-slate-700 w-[60%]"></div>
                                    </div>
                                    <p className="text-[9px] font-medium text-slate-400 italic">"Te confunden con burocracia y certificaciones académicas."</p>
                                </div>
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest italic">Ecosistema Centraliza-T</p>
                                    <div className="h-4 bg-slate-900 rounded-full overflow-hidden border border-indigo-500/30">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: '100%' }}
                                            transition={{ duration: 1.5, delay: 0.5 }}
                                            className="h-full bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.5)]"
                                        ></motion.div>
                                    </div>
                                    <p className="text-[9px] font-black text-indigo-400 italic uppercase">"Hacemos lo difícil. Resultados reales sin manuales."</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features section moved down - DARK SLATE */}
            <section id="features" className="py-40 bg-[#0f172a] relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <p className="text-xs font-black text-indigo-400 uppercase tracking-[0.4em] mb-4">¿Por qué Centraliza-t?</p>
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">Diseñado para la Excelencia Operativa</h2>
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
            <section id="modulos" className="py-40 bg-[#020617] relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <p className="text-xs font-black text-indigo-400 uppercase tracking-[0.4em] mb-4">Ecosistema Completo</p>
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">Módulos Centraliza-T</h2>
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

            {/* Pricing Section - VIBRANT BLUE */}
            <section id="pricing" className="py-40 px-6 bg-indigo-600 relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#020617] to-transparent opacity-40"></div>
                    <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#020617] to-transparent opacity-40"></div>
                </div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-20">
                        <p className="text-xs font-black text-indigo-100 uppercase tracking-[0.4em] mb-4">Inversión Inteligente</p>
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6">Planes que se Adaptan a tu Crecimiento</h2>
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
                                </div>

                                <div className="space-y-4 mb-10">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 size={18} className="text-indigo-400 flex-shrink-0" />
                                        <span className="text-sm font-bold text-slate-300">{plan.limits.adminUsers} Usuarios Administrativos</span>
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
                                    className={`w-full py-5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${plan.isTrial ? 'bg-indigo-600 text-white hover:bg-white hover:text-indigo-600 shadow-xl shadow-indigo-500/20' : 'bg-white text-slate-950 hover:bg-indigo-600 hover:text-white'}`}
                                >
                                    Contratar Ahora
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer - ALIGNED WITH DEEPEST BACKGROUND */}
            <footer className="bg-[#020617] border-t border-white/5 py-20 px-6">
                <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-16">
                    <div className="col-span-2">
                        <div className="flex items-center gap-2 mb-8">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                                <Rocket className="text-white" size={24} />
                            </div>
                            <span className="text-xl font-black text-white tracking-tighter">CENTRALIZA-T</span>
                        </div>
                        <p className="text-slate-400 max-w-sm leading-relaxed mb-4">
                            Transformando la gestión empresarial con tecnología de vanguardia y un ecosistema diseñado para la eficiencia máxima.
                        </p>
                        <p className="text-indigo-400 text-xs font-black uppercase tracking-widest mb-8">
                            Ecosistema Centraliza-t, un desarrollo inteligente de Empresa Synoptyk.
                        </p>
                        <div className="flex gap-4">
                            {/* Social Icons Placeholders */}
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-indigo-600 transition-colors cursor-pointer">
                                    <div className="w-4 h-4 bg-slate-400 rounded-sm" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-6">
                        <p className="text-white font-black uppercase tracking-widest text-[10px]">Producto</p>
                        <a href="#" className="text-slate-400 text-sm hover:text-white transition-colors">Funcionalidades</a>
                        <a href="#" className="text-slate-400 text-sm hover:text-white transition-colors">Planes</a>
                        <a href="#" className="text-slate-400 text-sm hover:text-white transition-colors">Seguridad</a>
                    </div>

                    <div className="grid gap-6">
                        <p className="text-white font-black uppercase tracking-widest text-[10px]">Empresa</p>
                        <a href="#nosotros" className="text-slate-400 text-sm hover:text-white transition-colors">Sobre Nosotros</a>
                        <a href="mailto:centraliza-t@synoptyk.cl" className="text-slate-400 text-sm hover:text-white transition-colors">Contacto</a>
                        <a href="#" className="text-slate-400 text-sm hover:text-white transition-colors">Blog</a>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto pt-20 mt-20 border-t border-slate-800 flex flex-col md:flex-row justify-between gap-8">
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">© 2026 Centraliza-t. Todos los derechos reservados.</p>
                    <div className="flex gap-10">
                        <a href="#" className="text-slate-500 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">Privacidad</a>
                        <a href="#" className="text-slate-500 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">Términos</a>
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
