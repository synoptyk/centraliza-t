import React, { useState, useEffect } from 'react';
import { ShieldCheck, TrendingUp, Calendar, Activity, RefreshCcw, DollarSign, Calculator, Scale, AlertCircle, Bookmark, CheckCircle, XCircle } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import toast from 'react-hot-toast';
import axios from 'axios';
import api from '../utils/api';

/**
 * Tabla de tramos del Impuesto Único de Segunda Categoría
 * Fuente: Circular SII sobre Art. 43 N°1 Ley de la Renta
 *
 * ⚠️ NOTA IMPORTANTE: Estos factores y cantidades a rebajar son
 * CONSTANTES LEGALES definidas en la Ley de la Renta y solo cambian
 * mediante una modificación legal del Congreso (muy poco frecuente).
 * Lo que SÍ cambia mensualmente es el VALOR DE LA UTM, que convierte
 * estos tramos de UTM → Pesos Chilenos. El valor de la UTM se obtiene
 * en tiempo real desde mindicador.cl.
 *
 * Vigentes a la fecha: Sin cambios desde reforma tributaria 2018.
 */
const TRAMOS_IMPUESTO_SEGUNDA_CATEGORIA = [
    { desde: 0, hasta: 13.5, factor: 0.00, rebaja: 0.000, label: 'Exento' },
    { desde: 13.5, hasta: 30, factor: 0.04, rebaja: 0.540 },
    { desde: 30, hasta: 50, factor: 0.08, rebaja: 1.740 },
    { desde: 50, hasta: 70, factor: 0.135, rebaja: 4.490 },
    { desde: 70, hasta: 90, factor: 0.23, rebaja: 11.14 },
    { desde: 90, hasta: 120, factor: 0.304, rebaja: 17.80 },
    { desde: 120, hasta: 310, factor: 0.35, rebaja: 23.32 },
    { desde: 310, hasta: 99999, factor: 0.40, rebaja: 38.82 },
];

