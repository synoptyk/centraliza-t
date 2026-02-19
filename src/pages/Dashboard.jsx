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
    const [data, setData] = useState({
        projects: [],
        applicants: [],
        loading: true
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [projectsRes, applicantsRes] = await Promise.all([
                    api.get('/projects'),
                    api.get('/applicants')
                ]);
                setData({
                    projects: projectsRes.data,
                    applicants: applicantsRes.data,
                    loading: false
                });
            } catch (error) {
                toast.error('Error al cargar datos del dashboard');
                setData(prev => ({ ...prev, loading: false }));
            }
        };
        fetchData();
    }, []);

    if (data.loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Activity size={20} className="text-indigo-600" />
                    </div>
                </div>
                <p className="text-sm font-bold text-slate-600 tracking-wide animate-pulse">Sincronizando Ecosistema...</p>
            </div>
        );
    }

    // Calculations
    const activeProjects = data.projects.length;
    const totalApplicants = data.applicants.length;
    const pendingContract = data.applicants.filter(a => a.status === 'Pendiente Aprobación Gerencia' || a.status === 'Aprobado para Contratación').length;

    const now = new Date();
    const hiredThisMonth = data.applicants.filter(a =>
        a.status === 'Contratado' &&
        new Date(a.updatedAt).getMonth() === now.getMonth() &&
        new Date(a.updatedAt).getFullYear() === now.getFullYear()
    ).length;

    const stats = [
        {
            label: 'Proyectos Activos',
            value: activeProjects,
            icon: Briefcase,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
            border: 'border-indigo-200',
            trend: '+12%',
            trendUp: true
        },
        {
            label: 'Talento en Pipeline',
            value: totalApplicants,
            icon: Users,
            color: 'text-violet-600',
            bg: 'bg-violet-50',
            border: 'border-violet-200',
            trend: '+8%',
            trendUp: true
        },
        {
            label: 'Aprobación Pendiente',
            value: pendingContract,
            icon: Clock,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            trend: '-3%',
            trendUp: false
        },
        {
            label: 'Contratados (Mes)',
            value: hiredThisMonth,
            icon: FileCheck,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            border: 'border-emerald-200',
            trend: '+24%',
            trendUp: true
        },
    ];

    const chartData = data.projects.slice(0, 6).map(project => {
        const projectApplicants = data.applicants.filter(a => a.projectId === project._id);
        const hiredCount = projectApplicants.filter(a => a.status === 'Contratado').length;
        const totalRequired = (project.hrRequirement || 0) + (project.logisticsRequirement || 0) + (project.preventionRequirement || 0) + (project.generalServicesRequirement || 0);
        return {
            name: (project.projectName || 'Sin Nombre').split(' ')[0].substring(0, 10),
            fullName: project.projectName,
            req: totalRequired || 1,
            hired: hiredCount,
            completion: Math.round((hiredCount / (totalRequired || 1)) * 100)
        };
    });

    const statusCounts = data.applicants.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
    }, {});

    const statusData = [
        { name: 'Postulando', value: statusCounts['Postulando'] || 0, color: '#64748B' },
        { name: 'Evaluación', value: (statusCounts['En Entrevista'] || 0) + (statusCounts['En Test'] || 0), color: '#8B5CF6' },
        { name: 'Documentación', value: (statusCounts['Carga Documental'] || 0) + (statusCounts['Acreditación'] || 0), color: '#3B82F6' },
        { name: 'Aprobación', value: statusCounts['Pendiente Aprobación Gerencia'] || 0, color: '#F59E0B' },
        { name: 'Contratado', value: statusCounts['Contratado'] || 0, color: '#10B981' },
    ].filter(s => s.value > 0);

    const recentApplicants = [...data.applicants]
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 6);

    return (
        <PageWrapper
            className="space-y-8 pb-20"
            title="CENTRO DE COMANDO EJECUTIVO"
            subtitle="Monitoreo integral y gestión estratégica del talento operativo"
            icon={Target}
            auth={auth}
            onLogout={onLogout}
            headerActions={
                <div className="flex items-center gap-3">
                    <div className="hidden md:flex bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-xl border border-white/20 items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">Online</span>
                    </div>
                    <button className="bg-white/10 backdrop-blur-sm hover:bg-white/20 px-3 py-1.5 rounded-xl border border-white/20 transition-all flex items-center gap-2 text-xs font-bold text-white">
                        <Bell size={14} />
                        <span className="hidden sm:inline">3</span>
                    </button>
                </div>
            }
        >

            {/* Stats Grid - Enhanced */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className={`bg-white p-7 rounded-3xl border-2 ${stat.border} shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all group overflow-hidden relative`}>
                        <div className={`absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform ${stat.color}`}>
                            <stat.icon size={120} />
                        </div>
                        <div className="relative z-10 flex flex-col gap-4">
                            <div className="flex items-start justify-between">
                                <div className={`${stat.bg} w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm`}>
                                    <stat.icon className={stat.color} size={26} />
                                </div>
                                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${stat.trendUp ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                    <TrendingUp size={12} className={stat.trendUp ? '' : 'rotate-180'} />
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
                {/* Main Progress Chart - Enhanced */}
                <div className="xl:col-span-2 bg-white p-10 rounded-3xl border-2 border-slate-100 shadow-lg">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-3">
                                <Zap size={28} className="text-indigo-600" />
                                Efectividad <span className="text-indigo-600">Operativa</span>
                            </h3>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-2">Cumplimiento de dotación meta por proyecto</p>
                        </div>
                        <div className="flex items-center gap-6 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-slate-100 rounded border-2 border-slate-300"></div>
                                Meta
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-indigo-600 rounded shadow-sm"></div>
                                Logrado
                            </div>
                        </div>
                    </div>
                    <div className="h-[380px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#F1F5F9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 700 }}
                                    dy={12}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 700 }}
                                />
                                <RechartsTooltip
                                    cursor={{ fill: 'rgba(79, 70, 229, 0.04)' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <div className="bg-white border-2 border-slate-200 text-slate-900 p-5 rounded-2xl shadow-xl">
                                                    <p className="text-xs font-bold uppercase text-indigo-600 mb-3">{data.fullName}</p>
                                                    <div className="space-y-2">
                                                        <p className="text-sm font-semibold text-slate-600">Meta: <span className="text-slate-900 font-bold">{data.req}</span> personas</p>
                                                        <p className="text-sm font-semibold text-emerald-600">Logrado: <span className="font-bold">{data.hired}</span> ({data.completion}%)</p>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar dataKey="req" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth={2} radius={[10, 10, 10, 10]} barSize={36} />
                                <Bar dataKey="hired" fill="#4F46E5" radius={[10, 10, 10, 10]} barSize={36} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right Sidebar: Status & Recent - Enhanced */}
                <div className="space-y-6">
                    {/* Status Breakdown - Lighter */}
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-8 rounded-3xl border-2 border-slate-200 shadow-lg">
                        <h3 className="text-lg font-black tracking-tight uppercase mb-6 flex items-center gap-2 text-slate-900">
                            <Activity size={20} className="text-indigo-600" />
                            Pipeline <span className="text-indigo-600">Global</span>
                        </h3>
                        <div className="h-[200px] relative mb-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        innerRadius={60}
                                        outerRadius={85}
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="white"
                                        strokeWidth={3}
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-4xl font-black text-slate-900">{totalApplicants}</span>
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Total</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {statusData.map((item, idx) => (
                                <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 transition-all hover:shadow-md">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wide">{item.name}</span>
                                    </div>
                                    <span className="text-xl font-black text-slate-900">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Activity Feed - Enhanced */}
                    <div className="bg-white p-8 rounded-3xl border-2 border-slate-100 shadow-lg">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-6 flex items-center justify-between">
                            Actividad Reciente
                            <TrendingUp size={18} className="text-indigo-600" />
                        </h3>
                        <div className="space-y-3">
                            {recentApplicants.map((app, i) => (
                                <button
                                    key={app._id}
                                    onClick={() => onOpenCENTRALIZAT(app)}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all text-left border border-transparent hover:border-slate-200 group"
                                >
                                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center text-sm font-black shrink-0 transition-all group-hover:scale-105 shadow-md">
                                        {app.fullName.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-slate-900 truncate mb-0.5">{app.fullName}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-tight">{app.status}</span>
                                            <span className="text-[9px] text-slate-400 font-medium">• {new Date(app.updatedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-600 transition-all" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};

export default Dashboard;
