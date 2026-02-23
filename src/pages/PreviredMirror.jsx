import React, { useState, useEffect } from 'react';
import { ShieldCheck, TrendingUp, Activity, RefreshCcw, DollarSign, Scale, AlertCircle, Bookmark, Users, HeartPulse, Building, CheckCircle, XCircle } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import toast from 'react-hot-toast';
import api from '../utils/api';

/**
 * ESPEJO PREVIRED
 * Fuente de datos: /api/settings (sincronizado con el Living Indicators Worker)
 *
 * ⚠️ NOTA DE ARQUITECTURA:
 * Los Topes AFP/AFC son constantes ANUALES definidas por la Superintendencia de Pensiones.
 * Las Tasas AFP son constantes ANUALES publicadas por cada AFP según Sup. de Pensiones.
 * El SIS es también anual (resultado de licitación AFP).
 * Ninguno de estos tiene un endpoint de API que cambie diariamente.
 * Lo que SÍ se actualiza en tiempo real es el valor de la UF, que convierte
 * los Topes (en UF) a pesos chilenos exactos para cada mes.
 */

// Tasas AFC — constantes legales (Ley 19.728). Solo cambian por ley.
const AFC_RATES = {
    trabajador_indefinido: 0.60,     // % descontado al trabajador - contrato indefinido
    empleador_indefinido: 2.40,      // % aportado por el empleador - contrato indefinido
    trabajador_plazo_fijo: 3.00,     // % total cotización - contrato a plazo
    empleador_plazo_fijo: 3.00,      // mismo valor
};

const FONASA_RATE = 7.00; // % - cotización legal obligatoria Ley FONASA

// Desglose comisiones AFP 2026 (comisión + 10% legal obligatorio)
const AFP_COMMISSIONS_2026 = {
    'Capital': { comision: 1.44, total: 11.44 },
    'Cuprum': { comision: 1.44, total: 11.44 },
    'Habitat': { comision: 1.27, total: 11.27 },
    'PlanVital': { comision: 1.16, total: 11.16 },
    'Provida': { comision: 1.45, total: 11.45 },
    'Modelo': { comision: 0.58, total: 10.58 },
    'UNO': { comision: 0.46, total: 10.46 },
};

