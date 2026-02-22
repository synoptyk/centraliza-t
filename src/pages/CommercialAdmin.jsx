import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import {
    TrendingUp,
    Users,
    CreditCard,
    Plus,
    Settings,
    CheckCircle,
    AlertCircle,
    Clock,
    ChevronRight,
    DollarSign,
    Target,
    Zap,
    Shield,
    Activity,
    Building2,
    Mail,
    ShieldCheck,
    AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

const CommercialAdmin = () => {
    const [plans, setPlans] = useState([]);
    const [promos, setPromos] = useState([]);
    const [allSubscriptions, setAllSubscriptions] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRevenueUF: 0,
        activeSubscriptions: 0,
        trialUsers: 0,
        conversionRate: '0%'
    });

    // Modal Control
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [showPromoModal, setShowPromoModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Form States
    const [newPlan, setNewPlan] = useState({
        name: '',
        description: '',
        priceUF: 0,
        limits: { adminUsers: 5, monthlyApplicants: 100, projects: 10, storageGB: 5 },
        features: [''],
        isTrial: false,
        isPublic: true
    });

    const [newPromo, setNewPromo] = useState({
        code: '',
        discountValue: 0,
        description: '',
        expiryDate: ''
    });

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [plansRes, promosRes, statsRes, allSubsRes, companiesRes, usersRes] = await Promise.all([
                api.get('/subscriptions/plans'),
                api.get('/subscriptions/promos'),
                api.get('/subscriptions/stats'),
                api.get('/subscriptions/all'),
                api.get('/companies'),
                api.get('/users')
            ]);
            setPlans(plansRes.data);
            setPromos(promosRes.data);
            setStats(statsRes.data);
            setAllSubscriptions(allSubsRes.data);
            setCompanies(companiesRes.data);
            setUsers(usersRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching commercial data:', error);
            toast.error('Error al sincronizar datos del ecosistema');
            setLoading(false);
        }
    };

    const handleCreatePlan = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`/subscriptions/plans/${editingId}`, newPlan);
                toast.success('Plan actualizado con éxito');
            } else {
                await api.post('/subscriptions/plans', newPlan);
                toast.success('Plan comercial desplegado con éxito');
            }
            closePlanModal();
            fetchAllData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al procesar plan');
        }
    };

    const closePlanModal = () => {
        setShowPlanModal(false);
        setIsEditing(false);
        setEditingId(null);
        setNewPlan({
            name: '',
            description: '',
            priceUF: 0,
            limits: { adminUsers: 5, monthlyApplicants: 100, projects: 10, storageGB: 5 },
            features: [''],
            isTrial: false,
            isPublic: true
        });
    };

    const handleEditPlan = (plan) => {
        setIsEditing(true);
        setEditingId(plan._id);
        setNewPlan({
            name: plan.name,
            description: plan.description,
            priceUF: plan.priceUF,
            limits: plan.limits || { adminUsers: 5, monthlyApplicants: 100, projects: 10, storageGB: 5 },
            features: plan.features || [''],
            isTrial: plan.isTrial || false,
            isPublic: plan.isPublic
        });
        setShowPlanModal(true);
    };

    const handleDeletePlan = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este plan? Esta acción no se puede deshacer.')) return;
        try {
            await api.delete(`/subscriptions/plans/${id}`);
            toast.success('Plan eliminado del ecosistema');
            fetchAllData();
        } catch (error) {
            toast.error('Error al eliminar plan');
        }
    };

    const handleTogglePlanActive = async (plan) => {
        try {
            await api.put(`/subscriptions/plans/${plan._id}`, { isActive: !plan.isActive });
            toast.success(`Plan ${!plan.isActive ? 'activado' : 'suspendido'}`);
            fetchAllData();
        } catch (error) {
            toast.error('Error al cambiar estado del plan');
        }
    };

    const handleCreatePromo = async (e) => {
        e.preventDefault();
        try {
            await api.post('/subscriptions/promos', newPromo);
            toast.success('Cupón de descuento activado');
            setShowPromoModal(false);
            fetchAllData();
        } catch (error) {
            toast.error('Error al crear promoción');
        }
    };

    const handleUpdateStatus = async (subId, newStatus) => {
        try {
            await api.put(`/subscriptions/${subId}/status`, { status: newStatus });
            toast.success(`Suscripción ${newStatus === 'Active' ? 'activada' : 'suspendida'}`);
            fetchAllData();
        } catch (error) {
            toast.error('Error al actualizar estado');
        }
    };

    const handleUpdateCompanyStatus = async (companyId, newStatus) => {
        try {
            await api.put(`/companies/${companyId}`, { status: newStatus });
            toast.success(`Empresa actualizada a: ${newStatus}`);
            fetchAllData();
        } catch (error) {
            toast.error('Error al actualizar empresa');
        }
    };

    const handleUpdateUserStatus = async (userId, newStatus) => {
        try {
            await api.put(`/users/${userId}`, { status: newStatus });
            toast.success(`Usuario actualizado a: ${newStatus}`);
            fetchAllData();
        } catch (error) {
            toast.error('Error al actualizar usuario');
        }
    };

    const handleNotifyPayment = async (subId) => {
        try {
            toast.loading('Enviando notificación...', { id: 'notify' });
            await api.post(`/subscriptions/${subId}/notify`);
            toast.success('Notificación de cobro enviada al cliente', { id: 'notify' });
        } catch (error) {
            toast.error('Error al enviar notificación', { id: 'notify' });
        }
    };

    const StatCard = ({ title, value, icon: Icon, trend, color }) => (
        <div className="bg-white border border-slate-200/60 rounded-3xl p-6 relative overflow-hidden group shadow-sm hover:shadow-md transition-all">
            <div className={`absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity bg-gradient-to-br ${color} rounded-bl-full`}></div>
            <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-2xl bg-slate-50 border border-slate-100 group-hover:scale-110 transition-transform`}>
                        <Icon size={20} className="text-indigo-600" />
                    </div>
                    <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">{title}</p>
                </div>
                <div className="flex items-end gap-3">
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
                    {trend && <span className="text-emerald-600 text-[10px] font-black mb-1.5">{trend}</span>}
                </div>
            </div>
        </div>
    );

    if (loading) return (
        <div className="h-screen w-full flex items-center justify-center bg-slate-50/50">
            <div className="text-slate-400 font-black animate-pulse uppercase tracking-[0.3em] text-xs">Sincronizando Mando Comercial...</div>
        </div>
    );

    return (
        <div className="p-4 sm:p-10 space-y-8 sm:space-y-12 bg-slate-50/30 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">Centro de Mando Comercial</h1>
                    <p className="text-indigo-600 font-bold uppercase tracking-[0.2em] text-[8px] sm:text-[10px] mt-1 sm:mt-2">Monetización & Escalabilidad Ecosistema</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setShowPlanModal(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/10 flex items-center gap-2 sm:gap-3 active:scale-95"
                    >
                        <Plus size={16} /> <span className="hidden xs:inline">Nuevo Plan</span><span className="xs:hidden">Plan</span>
                    </button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="Ingresos Reales" value={`${stats.totalRevenueUF || 0} UF`} icon={DollarSign} trend="+12.5%" color="from-emerald-500 to-teal-500" />
                <StatCard title="Empresas Activas" value={stats.activeSubscriptions || 0} icon={Users} trend="Vigentes" color="from-indigo-500 to-purple-500" />
                <StatCard title="Cuentas en Trial" value={stats.trialUsers || 0} icon={Clock} trend="Evolución" color="from-amber-500 to-orange-500" />
                <StatCard title="Tasa de Conversión" value={stats.conversionRate || '0%'} icon={TrendingUp} trend="Directo" color="from-fuchsia-500 to-pink-500" />
            </div>

            {/* SECCIÓN DE GESTIÓN DE EMPRESAS (NUEVA SOLICITUD DE ALTA) */}
            <div className="bg-white border border-slate-200/60 rounded-[2.5rem] overflow-hidden shadow-sm">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white">
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                        <Building2 className="text-indigo-600" size={24} /> Empresas & Solicitudes
                    </h2>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{companies.length} Entidades en el Sistema</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Empresa / RUT</th>
                                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Contacto</th>
                                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Estado Aprobación</th>
                                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Acciones de Control</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {companies.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-20 text-center text-slate-400 font-bold uppercase text-xs">No hay empresas registradas.</td>
                                </tr>
                            ) : (
                                companies.map((company) => (
                                    <tr key={company._id} className="hover:bg-slate-50/50 transition-all group">
                                        <td className="p-6">
                                            <p className="text-slate-900 font-black text-xs uppercase tracking-wider">{company.name}</p>
                                            <p className="text-slate-400 text-[9px] font-bold">{company.rut}</p>
                                        </td>
                                        <td className="p-6">
                                            <p className="text-slate-600 font-bold text-xs">{company.email}</p>
                                            <p className="text-slate-400 text-[9px]">{company.phone}</p>
                                        </td>
                                        <td className="p-6">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${company.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                company.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                    'bg-red-50 text-red-600 border-red-100'
                                                }`}>
                                                {company.status === 'Active' ? 'Aprobada' :
                                                    company.status === 'Pending' ? 'Pendiente' :
                                                        company.status === 'Blocked' ? 'Bloqueada' : 'Suspendida'}
                                            </span>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center justify-center gap-3">
                                                {company.status !== 'Active' && (
                                                    <button
                                                        onClick={() => handleUpdateCompanyStatus(company._id, 'Active')}
                                                        className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                                                    >
                                                        Dar de Alta
                                                    </button>
                                                )}
                                                {company.status !== 'Blocked' && (
                                                    <button
                                                        onClick={() => handleUpdateCompanyStatus(company._id, 'Blocked')}
                                                        className="px-4 py-2 rounded-xl bg-red-50 text-red-600 border border-red-100 text-[9px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
                                                    >
                                                        Bloquear
                                                    </button>
                                                )}
                                                {company.status !== 'Suspended' && (
                                                    <button
                                                        onClick={() => handleUpdateCompanyStatus(company._id, 'Suspended')}
                                                        className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                                                    >
                                                        Suspender
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* SECCIÓN DE GESTIÓN DE USUARIOS ADMINISTRADORES */}
            <div className="bg-white border border-slate-200/60 rounded-[2.5rem] overflow-hidden shadow-sm">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white">
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                        <ShieldCheck className="text-indigo-600" size={24} /> Usuarios & Roles Críticos
                    </h2>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{users.length} Usuarios Totales</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Usuario / RUT</th>
                                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Rol / Empresa</th>
                                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Estado</th>
                                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.filter(u => u.role !== 'Ceo_Centralizat').length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-20 text-center text-slate-400 font-bold uppercase text-xs">No hay usuarios para gestionar.</td>
                                </tr>
                            ) : (
                                users.filter(u => u.role !== 'Ceo_Centralizat').map((user) => (
                                    <tr key={user._id} className="hover:bg-slate-50/50 transition-all group">
                                        <td className="p-6">
                                            <p className="text-slate-900 font-black text-xs uppercase tracking-wider">{user.name}</p>
                                            <p className="text-slate-400 text-[9px] font-bold">{user.email}</p>
                                        </td>
                                        <td className="p-6">
                                            <p className="text-indigo-600 font-black text-[9px] uppercase tracking-widest mb-1">{user.role}</p>
                                            <p className="text-slate-500 text-[10px] font-bold">{user.companyId?.name || 'Sistema central'}</p>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : user.status === 'Pending' ? 'bg-amber-500' : 'bg-red-500'}`}></div>
                                                <span className={`text-[9px] font-black uppercase tracking-widest ${user.status === 'Active' ? 'text-emerald-600' : user.status === 'Pending' ? 'text-amber-600' : 'text-red-600'}`}>
                                                    {user.status === 'Active' ? 'Activo' : user.status === 'Pending' ? 'Pendiente' : 'Inhabilitado'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleUpdateUserStatus(user._id, user.status === 'Active' ? 'Suspended' : 'Active')}
                                                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${user.status === 'Active'
                                                        ? 'bg-red-50 text-red-600 border border-red-100'
                                                        : 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                                                        }`}
                                                >
                                                    {user.status === 'Active' ? 'Inhabilitar' : 'Activar / Alta'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* SECCIÓN DE SUSCRIPCIONES (EXISTENTE PERO RENOMBRADA) */}
            <div className="bg-white border border-slate-200/60 rounded-[2.5rem] overflow-hidden shadow-sm">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white">
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                        <Activity className="text-indigo-600" size={24} /> Estado de Suscripciones
                    </h2>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{allSubscriptions.length} Empresas Registradas</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Empresa</th>
                                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Plan Actual</th>
                                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Estado</th>
                                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Suscripción</th>
                                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Vencimiento</th>
                                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {allSubscriptions.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-20 text-center text-slate-400 font-bold uppercase text-xs">No hay suscripciones registradas en el ecosistema.</td>
                                </tr>
                            ) : (
                                allSubscriptions.map((sub) => (
                                    <tr key={sub._id} className="hover:bg-slate-50/50 transition-all group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden text-slate-400 shadow-inner">
                                                    {sub.companyId?.logo ? (
                                                        <img src={sub.companyId.logo} alt="logo" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Building2 size={18} />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-slate-900 font-black text-xs uppercase tracking-wider">{sub.companyId?.name || 'Procesando...'}</p>
                                                    <p className="text-slate-400 text-[9px] font-bold">{sub.companyId?.rut || 'SIN RUT'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-indigo-100">
                                                {sub.planId?.name || 'Free'}
                                            </span>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${sub.status === 'Active' ? 'bg-emerald-500' : sub.status === 'Trial' ? 'bg-amber-500' : 'bg-red-500'}`}></div>
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${sub.status === 'Active' ? 'text-emerald-600' : sub.status === 'Trial' ? 'text-amber-600' : 'text-red-600'}`}>
                                                    {sub.status === 'Active' ? 'Vigente' : sub.status === 'Trial' ? 'En Prueba' : 'Suspendido'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-xs font-bold text-slate-500">
                                            {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="p-6">
                                            <p className="text-xs font-black text-slate-900">{sub.endDate ? new Date(sub.endDate).toLocaleDateString() : 'N/A'}</p>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter mt-1">
                                                {sub.endDate && Math.ceil((new Date(sub.endDate) - new Date()) / (1000 * 60 * 60 * 24)) > 0
                                                    ? `Quedan ${Math.ceil((new Date(sub.endDate) - new Date()) / (1000 * 60 * 60 * 24))} días`
                                                    : 'Vencido'}
                                            </p>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center justify-center gap-3">
                                                <button
                                                    onClick={() => handleNotifyPayment(sub._id)}
                                                    className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all"
                                                    title="Notificar Próximo Pago"
                                                >
                                                    <Mail size={16} />
                                                </button>
                                                {sub.status === 'Suspended' ? (
                                                    <button
                                                        onClick={() => handleUpdateStatus(sub._id, 'Active')}
                                                        className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white bg-opacity-10 transition-all"
                                                        title="Habilitar"
                                                    >
                                                        <ShieldCheck size={16} />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleUpdateStatus(sub._id, 'Suspended')}
                                                        className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white bg-opacity-10 transition-all"
                                                        title="Suspender"
                                                    >
                                                        <AlertTriangle size={16} />
                                                    </button>
                                                )}
                                                <button className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all">
                                                    <Settings size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Secondary Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Active Plans List */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest flex items-center gap-3 px-2">
                        <Zap className="text-indigo-600" size={24} /> Configuraciones de Planes
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {plans.map(plan => (
                            <div key={plan._id} className="bg-white border border-slate-200/60 rounded-3xl p-6 hover:border-indigo-600/30 transition-all group shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-slate-900 font-black uppercase text-xs tracking-wider">{plan.name}</h4>
                                                {!plan.isActive && <span className="bg-red-100 text-red-600 text-[8px] px-2 py-0.5 rounded-full font-black uppercase">Suspendido</span>}
                                                {!plan.isPublic && <span className="bg-slate-100 text-slate-500 text-[8px] px-2 py-0.5 rounded-full font-black uppercase">Privado</span>}
                                            </div>
                                            <p className="text-indigo-600 font-black text-[10px] mt-0.5">{plan.priceUF} UF / mes</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleTogglePlanActive(plan)}
                                            className={`p-2 rounded-lg transition-colors ${plan.isActive ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'}`}
                                            title={plan.isActive ? 'Suspender' : 'Activar'}
                                        >
                                            <Shield size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleEditPlan(plan)}
                                            className="p-2 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-indigo-600 transition-colors"
                                            title="Editar"
                                        >
                                            <Settings size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeletePlan(plan._id)}
                                            className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                                            title="Eliminar"
                                        >
                                            <AlertTriangle size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Promotions Section */}
                <div className="space-y-6">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest flex items-center gap-3 px-2">
                        <Target size={24} className="text-indigo-600" /> Marketing
                    </h3>
                    <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 space-y-6 shadow-sm">
                        <div className="space-y-4">
                            {promos.map(promo => (
                                <div key={promo._id} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col gap-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-indigo-600 tracking-widest uppercase font-mono">{promo.code}</span>
                                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">-{promo.discountValue}%</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold">{promo.description || 'Descuento comercial activo'}</p>
                                </div>
                            ))}

                            <button
                                onClick={() => setShowPromoModal(true)}
                                className="w-full py-4 rounded-2xl border border-dashed border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-indigo-600/50 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all"
                            >
                                + Nuevo Cupón
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* PLAN MODAL */}
            {showPlanModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white border border-slate-200 rounded-[3rem] w-full max-w-2xl p-10 space-y-8 max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                                {isEditing ? `Editar Plan: ${newPlan.name}` : 'Diseñar Nuevo Plan'}
                            </h2>
                            <button onClick={closePlanModal} className="p-2 text-slate-400 hover:text-slate-900 transition-colors uppercase font-black text-[10px]">Cerrar</button>
                        </div>

                        <form onSubmit={handleCreatePlan} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Nombre del Plan</label>
                                    <input
                                        type="text"
                                        value={newPlan.name}
                                        onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-slate-900 text-xs outline-none focus:border-indigo-600/30 focus:bg-white transition-all font-bold"
                                        placeholder="Ej: Plan Corporativo"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Precio (UF Mensual)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={newPlan.priceUF}
                                        onChange={(e) => setNewPlan({ ...newPlan, priceUF: Number(e.target.value) })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-slate-900 text-xs outline-none focus:border-indigo-600/30 focus:bg-white transition-all font-bold"
                                        placeholder="Ej: 5.5"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Descripción Estratégica</label>
                                <textarea
                                    value={newPlan.description}
                                    onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-slate-900 text-xs outline-none focus:border-indigo-600/30 focus:bg-white transition-all font-bold min-h-[100px]"
                                    placeholder="Describa la propuesta de valor..."
                                    required
                                />
                            </div>

                            <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6">
                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Configuración de Límites</p>
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Admin Users</label>
                                        <input
                                            type="number"
                                            value={newPlan.limits.adminUsers}
                                            onChange={(e) => setNewPlan({ ...newPlan, limits: { ...newPlan.limits, adminUsers: Number(e.target.value) } })}
                                            className="w-full bg-white border border-slate-100 rounded-xl py-4 px-4 text-slate-900 text-xs outline-none focus:border-indigo-600/30 transition-all font-black"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Postulantes/Mes</label>
                                        <input
                                            type="number"
                                            value={newPlan.limits.monthlyApplicants}
                                            onChange={(e) => setNewPlan({ ...newPlan, limits: { ...newPlan.limits, monthlyApplicants: Number(e.target.value) } })}
                                            className="w-full bg-white border border-slate-100 rounded-xl py-4 px-4 text-slate-900 text-xs outline-none focus:border-indigo-600/30 transition-all font-black"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Almacenamiento GB</label>
                                        <input
                                            type="number"
                                            value={newPlan.limits.storageGB}
                                            onChange={(e) => setNewPlan({ ...newPlan, limits: { ...newPlan.limits, storageGB: Number(e.target.value) } })}
                                            className="w-full bg-white border border-slate-100 rounded-xl py-4 px-4 text-slate-900 text-xs outline-none focus:border-indigo-600/30 transition-all font-black"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Proyectos Activos</label>
                                        <input
                                            type="number"
                                            value={newPlan.limits.projects}
                                            onChange={(e) => setNewPlan({ ...newPlan, limits: { ...newPlan.limits, projects: Number(e.target.value) } })}
                                            className="w-full bg-white border border-slate-100 rounded-xl py-4 px-4 text-slate-900 text-xs outline-none focus:border-indigo-600/30 transition-all font-black"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 pt-4">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={newPlan.isTrial}
                                        onChange={(e) => setNewPlan({ ...newPlan, isTrial: e.target.checked })}
                                        className="w-5 h-5 rounded-lg border-slate-200 bg-slate-50 text-indigo-600 focus:ring-0 focus:ring-offset-0 transition-all"
                                    />
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-900 transition-colors">¿Es Plan de Prueba?</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={newPlan.isPublic}
                                        onChange={(e) => setNewPlan({ ...newPlan, isPublic: e.target.checked })}
                                        className="w-5 h-5 rounded-lg border-slate-200 bg-slate-50 text-indigo-600 focus:ring-0 focus:ring-offset-0 transition-all"
                                    />
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-900 transition-colors">Visible al Público</span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-600/10 active:scale-95"
                            >
                                {isEditing ? 'Guardar Cambios' : 'Lanzar Plan al Ecosistema'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* PROMO MODAL */}
            {showPromoModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white border border-slate-200 rounded-[3rem] w-full max-w-md p-10 space-y-8 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Nuevo Código</h2>
                            <button onClick={() => setShowPromoModal(false)} className="text-slate-400 hover:text-slate-900 transition-colors uppercase font-black text-[10px]">Cerrar</button>
                        </div>

                        <form onSubmit={handleCreatePromo} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Código (Sin espacios)</label>
                                <input
                                    type="text"
                                    value={newPromo.code}
                                    onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase().trim() })}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 px-6 text-slate-900 text-sm outline-none focus:border-indigo-600/30 focus:bg-white transition-all font-black tracking-widest text-center uppercase"
                                    placeholder="EJ: CENTRALIZA2024"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Descuento (%)</label>
                                    <input
                                        type="number"
                                        value={newPromo.discountValue}
                                        onChange={(e) => setNewPromo({ ...newPromo, discountValue: Number(e.target.value) })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 px-6 text-slate-900 text-sm outline-none focus:border-indigo-600/30 focus:bg-white transition-all font-black text-center"
                                        placeholder="Ej: 20"
                                        max="100"
                                        min="1"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Vencimiento</label>
                                    <input
                                        type="date"
                                        value={newPromo.expiryDate}
                                        onChange={(e) => setNewPromo({ ...newPromo, expiryDate: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 px-6 text-slate-700 text-xs outline-none focus:border-indigo-600/30 focus:bg-white transition-all font-bold"
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-600/10 active:scale-95"
                            >
                                Activar Cupón Global
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommercialAdmin;

