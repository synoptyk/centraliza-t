import React, { useState, useEffect, useMemo } from 'react';
import {
    Activity,
    Users,
    ClipboardList,
    TrendingUp,
    MessageSquare,
    Search,
    ChevronDown,
    Building2,
    Calendar,
    Send,
    User,
    ArrowRight,
    Loader2,
    CheckCircle2,
    Clock,
    AlertCircle,
    BarChart3,
    PieChart as PieIcon,
    ArrowUpRight,
    Target,
    Zap
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie,
    AreaChart,
    Area
} from 'recharts';
import api from '../utils/api';
import toast from 'react-hot-toast';
import PageWrapper from '../components/PageWrapper';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardEmpresa = ({ auth, onLogout }) => {
    const [loading, setLoading] = useState(true);
    const [applicants, setApplicants] = useState([]);
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState('all');
    const [activeTab, setActiveTab] = useState('applicants');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [drillDown, setDrillDown] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [projRes, appRes] = await Promise.all([
                api.get('/projects'),
                api.get('/applicants')
            ]);
            setProjects(projRes.data);
            setApplicants(appRes.data);
        } catch (error) {
            toast.error('Error al cargar datos de supervisión');
        } finally {
            setLoading(false);
        }
    };

    // Advanced Stats Calculation
    const stats = useMemo(() => {
        let filteredApps = applicants;
        let filteredProjs = projects;

        if (selectedProjectId !== 'all') {
            filteredApps = applicants.filter(a => a.projectId === selectedProjectId);
            filteredProjs = projects.filter(p => p._id === selectedProjectId);
        }

        const hired = filteredApps.filter(a => a.status === 'Contratado').length;
        const required = filteredProjs.reduce((acc, p) => acc + p.requirements.reduce((rAcc, r) => rAcc + r.quantity, 0), 0);
        const pendingApprovals = filteredApps.filter(a => a.status === 'Pendiente Aprobación Gerencia' || a.hiring?.managerApproval === 'Pendiente').length;
        const approvedTotal = filteredApps.filter(a => a.status === 'Contratado' || a.hiring?.managerApproval === 'Aprobado').length;

        // Projection logic
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentHired = filteredApps.filter(a => a.status === 'Contratado' && new Date(a.updatedAt) > sevenDaysAgo).length;
        const velocity = recentHired / 7; // Hired per day
        const missing = Math.max(0, required - hired);
        const daysToFinish = velocity > 0 ? Math.ceil(missing / velocity) : (missing > 0 ? Infinity : 0);

        let projectionText = 'Ritmo insuficiente';
        if (missing === 0) projectionText = 'Completado';
        else if (daysToFinish !== Infinity) projectionText = `~${daysToFinish} días para completar`;

        return {
            totalApplicants: filteredApps.length,
            hired,
            required,
            hiringPercentage: required > 0 ? Math.round((hired / required) * 100) : 0,
            pendingApprovals,
            approvedTotal,
            projection: projectionText,
            funnelData: [
                { name: 'Postulantes', value: filteredApps.length, color: '#6366f1' },
                { name: 'Entrevista', value: filteredApps.filter(a => a.status === 'En Entrevista').length, color: '#a855f7' },
                { name: 'Aprobados', value: approvedTotal, color: '#10b981' },
                { name: 'Contratados', value: hired, color: '#0ea5e9' }
            ]
        };
    }, [applicants, projects, selectedProjectId]);

    const filteredItems = (activeTab === 'applicants' ? applicants : projects).filter(item => {
        if (selectedProjectId !== 'all' && activeTab === 'applicants') {
            if (item.projectId !== selectedProjectId) return false;
        }
        const name = activeTab === 'applicants' ? item.fullName : item.name;
        return name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <PageWrapper
            title="CENTRO DE INTELIGENCIA ESTRATÉGICA"
            auth={auth}
            onLogout={onLogout}
        >
            <div className="max-w-[1600px] mx-auto space-y-10 pb-20">

                {/* Global Filters */}
                <div className="flex flex-col md:flex-row gap-6 items-end justify-between bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-900/5">
                    <div className="space-y-4 w-full md:w-auto">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
                            <Building2 size={12} className="text-indigo-600" />
                            Selección de Proyecto
                        </label>
                        <div className="relative group">
                            <select
                                value={selectedProjectId}
                                onChange={(e) => setSelectedProjectId(e.target.value)}
                                className="appearance-none w-full md:w-[400px] bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-xs font-bold outline-none focus:border-indigo-600 transition-all cursor-pointer"
                            >
                                <option value="all">TODOS LOS PROYECTOS ACTIVOS</option>
                                {projects.map(p => <option key={p._id} value={p._id}>{p.name.toUpperCase()}</option>)}
                            </select>
                            <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado Proyección</p>
                            <div className="flex items-center gap-2 text-indigo-600 font-black italic text-lg tracking-tighter">
                                <Zap size={16} />
                                {stats.projection}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Spectacular Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard
                        title="Postulantes"
                        mainValue={stats.totalApplicants}
                        subValue="Candidatos en flujo"
                        icon={Users}
                        color="indigo"
                        onClick={() => setDrillDown('applicants')}
                    />
                    <MetricCard
                        title="Fuerza de Trabajo"
                        mainValue={`${stats.hiringPercentage}%`}
                        subValue={`${stats.hired} de ${stats.required} vacantes`}
                        icon={Target}
                        color="emerald"
                        progress={stats.hiringPercentage}
                        onClick={() => setDrillDown('hiring')}
                    />
                    <MetricCard
                        title="Aprobaciones Gerencia"
                        mainValue={stats.pendingApprovals}
                        subValue={`Vs ${stats.approvedTotal} aprobadas`}
                        icon={Activity}
                        color="amber"
                        badge={stats.pendingApprovals > 0 ? 'Acción Requerida' : null}
                        onClick={() => setDrillDown('approvals')}
                    />
                    <MetricCard
                        title="Capacidad Operativa"
                        mainValue={`${projects.filter(p => p.status === 'Abierto').length}`}
                        subValue="Proyectos en reclutamiento"
                        icon={TrendingUp}
                        color="purple"
                        onClick={() => setDrillDown('projects')}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Graphics Column */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-xl shadow-slate-900/5">
                            <div className="flex items-center justify-between mb-12">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">Embudo de Reclutamiento</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Conversión en tiempo real</p>
                                </div>
                                <BarChart3 size={24} className="text-indigo-100" />
                            </div>
                            <div className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.funnelData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 800 }}
                                            cursor={{ fill: '#f8fafc' }}
                                        />
                                        <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={60}>
                                            {stats.funnelData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Node Navigator System */}
                        <div className="bg-white rounded-[4rem] shadow-xl shadow-slate-900/5 border border-slate-100 overflow-hidden min-h-[600px] flex flex-col md:flex-row">
                            {/* Left Panel: List */}
                            <div className="w-full md:w-1/3 border-r border-slate-100 flex flex-col bg-slate-50/30">
                                <div className="p-8 space-y-6">
                                    <div className="flex gap-4 p-1.5 bg-white border border-slate-200 rounded-2xl">
                                        <button
                                            onClick={() => { setActiveTab('applicants'); setSelectedItem(null); }}
                                            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'applicants' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:text-slate-600'}`}
                                        >
                                            Candidatos
                                        </button>
                                        <button
                                            onClick={() => { setActiveTab('projects'); setSelectedItem(null); }}
                                            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'projects' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:text-slate-600'}`}
                                        >
                                            Proyectos
                                        </button>
                                    </div>

                                    <div className="relative group">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={16} />
                                        <input
                                            type="text"
                                            placeholder="Buscar..."
                                            className="w-full py-4 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl text-[10px] outline-none focus:border-indigo-600 transition-all font-bold uppercase tracking-widest"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-2 max-h-[600px]">
                                    {filteredItems.map(item => (
                                        <button
                                            key={item._id}
                                            onClick={() => setSelectedItem(item)}
                                            className={`w-full p-6 rounded-3xl text-left transition-all border group ${selectedItem?._id === item._id ? 'bg-white border-indigo-200 shadow-xl shadow-indigo-900/5' : 'bg-transparent border-transparent hover:bg-white/60'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${selectedItem?._id === item._id ? 'bg-indigo-600 text-white scale-110' : 'bg-indigo-100 text-indigo-600 group-hover:scale-110'}`}>
                                                    {activeTab === 'applicants' ? <User size={20} /> : <ClipboardList size={20} />}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tighter line-clamp-1">{activeTab === 'applicants' ? item.fullName : item.name}</h4>
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                                                        {activeTab === 'applicants' ? item.status : item.clientB2BName}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Right Panel: integrated Analysis */}
                            <div className="flex-1 p-8 md:p-12">
                                <AnimatePresence mode="wait">
                                    {selectedItem ? (
                                        <motion.div
                                            key={selectedItem._id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="h-full flex flex-col"
                                        >
                                            <div className="flex justify-between items-start mb-12">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-3">
                                                        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">
                                                            {activeTab === 'applicants' ? selectedItem.fullName : selectedItem.name}
                                                        </h2>
                                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${activeTab === 'applicants' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                            {activeTab === 'applicants' ? 'Candidato' : 'Proyecto'}
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">
                                                        {activeTab === 'applicants' ? `RUT: ${selectedItem.rut}` : `Cliente: ${selectedItem.clientB2BName}`}
                                                    </p>
                                                </div>
                                            </div>

                                            <CommentSection
                                                targetType={activeTab === 'applicants' ? 'Applicant' : 'Project'}
                                                targetId={selectedItem._id}
                                            />
                                        </motion.div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                                            <div className="w-32 h-32 bg-slate-50 rounded-[3rem] flex items-center justify-center text-slate-200">
                                                <Activity size={64} />
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Análisis Estratégico</h3>
                                            <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] max-w-sm mx-auto leading-relaxed">
                                                Selecciona un nodo del panel izquierdo para iniciar el análisis, dejar feedback o revisar el histórico.
                                            </p>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    {/* Secondary Visuals Column */}
                    <div className="space-y-8">
                        <div className="bg-slate-900 p-10 rounded-[4rem] text-white shadow-3xl">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-8">Estructura de Flujo</h4>
                            <div className="h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats.funnelData}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={8}
                                            dataKey="value"
                                        >
                                            {stats.funnelData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '15px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-8">
                                {stats.funnelData.map(d => (
                                    <div key={d.name} className="flex flex-col gap-1 p-4 rounded-3xl bg-white/5 border border-white/5">
                                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{d.name}</p>
                                        <p className="text-lg font-black italic">{d.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Comments Mini Feed */}
                        <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-xl shadow-slate-900/5">
                            <div className="flex items-center gap-3 mb-8">
                                <MessageSquare size={18} className="text-indigo-600" />
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Feedback Reciente</h4>
                            </div>
                            <div className="space-y-6">
                                <div className="text-center py-10">
                                    <Clock size={32} className="mx-auto text-slate-100 mb-4" />
                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Monitoreando feedback...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* DrillDown Modals */}
            <AnimatePresence>
                {drillDown && (
                    <DrillDownOverlay
                        type={drillDown}
                        stats={stats}
                        onClose={() => setDrillDown(null)}
                    />
                )}
            </AnimatePresence>
        </PageWrapper>
    );
};

const MetricCard = ({ title, mainValue, subValue, icon: Icon, color, progress, badge, onClick }) => {
    const colors = {
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
        purple: 'bg-purple-50 text-purple-600 border-purple-100'
    };

    return (
        <button
            onClick={onClick}
            className="group relative bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all text-left overflow-hidden flex flex-col justify-between h-[280px]"
        >
            <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 blur-3xl rounded-full transform translate-x-12 -translate-y-12 ${colors[color].replace('border-', 'bg-')}`} />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                    <div className={`p-4 rounded-2xl transition-all group-hover:scale-110 shadow-sm ${colors[color]}`}>
                        <Icon size={24} />
                    </div>
                    {badge && (
                        <span className="px-3 py-1 bg-rose-50 text-rose-500 text-[8px] font-black uppercase tracking-widest rounded-full animate-pulse border border-rose-100 shadow-sm shadow-rose-900/5">
                            {badge}
                        </span>
                    )}
                </div>

                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</p>
                    <h3 className="text-4xl font-black text-slate-900 italic tracking-tighter">{mainValue}</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{subValue}</p>
                </div>
            </div>

            {progress !== undefined && (
                <div className="mt-8 space-y-2 relative z-10">
                    <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className={`h-full ${color === 'emerald' ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-indigo-600'}`}
                        />
                    </div>
                </div>
            )}

            <div className="absolute bottom-6 right-8 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                <ArrowUpRight size={20} className="text-slate-300" />
            </div>
        </button>
    );
};

const DrillDownOverlay = ({ type, stats, onClose }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 md:p-12 lg:p-24 bg-slate-900/80 backdrop-blur-xl"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-4xl h-full rounded-[4rem] overflow-hidden flex flex-col shadow-3xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-12 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">Detalle de Analítica: {type}</h2>
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mt-2">Haz clic fuera para cerrar</p>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 rounded-full bg-white flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all shadow-xl group">
                        <AlertCircle size={20} className="group-hover:rotate-90 transition-transform" />
                    </button>
                </div>

                <div className="flex-1 p-12 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-slate-50 p-8 rounded-[3rem] border border-slate-100">
                            <h4 className="text-[10px] font-black uppercase tracking-widest mb-6">Métrica Histórica</h4>
                            <div className="h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.funnelData}>
                                        <Area type="monotone" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-widest">Variables de Desempeño</h4>
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex items-center justify-between p-6 bg-white rounded-3xl border border-slate-100">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                                <TrendingUp size={16} />
                                            </div>
                                            <span className="text-[10px] font-bold uppercase">Indicador Estratégico {i}</span>
                                        </div>
                                        <span className="text-lg font-black italic">±{(Math.random() * 10).toFixed(1)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

const CommentSection = ({ targetType, targetId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchComments();
    }, [targetId]);

    const fetchComments = async () => {
        try {
            const { data } = await api.get(`/comments/${targetType}/${targetId}`);
            setComments(data);
        } catch (error) { console.error('Error fetching comments'); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            setLoading(true);
            await api.post('/comments', { targetType, targetId, text: newComment });
            setNewComment('');
            fetchComments();
            toast.success('Feedback estratégico registrado');
        } catch (error) { toast.error('Error al registrar feedback'); } finally { setLoading(false); }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50/50 rounded-[4rem] border border-slate-100 overflow-hidden shadow-inner">
            <div className="p-8 border-b border-white flex items-center justify-between bg-white/40">
                <div className="flex items-center gap-3">
                    <MessageSquare size={18} className="text-indigo-600" />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 italic">Central de Supervisión</h4>
                </div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{comments.length} Comentarios</span>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 max-h-[500px]">
                {comments.length > 0 ? comments.map(c => (
                    <div key={c._id} className="flex gap-4 group">
                        <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center font-black text-indigo-600 text-[10px] shadow-sm italic">
                            {c.authorId?.name?.charAt(0)}
                        </div>
                        <div className="flex-1 space-y-1.5">
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-900 italic">{c.authorId?.name}</span>
                                <span className="text-[8px] font-bold text-slate-400 uppercase">
                                    {new Date(c.createdAt).toLocaleDateString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <div className="bg-white p-5 rounded-3xl rounded-tl-none border border-slate-100 shadow-sm relative group-hover:shadow-md transition-shadow">
                                <p className="text-[11px] font-bold text-slate-700 leading-relaxed italic">{c.text}</p>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-12">
                        <MessageSquare size={32} className="mb-4 text-slate-300" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sin historial de feedback</p>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="p-8 bg-white border-t border-slate-100">
                <div className="relative group/input">
                    <textarea
                        className="w-full bg-slate-50 border border-slate-200 rounded-[2.5rem] p-6 pr-24 text-xs outline-none focus:border-indigo-600 focus:bg-white transition-all font-bold italic resize-none"
                        placeholder="Escribe análisis estratégico..."
                        rows="1"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={loading || !newComment.trim()}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-indigo-600 text-white rounded-[1.5rem] hover:bg-slate-900 disabled:opacity-50 transition-all shadow-xl shadow-indigo-900/10"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default DashboardEmpresa;
