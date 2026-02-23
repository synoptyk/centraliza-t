import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import {
    ShieldCheck,
    Zap,
    Crown,
    Clock,
    Check,
    ChevronRight,
    AlertTriangle,
    CreditCard,
    ArrowUpCircle,
    Building,
    ExternalLink,
    X,
    FileText,
    UploadCloud
} from 'lucide-react';
import toast from 'react-hot-toast';

const BillingAndSubscription = () => {
    const [subscription, setSubscription] = useState(null);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal de Pago B2B
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('mercadopago'); // mercadopago, transferencia, oc
    const [fileProof, setFileProof] = useState(null);

    useEffect(() => {
        fetchData();
        checkPaymentStatus();
    }, []);

    const checkPaymentStatus = () => {
        const params = new URLSearchParams(window.location.search);
        const paymentStatus = params.get('payment');

        if (paymentStatus === 'success') {
            toast.success('¡Pago Aprobado! Tu suscripción se activará en segundos.', { duration: 6000 });
        } else if (paymentStatus === 'failure') {
            toast.error('El pago no pudo procesarse. Por favor, reintenta.');
        } else if (paymentStatus === 'pending') {
            toast.loading('Pago pendiente de validación bancaria...');
        }
    };

    const fetchData = async () => {
        try {
            const [subRes, plansRes] = await Promise.all([
                api.get('/subscriptions/my-subscription'),
                api.get('/subscriptions/plans')
            ]);
            setSubscription(subRes.data);
            setPlans(plansRes.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const openPaymentModal = (plan) => {
        setSelectedPlan(plan);
        setPaymentMethod('mercadopago');
        setFileProof(null);
        setPaymentModalOpen(true);
    };

    const handleCheckout = async () => {
        if (!selectedPlan) return;

        const loadingToast = toast.loading('Procesando solicitud de pago segura...');
        try {
            if (paymentMethod === 'mercadopago') {
                const { data } = await api.post('/subscriptions/checkout', { planId: selectedPlan._id });
                toast.dismiss(loadingToast);

                if (data.checkoutUrl) {
                    window.location.href = data.checkoutUrl;
                } else {
                    toast.error('No se pudo obtener la URL de pago');
                }
            } else {
                // Transferencia u OC (Manual Payment Flow)
                const formData = new FormData();
                formData.append('planId', selectedPlan._id);
                formData.append('method', paymentMethod);
                if (fileProof) {
                    formData.append('file', fileProof);
                }

                await api.post('/subscriptions/manual-payment', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                toast.dismiss(loadingToast);
                toast.success('Comprobante enviado exitosamente a revisión financiera. Te notificaremos cuando se active tu plan.', { duration: 6000 });
                setPaymentModalOpen(false);
            }
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error(error.response?.data?.message || 'Error al conectar con la pasarela');
        }
    };

    if (loading) return (
        <div className="h-screen w-full flex items-center justify-center bg-slate-50/50">
            <div className="text-slate-400 font-black animate-pulse uppercase tracking-[0.3em] text-xs">Cargando Ecosistema Financiero...</div>
        </div>
    );

    return (
        <div className="p-10 space-y-10 max-w-7xl mx-auto bg-slate-50/30 min-h-screen">
            {/* Header with Company Context */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">PLANES & FACTURACIÓN</h1>
                    <p className="text-indigo-600 font-bold uppercase tracking-[0.2em] text-[8px] sm:text-[10px] mt-1">Gestión de Suscripción Corporativa</p>
                </div>
                {subscription?.status === 'Trial' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3 sm:gap-4 shadow-sm animate-pulse">
                        <Clock className="text-amber-600" size={18} />
                        <div>
                            <p className="text-slate-900 font-black text-[8px] sm:text-[10px] uppercase tracking-widest">En Periodo de Prueba</p>
                            <p className="text-amber-600 text-[9px] font-bold">Vence en {Math.ceil((new Date(subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24))} días</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Current Subscription Card */}
            <div className="bg-white border border-slate-200/60 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 relative overflow-hidden group shadow-sm">
                <div className="absolute top-0 right-0 p-20 opacity-[0.03] bg-indigo-600 rounded-bl-full pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between gap-10">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-600/20">
                                <Crown className="text-white" size={32} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">{subscription?.planId?.name || 'Sin Plan Activo'}</h2>
                                <p className="text-indigo-600 font-bold text-[10px] uppercase tracking-[0.2em]">{subscription?.status === 'Trial' ? 'Evaluación de Capacidades' : 'Suscripción Empresarial'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-10 pt-4">
                            <div>
                                <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1.5">Renovación</p>
                                <p className="text-slate-900 font-black text-sm">{subscription?.nextBillingDate ? new Date(subscription.nextBillingDate).toLocaleDateString() : 'Por Definir'}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1.5">Monto Mensual</p>
                                <p className="text-emerald-600 font-black text-sm">{subscription?.planId?.priceUF || 0} UF</p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1.5">Pagos</p>
                                <p className="text-slate-900 font-black text-sm flex items-center gap-2">
                                    <CreditCard size={14} className="text-slate-400" /> {subscription?.paymentMethod || 'Pagar Ahora'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col justify-center gap-4 min-w-[240px]">
                        <button className="bg-slate-900 text-white px-8 py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-slate-900/10">
                            Descargar Historial <ChevronRight size={16} />
                        </button>
                        <p className="text-center text-[9px] text-slate-400 font-bold uppercase tracking-tight">Facturación automatizada el día 1 de cada mes</p>
                    </div>
                </div>
            </div>

            {/* Plan Selection Grid */}
            <div className="space-y-12 pt-16">
                <div className="text-center space-y-3">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Eleva tu Ecosistema</h2>
                    <p className="text-slate-400 font-bold text-sm tracking-[0.1em]">Escala tus capacidades globales según el crecimiento de tu empresa</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10">
                    {plans.map((plan) => (
                        <div
                            key={plan._id}
                            className={`bg-white border ${plan.name === subscription?.planId?.name ? 'border-indigo-600 ring-2 ring-indigo-600/10' : 'border-slate-200/60'} rounded-[2.5rem] sm:rounded-[3rem] p-8 sm:p-10 flex flex-col hover:border-indigo-600/30 transition-all duration-500 group relative shadow-sm hover:shadow-xl hover:-translate-y-1`}
                        >
                            {plan.name === 'Business' && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20">
                                    Top Recomendado
                                </div>
                            )}

                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="text-slate-900 font-black text-2xl uppercase tracking-tighter group-hover:text-indigo-600 transition-colors leading-none">{plan.name}</h3>
                                    {plan.targetAudience === 'agency' && <span className="bg-purple-100 text-purple-600 text-[8px] px-2 py-0.5 rounded-full font-black uppercase">Agencia</span>}
                                    {plan.targetAudience === 'full_hr' && <span className="bg-emerald-100 text-emerald-600 text-[8px] px-2 py-0.5 rounded-full font-black uppercase">Integral</span>}
                                </div>
                                <p className="text-slate-500 text-xs font-bold leading-relaxed">{plan.description}</p>
                            </div>

                            <div className="mb-10 flex items-baseline gap-2 border-b border-slate-50 pb-8">
                                <span className="text-5xl font-black text-slate-900 tracking-tighter">{plan.priceUF}</span>
                                <span className="text-indigo-600 font-black text-sm uppercase tracking-widest">UF / Mes</span>
                            </div>

                            <div className="space-y-5 mb-12 flex-1">
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-center gap-4 group/item">
                                        <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center group-hover/item:bg-emerald-500 transition-all duration-300">
                                            <Check className="text-emerald-500 group-hover/item:text-white transition-colors" size={14} />
                                        </div>
                                        <span className="text-xs font-bold text-slate-500 group-hover/item:text-slate-900 transition-colors">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => openPaymentModal(plan)}
                                disabled={plan._id === subscription?.planId?._id}
                                className={`w-full py-6 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-500 ${plan._id === subscription?.planId?._id
                                    ? 'bg-slate-100 text-slate-400 cursor-default shadow-inner'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/10 active:scale-95'
                                    }`}
                            >
                                {plan._id === subscription?.planId?._id ? 'ESTADO: PLAN ACTUAL' : `UPGRADE A ${plan.name}`}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bank Integration Alert */}
            <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform shadow-inner">
                        <ShieldCheck size={28} />
                    </div>
                    <div>
                        <h4 className="text-slate-900 font-black uppercase tracking-widest text-sm">Validación Bancaria Activa</h4>
                        <p className="text-slate-400 text-[10px] font-bold mt-1">Conexión cifrada vía central de pagos para mayor seguridad corporativa.</p>
                    </div>
                </div>
                <button className="flex items-center gap-3 text-indigo-600 hover:text-indigo-700 font-black text-[10px] uppercase tracking-[0.2em] px-6 py-3 rounded-xl hover:bg-slate-50 transition-all">
                    Configurar Conexión <ExternalLink size={16} />
                </button>
            </div>

            {/* Modal de Pagos B2B */}
            {paymentModalOpen && selectedPlan && (
                <div className="fixed inset-0 bg-[#020617]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                        {/* Header */}
                        <div className="bg-slate-900 p-8 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                    <ShieldCheck className="text-indigo-500" /> Pasarela Corporativa
                                </h3>
                                <p className="text-slate-400 text-sm mt-1">Upgrade a {selectedPlan.name} ({selectedPlan.priceUF} UF/mes)</p>
                            </div>
                            <button
                                onClick={() => setPaymentModalOpen(false)}
                                className="text-slate-500 hover:text-white p-2 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-8 space-y-8">
                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Medio de Pago</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <button
                                        onClick={() => setPaymentMethod('mercadopago')}
                                        className={`p-4 rounded-2xl border-2 transition-all ${paymentMethod === 'mercadopago' ? 'border-indigo-600 bg-indigo-50 text-indigo-900' : 'border-slate-100 hover:border-slate-200 text-slate-600'}`}
                                    >
                                        <CreditCard className={`mx-auto mb-2 ${paymentMethod === 'mercadopago' ? 'text-indigo-600' : 'text-slate-400'}`} />
                                        <p className="font-bold text-xs uppercase tracking-widest">Mercado Pago</p>
                                        <p className="text-[9px] mt-1 opacity-70">Tarjetas / Efectivo</p>
                                    </button>
                                    <button
                                        onClick={() => setPaymentMethod('transferencia')}
                                        className={`p-4 rounded-2xl border-2 transition-all ${paymentMethod === 'transferencia' ? 'border-emerald-600 bg-emerald-50 text-emerald-900' : 'border-slate-100 hover:border-slate-200 text-slate-600'}`}
                                    >
                                        <Building className={`mx-auto mb-2 ${paymentMethod === 'transferencia' ? 'text-emerald-600' : 'text-slate-400'}`} />
                                        <p className="font-bold text-xs uppercase tracking-widest">Transferencia</p>
                                        <p className="text-[9px] mt-1 opacity-70">Aprobación Manual</p>
                                    </button>
                                    <button
                                        onClick={() => setPaymentMethod('oc')}
                                        className={`p-4 rounded-2xl border-2 transition-all ${paymentMethod === 'oc' ? 'border-purple-600 bg-purple-50 text-purple-900' : 'border-slate-100 hover:border-slate-200 text-slate-600'}`}
                                    >
                                        <FileText className={`mx-auto mb-2 ${paymentMethod === 'oc' ? 'text-purple-600' : 'text-slate-400'}`} />
                                        <p className="font-bold text-xs uppercase tracking-widest">Orden de Compra</p>
                                        <p className="text-[9px] mt-1 opacity-70">Pago Institucional</p>
                                    </button>
                                </div>
                            </div>

                            {paymentMethod !== 'mercadopago' && (
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 animate-in slide-in-from-top-4">
                                    {paymentMethod === 'transferencia' ? (
                                        <div className="mb-4 text-xs text-slate-600 leading-relaxed font-bold">
                                            <p className="text-slate-900 uppercase tracking-widest mb-2 font-black">Datos Bancarios Centraliza-T SPA:</p>
                                            <p>Banco: Banco Santander</p>
                                            <p>Cuenta Corriente: 123456789</p>
                                            <p>RUT: 76.543.210-K</p>
                                            <p>Email: finanzas@centralizat.cl</p>
                                            <p>Monto a transferir: {Math.round(selectedPlan.priceUF * 38000).toLocaleString()} CLP (Aprox)</p>
                                        </div>
                                    ) : (
                                        <div className="mb-4 text-xs text-slate-600 leading-relaxed font-bold">
                                            <p className="text-slate-900 uppercase tracking-widest mb-2 font-black">Instrucciones OC:</p>
                                            <p>Asegúrese de que la Orden de Compra esté a nombre de Centraliza-T SPA y cubra el monto del plan (Renovación automática o plazo fijo).</p>
                                        </div>
                                    )}

                                    <label className="block mt-6">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Subir Documento (Comprobante u OC)</span>
                                        <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl overflow-hidden relative">
                                            <div className="space-y-1 text-center">
                                                <UploadCloud className="mx-auto h-8 w-8 text-slate-400" />
                                                <div className="flex text-xs text-slate-600 justify-center">
                                                    <label className="relative cursor-pointer bg-white rounded-md font-black text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-0">
                                                        <span>{fileProof ? fileProof.name : 'Seleccionar Archivo'}</span>
                                                        <input type="file" className="sr-only" onChange={(e) => setFileProof(e.target.files[0])} accept=".pdf,.png,.jpg,.jpeg" />
                                                    </label>
                                                </div>
                                                <p className="text-[9px] text-slate-400 font-bold">PDF, PNG, JPG (Max 5MB)</p>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="bg-slate-50 p-6 border-t border-slate-100 flex justify-end gap-3">
                            <button
                                onClick={() => setPaymentModalOpen(false)}
                                className="px-6 py-3 text-sm font-black text-slate-500 uppercase tracking-widest hover:text-slate-800 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCheckout}
                                disabled={paymentMethod !== 'mercadopago' && !fileProof}
                                className={`px-8 py-3 text-white text-sm font-black uppercase tracking-widest shadow-xl rounded-xl transition-all flex items-center gap-2 ${paymentMethod !== 'mercadopago' && !fileProof
                                    ? 'bg-slate-300 cursor-not-allowed shadow-none'
                                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
                                    }`}
                            >
                                <Check size={16} /> Procesar Transacción
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BillingAndSubscription;
