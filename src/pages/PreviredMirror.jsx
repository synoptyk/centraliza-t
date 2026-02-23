import React, { useState, useEffect } from 'react';
import { ShieldCheck, TrendingUp, Calendar, Activity, RefreshCcw, DollarSign, Calculator, Scale, AlertCircle, Bookmark, Users, HeartPulse, Building } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import toast from 'react-hot-toast';
import api from '../utils/api';

const IndicatorCard = ({ title, value, unit, icon: Icon, colorClass, footer }) => (
    <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-xl hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden group">
        <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-5 blur-2xl transition-all group-hover:scale-150 ${colorClass.replace('text-', 'bg-')}`}></div>
        <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorClass.replace('text-', 'bg-').replace('600', '50/50')} border border-slate-100`}>
                <Icon size={24} className={colorClass} />
            </div>
            <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{title}</h3>
                <div className="flex items-baseline gap-1">
                    <p className="text-2xl font-black text-slate-900">{value}</p>
                    <p className="text-xs font-bold text-slate-400">{unit}</p>
                </div>
            </div>
        </div>
        <div className="pt-4 border-t border-slate-50 relative z-10">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Activity size={10} className={colorClass} /> {footer}
            </p>
        </div>
    </div>
);

const PreviredMirror = ({ auth, onLogout }) => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await api.get('/settings');
            setSettings(res.data);
        } catch (error) {
            toast.error('Error al cargar parámetros previsionales');
        } finally {
            setLoading(false);
        }
    };

    const afpRates = settings?.afpRates
        ? (settings.afpRates instanceof Map ? Object.fromEntries(settings.afpRates) : settings.afpRates)
        : {
            'Capital': 11.44,
            'Cuprum': 11.44,
            'Habitat': 11.27,
            'PlanVital': 11.16,
            'Provida': 11.45,
            'Modelo': 10.58,
            'UNO': 10.46  // 2026: 0.46% comisión + 10% legal
        };

    if (loading) {
        return (
            <PageWrapper title="ESPEJO PREVIRED" subtitle="Cargando indicadores previsionales..." icon={ShieldCheck} auth={auth} onLogout={onLogout}>
                <div className="flex flex-col items-center justify-center py-40 gap-6">
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center animate-pulse">
                        <ShieldCheck size={32} className="text-emerald-600" />
                    </div>
                    <p className="text-xs font-black tracking-widest uppercase text-slate-400">Sincronizando Topes y Tasas AFP...</p>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper
            className="space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-32"
            title="ESPEJO PREVIRED"
            subtitle="Portal de Indicadores Previsionales y Seguridad Social. Datos sincronizados para el cumplimiento de Leyes Sociales."
            icon={ShieldCheck}
            auth={auth}
            onLogout={onLogout}
            headerActions={
                <button
                    onClick={fetchSettings}
                    className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-2xl border border-white/20 hover:bg-white/20 transition-all font-black text-[10px] uppercase tracking-widest backdrop-blur-sm"
                >
                    <RefreshCcw size={14} /> Sincronizar Tasas
                </button>
            }
        >
            {/* Topes Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <IndicatorCard
                    title="Tope Imponible AFP/Salud"
                    value={settings?.topeImponibleAFP || 89.9}
                    unit="UF"
                    icon={TrendingUp}
                    colorClass="text-indigo-600"
                    footer="Vigente enero 2026 (Sup. Pensiones)"
                />
                <IndicatorCard
                    title="Tope Imponible AFC"
                    value={settings?.topeImponibleAFC || 135.1}
                    unit="UF"
                    icon={Scale}
                    colorClass="text-emerald-600"
                    footer="Seguro Cesantía 2026 (AFC Chile)"
                />
                <IndicatorCard
                    title="Seguro Invalidez (SIS)"
                    value={settings?.sisRate || 1.54}
                    unit="%"
                    icon={HeartPulse}
                    colorClass="text-rose-600"
                    footer="Vigente enero 2026 - Cargo Empleador"
                />
                <IndicatorCard
                    title="Ingreso Mínimo (IMM)"
                    value={`$${(settings?.sueldoMinimo || 539000).toLocaleString('es-CL')}`}
                    unit=""
                    icon={DollarSign}
                    colorClass="text-amber-600"
                    footer="Ley N°21.751 vigente 2026"
                />
            </div>

            {/* AFP Rates Table */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden mt-8">
                <div className="p-8 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                            <Building size={24} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Tasas de Cotización Obligatoria AFP</h3>
                            <p className="text-xs font-bold text-slate-500">Incluye 10% legal + comisión de cada administradora para trabajadores dependientes.</p>
                        </div>
                    </div>
                    <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Vigentes Febrero 2026</p>
                    </div>
                </div>

                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {Object.entries(afpRates).map(([name, rate]) => (
                            <div key={name} className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 group-hover:text-indigo-400">AFP {name}</p>
                                <div className="flex items-baseline gap-1">
                                    <p className="text-2xl font-black text-slate-900">{rate}%</p>
                                    <p className="text-[10px] font-bold text-slate-400 whitespace-nowrap">Rem. Imponible</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                    <Users className="absolute -right-8 -bottom-8 w-40 h-40 text-white/5" />
                    <h3 className="text-lg font-black uppercase mb-4 flex items-center gap-3">
                        <Activity size={20} className="text-emerald-400" /> Otros Descuentos Legales
                    </h3>
                    <div className="space-y-6 relative z-10">
                        <div className="flex justify-between items-center border-b border-white/10 pb-4">
                            <div>
                                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Salud Fonasa</p>
                                <p className="text-sm font-bold text-slate-300">Cotización Legal Obligatoria</p>
                            </div>
                            <p className="text-xl font-black">7.00%</p>
                        </div>
                        <div className="flex justify-between items-center border-b border-white/10 pb-4">
                            <div>
                                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Mutual de Seguridad</p>
                                <p className="text-sm font-bold text-slate-300">Tasa Básica (Cargo Empleador)</p>
                            </div>
                            <p className="text-xl font-black">{settings?.mutualBaseRate || 0.90}%</p>
                        </div>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Aporte Empleador AFC</p>
                                <p className="text-sm font-bold text-slate-300">Contrato Indefinido</p>
                            </div>
                            <p className="text-xl font-black">2.40%</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100">
                            <AlertCircle size={20} className="text-amber-500" />
                        </div>
                        <h3 className="text-lg font-black uppercase text-slate-900">Nota de Cumplimiento</h3>
                    </div>
                    <p className="text-sm text-slate-600 font-bold leading-relaxed space-y-4">
                        <span className="block mb-4">
                            Los indicadores mostrados en este espejo son los mismos que Centraliza-T V5.0 utiliza para la generación de archivos PREVIRED (formato 105 campos) y el Libro de Remuneraciones Electrónico (LRE).
                        </span>
                        <span className="block p-4 bg-indigo-50 rounded-2xl border border-indigo-100 text-xs text-indigo-700">
                            <strong>Actualizado Enero 2026:</strong> Tope AFP/Salud sube a <strong>89.9 UF</strong>, Cesantía a <strong>135.1 UF</strong>, y el SIS a <strong>1.54%</strong>. AFP UNO baja comisión a <strong>0.46%</strong>. Todos los motores de cálculo de Centraliza-T ya reflejan estos valores.
                        </span>
                    </p>
                    <div className="mt-8 flex items-center gap-4 p-4 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-100">
                        <Bookmark size={24} />
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-70">Certificación</p>
                            <p className="text-xs font-black uppercase">Algoritmo Validado según Previred v2024</p>
                        </div>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};

export default PreviredMirror;