const TaxBracketRow = ({ tramo, utmValue, index }) => {
    const desdeCLP = tramo.desde * utmValue;
    const hastaCLP = tramo.hasta === 99999 ? null : tramo.hasta * utmValue;

    return (
        <div className={`p-5 rounded-2xl border transition-all hover:shadow-md ${tramo.factor === 0 ? 'bg-green-50 border-green-100' : index % 2 === 0 ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-100'}`}>
            <div className="flex justify-between items-start mb-3">
                <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                        Tramo {index + 1}
                    </p>
                    <p className="text-xs font-bold text-slate-600">
                        {tramo.desde} – {tramo.hasta === 99999 ? '∞' : tramo.hasta} UTM
                    </p>
                    {utmValue > 0 && (
                        <p className="text-[9px] text-slate-400 font-bold mt-0.5">
                            ${desdeCLP.toLocaleString('es-CL')} – {hastaCLP ? `$${hastaCLP.toLocaleString('es-CL')}` : 'Sin tope'}
                        </p>
                    )}
                </div>
                <div className="text-right">
                    <p className={`text-xl font-black ${tramo.factor === 0 ? 'text-green-600' : 'text-indigo-700'}`}>
                        {tramo.label || `${(tramo.factor * 100).toFixed(1)}%`}
                    </p>
                </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-between">
                <div>
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Cantidad a Rebajar</p>
                    <p className="text-xs font-black text-slate-700">{tramo.rebaja.toFixed(3)} UTM</p>
                </div>
                {utmValue > 0 && (
                    <div className="text-right">
                        <p className="text-[8px] font-bold text-slate-400 uppercase">En CLP</p>
                        <p className="text-xs font-black text-slate-700">${(tramo.rebaja * utmValue).toLocaleString('es-CL')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const SIIMirror = ({ auth, onLogout }) => {
    const [utmData, setUtmData] = useState(null);
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [syncStatus, setSyncStatus] = useState('idle'); // idle | ok | error

    useEffect(() => {
        fetchData();
    }, []);

    // Formatea la fecha actual como DD-MM-YYYY para mindicador.cl
    const getTodayStr = () => {
        const now = new Date();
        const dd = String(now.getDate()).padStart(2, '0');
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const yyyy = now.getFullYear();
        return `${dd}-${mm}-${yyyy}`;
    };

    const fetchData = async () => {
        setLoading(true);
        setSyncStatus('idle');
        try {
            const hoy = getTodayStr();

            // UTM: Consulta por fecha EXACTA para evitar datos stale del genérico
            // La UTM cambia mensualmente, pero el endpoint genérico puede devolver meses anteriores
            const [utmRes, settingsRes] = await Promise.all([
                axios.get(`https://mindicador.cl/api/utm/${hoy}`),
                api.get('/settings')  // Authenticated via JWT token
            ]);

            const utmSerie = utmRes.data?.serie;
            if (utmSerie && utmSerie.length > 0) {
                setUtmData(utmSerie[0]);
            }
            setSettings(settingsRes.data);
            setSyncStatus('ok');
        } catch (error) {
            setSyncStatus('error');
            toast.error('Error sincronizando con SII / mindicador.cl');
        } finally {
            setLoading(false);
        }
    };

    const handleForceSync = async () => {
        setSyncing(true);
        try {
            await api.post('/settings/force-sync');
            toast.success('✅ Sincronización SII Completada');
            await fetchData();
        } catch (err) {
            toast.error('Error en sincronización forzada');
        } finally {
            setSyncing(false);
        }
    };

    // Prioriza: valor del settings (sincronizado por el worker) > valor del API directo > 0
    const utmValue = settings?.utmValue || utmData?.valor || 0;
    const utaValue = utmValue * 12;

    if (loading) {
        return (
            <PageWrapper title="ESPEJO SII" subtitle="Consultando parámetros tributarios..." icon={ShieldCheck} auth={auth} onLogout={onLogout}>
                <div className="flex flex-col items-center justify-center py-40 gap-6">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center animate-pulse">
                        <ShieldCheck size={32} className="text-blue-600" />
                    </div>
                    <p className="text-xs font-black tracking-widest uppercase text-slate-400">Sincronizando UTM y Tabla de Impuesto con fecha de hoy...</p>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper
            className="space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-32"
            title="ESPEJO SII"
            subtitle="Portal de Parámetros Tributarios Oficiales para el Cálculo de Impuesto Único de Segunda Categoría."
            icon={ShieldCheck}
            auth={auth}
            onLogout={onLogout}
            headerActions={
                <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-white ${syncStatus === 'ok' ? 'bg-white/10 border-white/20' : 'bg-red-500/20 border-red-400/30'}`}>
                        <div className={`w-2 h-2 rounded-full ${syncStatus === 'ok' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></div>
                        <span className="text-[9px] font-black uppercase tracking-widest">
                            {syncStatus === 'ok' ? `UTM al día: ${getTodayStr()}` : 'Error de conexión'}
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
            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300 mb-2">UTM Vigente (Mensual)</p>
                        <h3 className="text-4xl font-black">${utmValue.toLocaleString('es-CL')}</h3>
                        <p className="text-[10px] font-bold text-blue-400 mt-4 flex items-center gap-2">
                            <Calendar size={12} />
                            {utmData?.fecha
                                ? `Publicada: ${new Date(utmData.fecha).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}`
                                : `Fuente: BD sincronizada ${settings?.lastMonthlySync ? new Date(settings.lastMonthlySync).toLocaleDateString('es-CL') : ''}`
                            }
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl relative overflow-hidden group">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">UTA (Anual = 12 UTM)</p>
                    <h3 className="text-4xl font-black text-slate-900">${utaValue.toLocaleString('es-CL')}</h3>
                    <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-widest">Base cálculo renta anual</p>
                    <Bookmark className="absolute -right-4 -bottom-4 text-slate-50 w-24 h-24 rotate-12" />
                </div>

                <div className={`rounded-[2.5rem] p-8 border shadow-xl relative overflow-hidden ${syncStatus === 'ok' ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${syncStatus === 'ok' ? 'text-emerald-600' : 'text-red-600'}`}>Estado de Conexión</p>
                    <div className="flex items-center gap-3">
                        {syncStatus === 'ok'
                            ? <CheckCircle size={28} className="text-emerald-500" />
                            : <XCircle size={28} className="text-red-500" />
                        }
                        <h3 className={`text-2xl font-black uppercase ${syncStatus === 'ok' ? 'text-emerald-900' : 'text-red-900'}`}>
                            {syncStatus === 'ok' ? 'Online' : 'Error'}
                        </h3>
                    </div>
                    <p className={`text-[10px] font-black mt-4 uppercase tracking-widest ${syncStatus === 'ok' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {syncStatus === 'ok' ? 'mindicador.cl → SII OK' : 'Usando último valor cacheado'}
                    </p>
                </div>
            </div>

            {/* Impuesto Único Table */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden mt-8">
                <div className="p-8 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                            <Calculator size={24} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Tabla de Impuesto Único — Segunda Categoría</h3>
                            <p className="text-xs font-bold text-slate-500">
                                Art. 43 N°1 Ley de la Renta. Los tramos son constantes legales; los montos en CLP se calculan en tiempo real con la UTM del día.
                            </p>
                        </div>
                    </div>
                    <div className="bg-indigo-600 text-white px-5 py-3 rounded-2xl text-right">
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-70">UTM hoy</p>
                        <p className="text-lg font-black">${utmValue.toLocaleString('es-CL')}</p>
                    </div>
                </div>

                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {TRAMOS_IMPUESTO_SEGUNDA_CATEGORIA.map((tramo, idx) => (
                            <TaxBracketRow key={idx} tramo={tramo} utmValue={utmValue} index={idx} />
                        ))}
                    </div>

                    <div className="mt-8 bg-blue-50/50 rounded-[2rem] p-6 border border-blue-100 flex items-start gap-4">
                        <AlertCircle size={24} className="text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-black text-blue-900 uppercase mb-1">Nota Técnica — Tramos vs UTM</h4>
                            <p className="text-xs text-blue-800 font-bold leading-relaxed">
                                Los <strong>factores y rebajas</strong> son constantes de ley (Art. 43 N°1) y no tienen un endpoint de API — solo el Congreso puede modificarlos.
                                Lo que se actualiza en tiempo real es el <strong>valor de la UTM</strong>, que transforma estos tramos en pesos chilenos exactos para cada mes.
                                Centraliza-T V5.0 usa la UTM de hoy (obtenida por fecha exacta desde mindicador.cl) para que el cálculo del Impuesto Único sea milimétrico.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                    <Activity className="absolute -right-8 -bottom-8 w-40 h-40 text-white/5" />
                    <h3 className="text-lg font-black uppercase mb-4 flex items-center gap-3">
                        <Scale size={20} className="text-blue-400" /> Cumplimiento SII
                    </h3>
                    <ul className="space-y-4 relative z-10">
                        <li className="flex items-center gap-3 text-sm font-bold text-slate-300">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div> Calce perfecto con Libro de Remuneraciones Electrónico (LRE).
                        </li>
                        <li className="flex items-center gap-3 text-sm font-bold text-slate-300">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div> Reportabilidad inmediata de retenciones de impuestos.
                        </li>
                        <li className="flex items-center gap-3 text-sm font-bold text-slate-300">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div> Preparado para Declaración Jurada 1887.
                        </li>
                    </ul>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl">
                    <h3 className="text-lg font-black uppercase text-slate-900 mb-4 flex items-center gap-3">
                        <Bookmark size={20} className="text-indigo-600" /> Glosario Técnico
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <p className="text-[10px] font-black text-indigo-600 uppercase">Impuesto Único de Segunda Categoría</p>
                            <p className="text-xs font-bold text-slate-600 leading-relaxed">Grava las rentas del trabajo dependiente. Se calcula sobre la base tributable neta (Bruto Imponible − Cotizaciones Previsionales).</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-indigo-600 uppercase">UTM vs UTA</p>
                            <p className="text-xs font-bold text-slate-600 leading-relaxed">La UTM (Unidad Tributaria Mensual) se actualiza cada mes. La UTA (Anual) es la suma de 12 UTM del año en curso.</p>
                        </div>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};

export default SIIMirror;