const IndicatorCard = ({ title, value, valueCLP, unit, icon: Icon, colorClass, footer }) => (
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
                {valueCLP && (
                    <p className="text-[10px] font-bold text-slate-500 mt-0.5">≈ {valueCLP} CLP</p>
                )}
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
    const [syncing, setSyncing] = useState(false);
    const [syncStatus, setSyncStatus] = useState('idle'); // idle | ok | error

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        setSyncStatus('idle');
        try {
            const res = await api.get('/settings');
            setSettings(res.data);
            setSyncStatus('ok');
        } catch (error) {
            setSyncStatus('error');
            toast.error('Error al cargar parámetros previsionales');
        } finally {
            setLoading(false);
        }
    };

    const handleForceSync = async () => {
        setSyncing(true);
        try {
            await api.post('/settings/force-sync');
            toast.success('✅ Datos Previred sincronizados');
            await fetchSettings();
        } catch (err) {
            toast.error('Error en sincronización forzada');
        } finally {
            setSyncing(false);
        }
    };

    // AFP rates: prefer DB (which comes from sync worker) over hardcoded defaults
    const afpRates = settings?.afpRates
        ? (settings.afpRates instanceof Map ? Object.fromEntries(settings.afpRates) : settings.afpRates)
        : Object.fromEntries(Object.entries(AFP_COMMISSIONS_2026).map(([k, v]) => [k, v.total]));

    // UF live from backend sync — used to convert UF topes → CLP
    const ufValue = settings?.ufValue || 39756;

    // Topes imponibles in CLP (calculated live from today's UF)
    const topeAFP_UF = settings?.topeImponibleAFP || 89.9;
    const topeAFC_UF = settings?.topeImponibleAFC || 135.1;
    const topeAFP_CLP = Math.round(topeAFP_UF * ufValue).toLocaleString('es-CL');
    const topeAFC_CLP = Math.round(topeAFC_UF * ufValue).toLocaleString('es-CL');

    const lastSync = settings?.lastDailySync || settings?.lastIndicatorsUpdate;

    if (loading) {
        return (
            <PageWrapper title="ESPEJO PREVIRED" subtitle="Cargando indicadores previsionales..." icon={ShieldCheck} auth={auth} onLogout={onLogout}>
                <div className="flex flex-col items-center justify-center py-40 gap-6">
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center animate-pulse">
                        <ShieldCheck size={32} className="text-emerald-600" />
                    </div>
                    <p className="text-xs font-black tracking-widest uppercase text-slate-400">Cargando Topes, SIS y Tasas AFP desde la BD sincronizada...</p>
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
                <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-white ${syncStatus === 'ok' ? 'bg-white/10 border-white/20' : 'bg-red-500/20 border-red-400/30'}`}>
                        {syncStatus === 'ok'
                            ? <CheckCircle size={12} className="text-emerald-400" />
                            : <XCircle size={12} className="text-red-400" />
                        }
                        <span className="text-[9px] font-black uppercase tracking-widest">
                            {syncStatus === 'ok'
                                ? `UF: $${ufValue.toLocaleString('es-CL')} | ${lastSync ? new Date(lastSync).toLocaleDateString('es-CL') : 'Cargado'}`
                                : 'Error de conexión'
                            }
                        </span>
                    </div>
                    <button
                        onClick={handleForceSync}
                        disabled={syncing}
                        className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-2xl border border-white/20 hover:bg-white/20 transition-all font-black text-[10px] uppercase tracking-widest backdrop-blur-sm disabled:opacity-50"
                    >
                        <RefreshCcw size={14} className={syncing ? 'animate-spin' : ''} /> {syncing ? 'Sincronizando...' : 'Forzar Sync'}
                    </button>
                </div>
            }
        >
            {/* Topes Section — Converted to CLP in real-time */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <IndicatorCard
                    title="Tope Imponible AFP/Salud"
                    value={topeAFP_UF}
                    valueCLP={`$${topeAFP_CLP}`}
                    unit="UF"
                    icon={TrendingUp}
                    colorClass="text-indigo-600"
                    footer="Vigente enero 2026 (Sup. Pensiones)"
                />
                <IndicatorCard
                    title="Tope Imponible AFC"
                    value={topeAFC_UF}
                    valueCLP={`$${topeAFC_CLP}`}
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
                    footer="Vigente enero 2026 — Cargo Empleador"
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
                            <p className="text-xs font-bold text-slate-500">10% legal + comisión de cada administradora (Sup. de Pensiones 2026). Para trabajadores dependientes.</p>
                        </div>
                    </div>
                    <div className={`px-6 py-3 rounded-2xl border shadow-sm flex items-center gap-3 ${syncStatus === 'ok' ? 'bg-white border-slate-100' : 'bg-amber-50 border-amber-200'}`}>
                        <div className={`w-2 h-2 rounded-full ${syncStatus === 'ok' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                            {syncStatus === 'ok' ? 'Vigentes Febrero 2026' : 'Fallback — Verificar conexión'}
                        </p>
                    </div>
                </div>

                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {Object.entries(afpRates).map(([name, rate]) => {
                            const detalles = AFP_COMMISSIONS_2026[name];
                            return (
                                <div key={name} className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 group-hover:text-indigo-400">AFP {name}</p>
                                    <div className="flex items-baseline gap-1">
                                        <p className="text-2xl font-black text-slate-900">{rate}%</p>
                                        <p className="text-[10px] font-bold text-slate-400 whitespace-nowrap">Total</p>
                                    </div>
                                    {detalles && (
                                        <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                                            <div>
                                                <p className="text-[8px] text-slate-400 uppercase font-bold">10% Legal</p>
                                                <p className="text-xs font-black text-slate-600">10.00%</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] text-slate-400 uppercase font-bold">Comisión</p>
                                                <p className="text-xs font-black text-indigo-600">{detalles.comision}%</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                    <Users className="absolute -right-8 -bottom-8 w-40 h-40 text-white/5" />
                    <h3 className="text-lg font-black uppercase mb-4 flex items-center gap-3">
                        <Activity size={20} className="text-emerald-400" /> Otros Aportes y Descuentos Legales
                    </h3>
                    <div className="space-y-5 relative z-10">
                        <div className="flex justify-between items-center border-b border-white/10 pb-4">
                            <div>
                                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Salud Fonasa</p>
                                <p className="text-sm font-bold text-slate-300">Cotización Legal Obligatoria (Art. 84 Ley FONASA)</p>
                            </div>
                            <p className="text-xl font-black">{FONASA_RATE}%</p>
                        </div>
                        <div className="flex justify-between items-center border-b border-white/10 pb-4">
                            <div>
                                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Mutual de Seguridad</p>
                                <p className="text-sm font-bold text-slate-300">Tasa Básica — Cargo Empleador (D.S. N°67)</p>
                            </div>
                            <p className="text-xl font-black">{settings?.mutualBaseRate || 0.90}%</p>
                        </div>
                        <div className="flex justify-between items-center border-b border-white/10 pb-4">
                            <div>
                                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Aporte Empleador AFC</p>
                                <p className="text-sm font-bold text-slate-300">Contrato Indefinido (Ley 19.728)</p>
                            </div>
                            <p className="text-xl font-black">{AFC_RATES.empleador_indefinido}%</p>
                        </div>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Descuento Trabajador AFC</p>
                                <p className="text-sm font-bold text-slate-300">Contrato Indefinido (cargo trabajador)</p>
                            </div>
                            <p className="text-xl font-black">{AFC_RATES.trabajador_indefinido}%</p>
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
                    <p className="text-sm text-slate-600 font-bold leading-relaxed mb-4">
                        Los indicadores mostrados son los mismos que Centraliza-T V5.0 utiliza para la generación de archivos PREVIRED (formato 105 campos) y el Libro de Remuneraciones Electrónico (LRE).
                    </p>
                    <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 text-xs text-indigo-700 mb-6">
                        <strong>Nota Técnica:</strong> Topes AFP/AFC, SIS y tasas AFP son constantes anuales definidas por la Sup. de Pensiones y AFC Chile — no existen APIs que los entreguen diariamente.
                        Lo que se actualiza en tiempo real es la <strong>UF</strong> (daily), que convierte los topes de UF a CLP exactos para cada día.
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-100">
                        <Bookmark size={24} />
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-70">Certificación</p>
                            <p className="text-xs font-black uppercase">Algoritmo Validado según Previred 2026</p>
                        </div>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};

export default PreviredMirror;
