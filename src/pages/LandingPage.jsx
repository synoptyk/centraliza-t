import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight,
    CheckCircle2,
    Users,
    Rocket,
    ShieldCheck,
    Building2,
    ArrowRight,
    LayoutDashboard,
    Zap,
    Briefcase
} from 'lucide-react';
import api from '../utils/api';
import Navbar from '../components/Navbar';

const LandingPage = ({ auth }) => {
    const navigate = useNavigate();
    const [plans, setPlans] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const slides = [
        {
            image: '/assets/landing/hero1.png',
            title: "Impulsa tu Operación con el Ecosistema Digital más Potente de Chile",
            subtitle: "Gestión centralizada de capital humano, proyectos y procesos de contratación en una sola plataforma premium."
        },
        {
            image: '/assets/landing/hero2.png',
            title: "Control Total y Escalabilidad para tu Empresa",
            subtitle: "Optimiza tus tiempos de respuesta y mejora la eficiencia de tu equipo con herramientas de vanguardia."
        },
        {
            image: '/assets/landing/hero3.png',
            title: "Toma Decisiones Basadas en Datos Reales",
            subtitle: "Paneles inteligentes y analítica avanzada para llevar tu gestión comercial al siguiente nivel."
        },
        {
            image: '/assets/landing/hero4.png',
            title: "Ecosistema Centraliza-t",
            subtitle: "Un desarrollo inteligente de Empresa Synoptyk para la nueva era de la gestión empresarial.",
            special: true
        }
    ];

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const { data } = await api.get('/subscriptions/plans');
                // Filtrar solo planes públicos
                setPlans(data.filter(p => p.isPublic));
            } catch (error) {
                console.error("Error al cargar planes:", error);
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
            title: "Gestión de Talento",
            desc: "Control absoluto del ciclo de vida del colaborador, desde el ingreso hasta la contratación final."
        },
        {
            icon: LayoutDashboard,
            title: "Paneles de Control",
            desc: "Visualiza el estado de tus proyectos y postulantes en tiempo real con interfaces intuitivas."
        },
        {
            icon: ShieldCheck,
            title: "Blindaje Operativo",
            desc: "Seguridad multi-empresa y cumplimiento de normativas garantizado en cada proceso."
        },
        {
            icon: Zap,
            title: "Automatización",
            desc: "Reduce la carga administrativa automatizando flujos de aprobación y notificaciones."
        }
    ];

    return (
        <div className="bg-white min-h-screen font-sans selection:bg-indigo-100 selection:text-indigo-900">
            <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} auth={auth} />

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 z-40 bg-white pt-24 px-6 md:hidden"
                    >
                        <div className="flex flex-col gap-8">
                            <a href="#features" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-slate-900 uppercase tracking-widest">Funcionalidades</a>
                            <a href="#pricing" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-slate-900 uppercase tracking-widest">Planes</a>
                            <a href="#nosotros" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-slate-900 uppercase tracking-widest">Nosotros</a>
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

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6 relative overflow-hidden">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full mb-6">
                            <Zap size={14} className="text-indigo-600" />
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Lanzamiento Ecosistema v5.0</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] mb-8 tracking-tight">
                            {slides[currentSlide].title}
                        </h1>
                        <p className="text-lg text-slate-500 leading-relaxed mb-10 max-w-xl">
                            {slides[currentSlide].subtitle}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-5">
                            <button
                                onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}
                                className="bg-indigo-600 text-white px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-2xl shadow-indigo-200 flex items-center justify-center gap-3 group"
                            >
                                Ver Planes
                                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={() => window.location.href = 'mailto:centraliza-t@synoptyk.cl?subject=Solicitud de Demo - Centraliza-t&body=Hola, me gustaría solicitar una demostración personalizada del ecosistema Centraliza-t.'}
                                className="bg-white border-2 border-slate-100 text-slate-900 px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-widest hover:border-indigo-600 transition-all flex items-center justify-center gap-3"
                            >
                                Solicitar Demo
                            </button>
                        </div>
                    </motion.div>

                    {/* Image Carousel */}
                    <div className="relative h-[500px] md:h-[600px] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white">
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
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />

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

            {/* Features section */}
            <section id="features" className="py-32 bg-slate-50/50 relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <p className="text-xs font-black text-indigo-600 uppercase tracking-[0.4em] mb-4">¿Por qué Centraliza-t?</p>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Diseñado para la Excelencia Operativa</h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((f, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -10 }}
                                className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group"
                            >
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-500">
                                    <f.icon size={30} />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-4">{f.title}</h3>
                                <p className="text-slate-500 leading-relaxed text-sm">{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <p className="text-xs font-black text-indigo-600 uppercase tracking-[0.4em] mb-4">Inversión Inteligente</p>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">Planes que se Adaptan a tu Crecimiento</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto">Selecciona la solución que mejor se adapte a las necesidades de tu empresa. Todos nuestros planes incluyen soporte técnico prioritario.</p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-10">
                        {plans.map((plan, i) => (
                            <div
                                key={i}
                                className={`relative bg-white rounded-[3rem] p-12 border-2 transition-all hover:scale-[1.02] duration-500 ${plan.isTrial ? 'border-indigo-600/20 bg-indigo-50/20' : 'border-slate-100'}`}
                            >
                                {plan.isTrial && (
                                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-200">
                                        Más Popular
                                    </div>
                                )}
                                <div className="mb-10">
                                    <h4 className="text-2xl font-black text-slate-900 mb-2">{plan.name}</h4>
                                    <p className="text-slate-500 text-sm leading-relaxed mb-8 h-12 overflow-hidden">{plan.description}</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-black text-slate-900 tracking-tighter">UF {plan.priceUF}</span>
                                        <span className="text-slate-400 font-bold text-sm">/mes</span>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-10">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                                        <span className="text-sm font-bold text-slate-600">{plan.limits.adminUsers} Usuarios Administrativos</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                                        <span className="text-sm font-bold text-slate-600">Hasta {plan.limits.monthlyApplicants} Postulantes/Mes</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                                        <span className="text-sm font-bold text-slate-600">{plan.limits.projects} Proyectos Activos</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                                        <span className="text-sm font-bold text-slate-600">{plan.limits.storageGB} GB Almacenamiento</span>
                                    </div>
                                    {plan.features.map((feature, fIndex) => (
                                        <div key={fIndex} className="flex items-center gap-3">
                                            <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                                            <span className="text-sm font-bold text-slate-600">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => navigate('/login')}
                                    className={`w-full py-5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${plan.isTrial ? 'bg-indigo-600 text-white hover:bg-slate-900 shadow-xl shadow-indigo-200' : 'bg-slate-900 text-white hover:bg-indigo-600'}`}
                                >
                                    Contratar Ahora
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 py-20 px-6">
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
        </div>
    );
};

export default LandingPage;
