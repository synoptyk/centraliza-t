import React, { useState, useEffect } from 'react';
import {
    Users,
    FileCheck,
    Clock,
    TrendingUp,
    Briefcase,
    Loader2,
    ChevronRight,
    Bell,
    Zap,
    Target,
    Activity
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line
} from 'recharts';
import api from '../utils/api';
import toast from 'react-hot-toast';
import PageWrapper from '../components/PageWrapper';

const Dashboard = ({ onOpenCENTRALIZAT, auth, onLogout }) => {
    const [statsData, setStatsData] = useState(null);
    const [loading, setLoading] = useState(true);

    const effectiveServiceMode = statsData?.serviceMode || auth?.company?.serviceMode || 'FULL_HR_360';

    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                const { data } = await api.get('/dashboard/stats');
                setStatsData(data);
                setLoading(false);
            } catch (error) {
                toast.error('Error al sincronizar dashboard');
                setLoading(false);
            }
        };
        fetchDashboardStats();
    }, []);

    if (loading || !statsData) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Activity size={20} className="text-indigo-600" />
                    </div>
                </div>
                <p className="text-sm font-bold text-slate-600 tracking-wide animate-pulse">Sincronizando Inteligencia...</p>
            </div>
        );
    }

    // Adapt Stats based on Mode
    let cards = [];
    if (effectiveServiceMode === 'RECRUITMENT_ONLY' && statsData.agency) {
        cards = [
            {
                label: 'Proyectos Activos',
                value: statsData.general.activeProjects,
                icon: Briefcase,
                color: 'text-indigo-600',
                bg: 'bg-indigo-50',
                border: 'border-indigo-200',
                trend: '+12%',
                trendUp: true
            },
            {
                label: 'Pipeline Total',
                value: statsData.general.totalApplicants,
                icon: Users,
                color: 'text-violet-600',
                bg: 'bg-violet-50',
                border: 'border-violet-200',
                trend: '+8%',
                trendUp: true
            },
            {
                label: 'Contratados (Mes)',
                value: statsData.agency.recruitedThisMonth,
                icon: FileCheck,
                color: 'text-emerald-600',
                bg: 'bg-emerald-50',
                border: 'border-emerald-200',
                trend: '+24%',
                trendUp: true
            },
            {
                label: 'Eficiencia Promedio',
                value: `${Math.round((statsData.agency.projectEffectiveness || []).reduce((a, b) => a + b.percent, 0) / (statsData.agency.projectEffectiveness?.length || 1))}%`,
                icon: Target,
                color: 'text-amber-600',
                bg: 'bg-amber-50',
                border: 'border-amber-200',
                trend: '+5%',
                trendUp: true
            },
        ];
    } else if (effectiveServiceMode === 'CEO_GLOBAL') {
        cards = [
            {
                label: 'Empresas Activas',
                value: statsData.general.totalCompanies,
                icon: Building2,
                color: 'text-blue-600',
                bg: 'bg-blue-50',
                border: 'border-blue-200',
                trend: 'Sistema',
                trendUp: true
            },
            {
                label: 'Candidatos Totales',
                value: statsData.general.totalApplicants,
                icon: Users,
                color: 'text-indigo-600',
                bg: 'bg-indigo-50',
                border: 'border-indigo-200',
                trend: 'Global',
                trendUp: true
            },
            {
                label: 'Proyectos Globales',
                value: statsData.general.totalProjects,
                icon: Target,
                color: 'text-emerald-600',
                bg: 'bg-emerald-50',
                border: 'border-emerald-200',
                trend: 'Activos',
                trendUp: true
            },
            {
                label: 'Estado Sistema',
                value: 'Online',
                icon: Activity,
                color: 'text-rose-600',
                bg: 'bg-rose-50',
                border: 'border-rose-200',
                trend: 'v5.0',
                trendUp: true
            }
        ];
    } else if (statsData.integral) {
        cards = [
            {
                label: 'Dotación Activa',
                value: statsData.integral.totalEmployees,
                icon: Users,
                color: 'text-indigo-600',
                bg: 'bg-indigo-50',
                border: 'border-indigo-200',
                trend: 'Estable',
                trendUp: true
            },
            {
                label: 'Vacaciones Pendientes',
                value: statsData.integral.pendingVacations,
                icon: Clock,
                color: 'text-amber-600',
                bg: 'bg-amber-50',
                border: 'border-amber-200',
                trend: statsData.integral.pendingVacations > 5 ? 'Atención' : 'Normal',
                trendUp: statsData.integral.pendingVacations <= 5
            },
            {
                label: 'Alertas Contrato',
                value: statsData.integral.expiringContracts,
                icon: Bell,
                color: 'text-rose-600',
                bg: 'bg-rose-50',
                border: 'border-rose-200',
                trend: 'Próx. 15 días',
                trendUp: statsData.integral.expiringContracts === 0
            },
            {
                label: 'Altas del Mes',
                value: statsData.integral.recentHires,
                icon: TrendingUp,
                color: 'text-emerald-600',
                bg: 'bg-emerald-50',
                border: 'border-emerald-200',
                trend: 'Nuevos',
                trendUp: true
            },
        ];
    }

    const pipelineData = effectiveServiceMode === 'RECRUITMENT_ONLY' && statsData.agency
        ? Object.entries(statsData.agency.pipeline || {}).map(([name, value]) => ({
            name,
            value,
            color: name === 'Contratado' ? '#10B981' : name === 'Rechazado' ? '#EF4444' : '#6366F1'
        })).filter(d => d.value > 0).slice(0, 5)
        : effectiveServiceMode === 'CEO_GLOBAL'
            ? [
                { name: 'Empresas', value: statsData.general.totalCompanies, color: '#10B981' },
                { name: 'Candidatos', value: statsData.general.totalApplicants, color: '#6366F1' },
                { name: 'Proyectos', value: statsData.general.totalProjects, color: '#F59E0B' }
            ]
            : statsData.integral
                ? [
                    { name: 'Activos', value: statsData.integral.totalEmployees, color: '#10B981' },
                    { name: 'En Proceso', value: (statsData.general.totalApplicants || 0) - (statsData.integral.totalEmployees || 0), color: '#6366F1' }
                ]
                : [];

    return (
        <PageWrapper
            className="space-y-8 pb-20"
            title={effectiveServiceMode === 'RECRUITMENT_ONLY' ? "CONTROL DE RECLUTAMIENTO" : effectiveServiceMode === 'CEO_GLOBAL' ? "CENTRO DE COMANDO GLOBAL" : "CENTRO DE GESTIÓN INTEGRAL"}
            subtitle={effectiveServiceMode === 'RECRUITMENT_ONLY'
                ? "Monitoreo estratégico del pipeline y efectividad de selección"
                : effectiveServiceMode === 'CEO_GLOBAL'
                    ? "Resumen táctico de todas las operaciones del ecosistema"
                    : "Visibilidad 360° de capital humano, contratos y bienestar"}
            icon={Activity}
            auth={auth}
            onLogout={onLogout}
            headerActions={
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${effectiveServiceMode === 'RECRUITMENT_ONLY' ? 'border-purple-200 text-purple-600 bg-purple-50' : effectiveServiceMode === 'CEO_GLOBAL' ? 'border-blue-200 text-blue-600 bg-blue-50' : 'border-emerald-200 text-emerald-600 bg-emerald-50'
                        }`}>
                        Modo {effectiveServiceMode === 'RECRUITMENT_ONLY' ? 'Agencia' : effectiveServiceMode === 'CEO_GLOBAL' ? 'CEO Global' : 'Integral'}
                    </span>
                </div>
            }
        >

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((stat, idx) => (
                    <div key={idx} className={`bg-white p-7 rounded-3xl border-2 ${stat.border} shadow-lg hover:shadow-xl transition-all group overflow-hidden relative`}>
                        <div className={`absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform ${stat.color}`}>
                            <stat.icon size={120} />
                        </div>
                        <div className="relative z-10 flex flex-col gap-4">
                            <div className="flex items-start justify-between">
                                <div className={`${stat.bg} w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm`}>
                                    <stat.icon className={stat.color} size={26} />
                                </div>
                                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ${stat.trendUp ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                    {stat.trend}
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
                                <p className="text-4xl font-black text-slate-900 tracking-tight tabular-nums">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Main Progress Chart */}
                <div className="xl:col-span-2 bg-white p-10 rounded-3xl border-2 border-slate-100 shadow-lg">
                    {effectiveServiceMode === 'RECRUITMENT_ONLY' && statsData.agency ? (
                        <>
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-3">
                                        <Zap size={28} className="text-indigo-600" />
                                        Efectividad <span className="text-indigo-600">Proyectos</span>
                                    </h3>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-2">Cumplimiento de vacantes actuales</p>
                                </div>
                            </div>
                            <div className="h-[380px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={statsData.agency.projectEffectiveness}>
                                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#F1F5F9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }} />
                                        <RechartsTooltip />
                                        <Bar dataKey="target" fill="#F1F5F9" radius={[10, 10, 10, 10]} barSize={40} />
                                        <Bar dataKey="hired" fill="#4F46E5" radius={[10, 10, 10, 10]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-3">
                                        <Activity size={28} className="text-emerald-600" />
                                        Estado de <span className="text-emerald-600">Dotación</span>
                                    </h3>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-2">Resumen de altas y movimientos</p>
                                </div>
                            </div>
                            <div className="h-[380px] flex items-center justify-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                <div className="text-center p-10">
                                    <TrendingUp size={48} className="text-slate-200 mx-auto mb-4" />
                                    <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Gráfico de Crecimiento de Dotación</p>
                                    <p className="text-slate-300 text-xs mt-2 uppercase">Próximamente Analytics Pro</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Right Pipeline */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-8 rounded-3xl border-2 border-slate-200 shadow-lg">
                    <h3 className="text-lg font-black tracking-tight uppercase mb-6 flex items-center gap-2 text-slate-900">
                        <Target size={20} className="text-indigo-600" />
                        Status <span className="text-indigo-600">Actual</span>
                    </h3>
                    <div className="h-[250px] relative mb-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pipelineData}
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={10}
                                    dataKey="value"
                                    stroke="white"
                                    strokeWidth={4}
                                >
                                    {pipelineData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-4xl font-black text-slate-900">
                                {effectiveServiceMode === 'RECRUITMENT_ONLY' ? statsData.general.totalApplicants :
                                    effectiveServiceMode === 'CEO_GLOBAL' ? statsData.general.totalCompanies :
                                        statsData.integral?.totalEmployees || 0}
                            </span>
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                                {effectiveServiceMode === 'RECRUITMENT_ONLY' ? 'Talento' :
                                    effectiveServiceMode === 'CEO_GLOBAL' ? 'Empresas' : 'Activos'}
                            </span>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {pipelineData.map((item, idx) => (
                            <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 flex justify-between items-center shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{item.name}</span>
                                </div>
                                <span className="text-xl font-black text-slate-900 tabular-nums">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};

export default Dashboard;
