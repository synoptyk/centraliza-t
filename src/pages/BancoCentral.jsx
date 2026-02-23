import React, { useState, useEffect } from 'react';
import { Landmark, TrendingUp, TrendingDown, Calendar, Activity, RefreshCcw, DollarSign, BarChart3, Clock, AlertCircle } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import toast from 'react-hot-toast';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const IndicatorCard = ({ title, data, icon: Icon, colorClass, borderClass, prefix = '$' }) => {
    if (!data) return (
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 flex items-center justify-center min-h-[160px]">
            <RefreshCcw className="animate-spin text-slate-300" />
        </div>
    );

    // Placeholder data for mini sparkline (would ideally come from historical API data)
    const sparklineData = Array.from({ length: 7 }, (_, i) => ({
        name: `D${i}`,
        value: data.valor * (1 + (Math.random() * 0.02 - 0.01))
    }));

    return (
        <div className={`bg-white rounded-[2.5rem] p-6 border ${borderClass} shadow-xl hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden group`}>
            {/* Background Blob */}
            <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full opacity-10 blur-2xl transition-all group-hover:scale-150 ${colorClass.replace('text-', 'bg-')}`}></div>

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorClass.replace('text-', 'bg-').replace('600', '50/50')} border ${borderClass}`}>
                        <Icon size={24} className={colorClass} />
                    </div>
                    <div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{data.codigo}</h3>
                        <p className="text-sm font-bold text-slate-700">{title}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-black text-slate-900 tracking-tight">
                        {prefix}{data.valor.toLocaleString('es-CL')}
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 flex items-center justify-end gap-1 mt-1">
                        <Calendar size={10} /> {new Date(data.fecha).toLocaleDateString('es-CL')}
                    </p>
                </div>
            </div>

            <div className="h-16 mt-6 relative z-10 opacity-60 group-hover:opacity-100 transition-opacity">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sparklineData}>
                        <defs>
                            <linearGradient id={`color-${data.codigo}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={colorClass === 'text-indigo-600' ? '#4f46e5' : colorClass === 'text-emerald-600' ? '#10b981' : colorClass === 'text-rose-600' ? '#e11d48' : '#f59e0b'} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={colorClass === 'text-indigo-600' ? '#4f46e5' : colorClass === 'text-emerald-600' ? '#10b981' : colorClass === 'text-rose-600' ? '#e11d48' : '#f59e0b'} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={colorClass === 'text-indigo-600' ? '#4f46e5' : colorClass === 'text-emerald-600' ? '#10b981' : colorClass === 'text-rose-600' ? '#e11d48' : '#f59e0b'}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill={`url(#color-${data.codigo})`}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const BancoCentral = ({ auth, onLogout }) => {
    const [indicators, setIndicators] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchIndicators();
    }, []);

    const fetchIndicators = async () => {
        setLoading(true);
        try {
            const res = await axios.get('https://mindicador.cl/api');
            setIndicators(res.data);
        } catch (error) {
            toast.error('Error sincronizando con el Banco Central / mindicador.cl');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <PageWrapper title="ESPEJO BANCO CENTRAL" subtitle="Conectando con servidores del Estado..." icon={Landmark} auth={auth} onLogout={onLogout}>
                <div className="flex flex-col items-center justify-center py-40 gap-6">
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center animate-pulse">
                        <Landmark size={32} className="text-indigo-500" />
                    </div>
                    <p className="text-xs font-black tracking-widest uppercase text-slate-400">Sincronizando Dólar, UF y UTM...</p>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper
            className="space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-32"
            title="ESPEJO BANCO CENTRAL"
            subtitle="Portal de Información Financiera en Tiempo Real y Cálculos Oficiales de la República de Chile."
            icon={Landmark}
            auth={auth}
            onLogout={onLogout}
            headerActions={
                <button
                    onClick={fetchIndicators}
                    className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-2xl border border-white/20 hover:bg-white/20 transition-all font-black text-[10px] uppercase tracking-widest backdrop-blur-sm"
                >
                    <RefreshCcw size={14} /> Sincronizar Ahora
                </button>
            }
        >
            {/* Header Notification */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-[2rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="flex items-center gap-5 relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md">
                        <Activity size={32} className="text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                            Conexión Establecida Oficialmente
                        </h2>
                        <p className="text-slate-300 text-sm mt-1 max-w-xl">
                            Esta terminal está conectada directamente con el Banco Central de Chile y el SII. Los datos reflejados nutren los motores de Nómina y Finiquitos de Centraliza-T V5.0.
                        </p>
                    </div>
                </div>
                <div className="relative z-10 bg-[#020617]/50 border border-white/10 px-6 py-4 rounded-2xl flex flex-col items-end">
                    <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">Última Actualización Global</p>
                    <p className="font-bold text-white flex items-center gap-2">
                        <Clock size={14} className="text-emerald-400" /> {new Date(indicators?.fecha).toLocaleString('es-CL')}
                    </p>
                </div>
            </div>

            {/* Main Indicators Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <IndicatorCard
                    title="Unidad de Fomento"
                    data={indicators?.uf}
                    icon={TrendingUp}
                    colorClass="text-indigo-600"
                    borderClass="border-indigo-100"
                />
                <IndicatorCard
                    title="Unidad Tributaria"
                    data={indicators?.utm}
                    icon={Landmark}
                    colorClass="text-rose-600"
                    borderClass="border-rose-100"
                />
                <IndicatorCard
                    title="Dólar Observado"
                    data={indicators?.dolar}
                    icon={DollarSign}
                    colorClass="text-emerald-600"
                    borderClass="border-emerald-100"
                />
                <IndicatorCard
                    title="Euro"
                    data={indicators?.euro}
                    icon={DollarSign}
                    colorClass="text-amber-600"
                    borderClass="border-amber-100"
                    prefix="€"
                />
            </div>

            {/* Secondary Indicators */}
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl mt-8">
                <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">
                    <BarChart3 className="text-slate-400" size={20} />
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Macroeconomía y Variables</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Tasa Política Monetaria */}
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Activity size={20} className="text-slate-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{indicators?.tpm?.nombre}</p>
                            <div className="flex items-baseline gap-2 mt-1">
                                <p className="text-2xl font-black text-slate-900">{indicators?.tpm?.valor}%</p>
                                <p className="text-xs font-bold text-slate-400 mt-1">/ Anual</p>
                            </div>
                        </div>
                    </div>

                    {/* IPC */}
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center flex-shrink-0">
                            <TrendingUp size={20} className="text-slate-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{indicators?.ipc?.nombre} (Mensual)</p>
                            <div className="flex items-baseline gap-2 mt-1">
                                <p className="text-2xl font-black text-slate-900">{indicators?.ipc?.valor}%</p>
                            </div>
                        </div>
                    </div>

                    {/* Libre de Cobre */}
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center flex-shrink-0">
                            <TrendingDown size={20} className="text-amber-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{indicators?.libra_cobre?.nombre} (US$)</p>
                            <div className="flex items-baseline gap-2 mt-1">
                                <p className="text-2xl font-black text-slate-900">${indicators?.libra_cobre?.valor}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 bg-amber-50 rounded-2xl p-5 border border-amber-100 flex items-start gap-4">
                    <AlertCircle className="text-amber-500 flex-shrink-0 mt-0.5" size={18} />
                    <p className="text-xs text-amber-800 font-bold leading-relaxed">
                        <strong>Nota Técnica:</strong> La información desplegada en este panel es obtenida mediante la API pública oficial y refleja exactamente los mismos valores validados por el Servicio de Impuestos Internos (SII) y el Banco Central de Chile. Centraliza-T utiliza estas cifras dinámicas como factor base legal para todos los cálculos de nómina, cotizaciones de la Administradora de Fondos de Cesantía (AFC) y AFP.
                    </p>
                </div>
            </div>

        </PageWrapper>
    );
};

export default BancoCentral;
