import React, { useState } from 'react';
import {
    LifeBuoy, Search, ChevronRight, BookOpen, Zap,
    ShieldCheck, Users, FileCheck, ClipboardList,
    UserPlus, Calendar, BrainCircuit, FileText,
    FolderOpen, LayoutDashboard, History, FilePlus,
    Activity, Settings, CreditCard, Trophy, Lightbulb, Building2, CheckCircle
} from 'lucide-react';
import PageWrapper from '../components/PageWrapper';

const HelpCenter = ({ auth, onLogout }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('manuals'); // 'manuals' | 'workflow'

    const manuals = [
        {
            category: "ECOSISTEMA CEO",
            icon: Trophy,
            items: [
                { id: 1, name: "Centro de Mando CEO", obj: "Supervisión total de la infraestructura.", functions: "Visualización de métricas críticas, gestión de salud del servidor y logs de auditoría global.", usage: "Exclusivo para CEO Centraliza-T.", icon: ShieldCheck },
                { id: 2, name: "Mando Comercial", obj: "Crecimiento y monetización.", functions: "Gestión de Leads, activación/bloqueo de empresas, control de suscripciones.", usage: "Dashboard operativo para ventas.", icon: Trophy }
            ]
        },
        {
            category: "ADMINISTRACIÓN",
            icon: Building2,
            items: [
                { id: 3, name: "Módulo de Cliente", obj: "Centralización de la operación diaria.", functions: "Vista rápida de vacantes activas, estadísticas de reclutamiento.", icon: LayoutDashboard },
                { id: 4, name: "Gestión de Proyectos", obj: "Estructuración del requerimiento.", functions: "Creación de vacantes, definición de perfiles, presupuestos.", icon: ClipboardList },
                { id: 5, name: "APROBACIONES", obj: "Control ejecutivo y financiero.", functions: "Revisión 360 y decisión final de contratación.", icon: FileCheck },
                { id: 6, name: "Capital Humano 360", obj: "Visión holística del equipo.", functions: "Perfiles detallados y monitoreo de dotación.", icon: Users },
                { id: 7, name: "Contenedor (Portal Cliente)", obj: "Transparencia absoluta.", functions: "Repositorio compartido para clientes externos.", icon: FolderOpen }
            ]
        },
        {
            category: "RECLUTAMIENTO",
            icon: UserPlus,
            items: [
                { id: 8, name: "Captura de Talento", obj: "Atracción de candidatos.", functions: "Registro con validación ID universal (RUT/DNI).", icon: UserPlus },
                { id: 9, name: "Entrevistas Filtro", obj: "Coordinación y agendamiento.", functions: "Calendario y registro de feedback temprano.", icon: Calendar },
                { id: 10, name: "Evaluación Técnica (IA)", obj: "Validación de competencias.", functions: "Tests psicotécnicos asistidos por IA.", icon: BrainCircuit },
                { id: 11, name: "Seguridad & Prevención", obj: "Acreditación y cumplimiento.", functions: "Gestión de cursos y exámenes de salud.", icon: ShieldCheck },
                { id: 12, name: "Gestión Documental", obj: "Digitalización de expedientes.", functions: "Carga y validación visual 10/10.", icon: FileText },
                { id: 13, name: "Ficha y Validación", obj: "Voto final de RRHH.", functions: "Consolidación de expediente para gerencia.", icon: UserPlus }
            ]
        },
        {
            category: "CONTRATACIONES",
            icon: FilePlus,
            items: [
                { id: 14, name: "CONTRATACIONES (IA)", obj: "Formalización automatizada.", functions: "Generación de contratos con IA y editor inteligente.", icon: FilePlus }
            ]
        },
        {
            category: "CONTROL & GESTIÓN",
            icon: Activity,
            items: [
                { id: 15, name: "Dashboard Empresa", obj: "BI para la directiva.", functions: "Gráficos de eficiencia y costos de contratación.", icon: Activity }
            ]
        },
        {
            category: "AJUSTES Y PLANES",
            icon: Settings,
            items: [
                { id: 16, name: "Ajustes del Sistema", obj: "Configuración maestra.", functions: "Gestión de roles, logos y preferencias.", icon: Settings },
                { id: 17, name: "Planes & Facturas", obj: "Gestión financiera.", functions: "Suscripciones y pagos vía Mercado Pago.", icon: CreditCard }
            ]
        }
    ];

    const workflowSteps = [
        { title: "1. Captura", desc: "Registro integral de candidatos.", icon: UserPlus },
        { title: "2. Filtro", desc: "Entrevistas y evaluación técnica.", icon: BrainCircuit },
        { title: "3. Compliance", desc: "Seguridad y acreditación documental.", icon: ShieldCheck },
        { title: "4. Validación", desc: "RRHH consolida la ficha final.", icon: CheckCircle },
        { title: "5. Aprobación", desc: "Gerencia da el OK en APROBACIONES.", icon: FileCheck },
        { title: "6. Contrato", desc: "IA genera el contrato legal.", icon: FilePlus },
        { title: "7. Gestión", desc: "Monitoreo 360 del colaborador.", icon: Activity },
    ];

    const filteredManuals = manuals.map(cat => ({
        ...cat,
        items: cat.items.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.obj.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.functions.toLowerCase().includes(searchTerm.toLowerCase())
        )
    })).filter(cat => cat.items.length > 0);

    return (
        <PageWrapper
            title="CENTRO DE AYUDA"
            subtitle="Manuales Maestros y Flujos Operativos Centraliza-T"
            icon={LifeBuoy}
            auth={auth}
            onLogout={onLogout}
        >
            <div className="space-y-8">
                {/* Search & Tabs */}
                <div className="bg-white p-6 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/20 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full md:w-auto">
                        <button
                            onClick={() => setActiveTab('manuals')}
                            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'manuals' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Manuales
                        </button>
                        <button
                            onClick={() => setActiveTab('workflow')}
                            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'workflow' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Flujo Operativo
                        </button>
                    </div>

                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar función o módulo..."
                            className="w-full bg-slate-50 border border-slate-100 py-3.5 pl-12 pr-4 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {activeTab === 'manuals' ? (
                    <div className="space-y-12">
                        {filteredManuals.map((cat, i) => (
                            <div key={i} className="space-y-6">
                                <div className="flex items-center gap-3 ml-4">
                                    <div className="p-2 bg-indigo-600 rounded-lg text-white">
                                        <cat.icon size={16} />
                                    </div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">{cat.category}</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {cat.items.map((item, j) => (
                                        <div key={j} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all group">
                                            <div className="flex items-start justify-between mb-6">
                                                <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                                                    <item.icon size={20} />
                                                </div>
                                                <span className="text-[9px] font-black text-slate-300 uppercase">Module {item.id}</span>
                                            </div>
                                            <h4 className="text-lg font-black text-slate-900 uppercase mb-2 group-hover:text-indigo-600 transition-colors">{item.name}</h4>
                                            <p className="text-xs font-bold text-slate-500 mb-4 leading-relaxed">{item.obj}</p>
                                            <div className="space-y-3 pt-4 border-t border-slate-50">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Funciones</span>
                                                    <p className="text-[11px] font-bold text-slate-600">{item.functions}</p>
                                                </div>
                                                {item.usage && (
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Uso</span>
                                                        <p className="text-[11px] font-bold text-slate-600">{item.usage}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-20 opacity-5">
                            <Zap size={200} />
                        </div>
                        <div className="max-w-4xl mx-auto space-y-12 relative z-10">
                            <div className="text-center space-y-2">
                                <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">Ciclo de Vida del Talento</h3>
                                <p className="text-sm font-bold text-slate-400 uppercase">Flujo Maestro End-to-End</p>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {workflowSteps.map((step, k) => (
                                    <div key={k} className="flex items-center gap-8 group">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-16 h-16 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center group-hover:bg-indigo-600 transition-all group-hover:scale-110 shadow-xl shadow-slate-200">
                                                <step.icon size={28} />
                                            </div>
                                            {k < workflowSteps.length - 1 && (
                                                <div className="w-1 h-12 bg-slate-100 rounded-full"></div>
                                            )}
                                        </div>
                                        <div className="bg-slate-50 p-6 rounded-3xl flex-1 border border-transparent group-hover:border-indigo-100 group-hover:bg-white transition-all shadow-sm">
                                            <h5 className="font-black text-slate-900 uppercase tracking-tight mb-1">{step.title}</h5>
                                            <p className="text-xs font-medium text-slate-500">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-20 p-8 bg-indigo-900 text-white rounded-[3rem] shadow-2xl shadow-indigo-200">
                                <div className="flex items-center gap-4 mb-4">
                                    <Lightbulb className="text-amber-400" />
                                    <h5 className="text-sm font-black uppercase tracking-widest">Tip Estratégico</h5>
                                </div>
                                <p className="text-xs font-medium leading-relaxed opacity-80">
                                    El flujo de Centraliza-T está diseñado para eliminar la fricción operativa. Cada paso alimenta de datos al siguiente, asegurando que cuando llegues a la etapa de CONTRATACIONES, toda la información legal ya esté validada y lista para la IA.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </PageWrapper>
    );
};

export default HelpCenter;
