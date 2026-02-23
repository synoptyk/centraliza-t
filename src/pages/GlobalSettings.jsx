import React, { useState, useEffect } from 'react';
import { Settings, Save, AlertCircle, TrendingUp, RefreshCcw, Activity, CalendarDays } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import api from '../utils/api';
import toast from 'react-hot-toast';

const GlobalSettings = ({ auth, onLogout }) => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await api.get('/settings');
            setSettings(res.data);
        } catch (error) {
            toast.error('Error al cargar configuraciones maestras');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/settings', settings);
            toast.success('Parámetros actualizados globalmente');
        } catch (error) {
            toast.error('Error al guardar configuraciones');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <PageWrapper title="PARÁMETROS LEGALES" icon={Settings} auth={auth} onLogout={onLogout}>
                <div className="flex justify-center items-center h-64"><RefreshCcw className="animate-spin text-indigo-500" size={32} /></div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper
            className="space-y-8 animate-in fade-in duration-500"
            title="PARÁMETROS LEGALES"
            subtitle="Configuración maestra de topes y leyes sociales de Nómina"
            icon={Settings}
            auth={auth}
            onLogout={onLogout}
        >
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
                <div className="p-8 border-b border-slate-100 bg-slate-50 flex items-center gap-4">
                    <AlertCircle className="text-amber-500" />
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                        Estas variables afectarán a <strong>todos</strong> los cálculos futuros de liquidaciones a nivel nacional. Asegure su exactitud según la normativa vigente (Ej. PreviRed).
                    </p>
                </div>
                <form onSubmit={handleSave} className="p-8 space-y-8">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Indicadores Oficiales */}
                        <div className="space-y-6 bg-indigo-50/50 p-6 rounded-[2rem] md:col-span-2 border border-indigo-100">
                            <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                                <h3 className="text-xs font-black uppercase tracking-widest text-indigo-900 flex items-center gap-2">
                                    <Activity size={16} /> Indicadores Oficiales (Banco Central)
                                </h3>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-600 bg-white px-3 py-1 rounded-full shadow-sm">
                                    <CalendarDays size={12} /> {settings?.lastIndicatorsUpdate ? new Date(settings.lastIndicatorsUpdate).toLocaleDateString('es-CL') : 'Generando Caché...'}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Unidad de Fomento (UF)</p>
                                    <p className="text-2xl font-black text-indigo-900">${settings?.ufValue?.toLocaleString('es-CL') || '0'}</p>
                                </div>
                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Unidad Tributaria (UTM)</p>
                                    <p className="text-2xl font-black text-indigo-900">${settings?.utmValue?.toLocaleString('es-CL') || '0'}</p>
                                </div>
                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Dólar Observado (USD)</p>
                                    <p className="text-2xl font-black text-emerald-700">${settings?.dolarValue?.toLocaleString('es-CL') || '0'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Básicos */}
                        <div className="space-y-6 bg-slate-50 p-6 rounded-[2rem]">
                            <h3 className="text-xs font-black uppercase tracking-widest text-indigo-900 border-b border-slate-200 pb-3">Remuneración Base</h3>

                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Ingreso Mínimo Mensual ($)</label>
                                <input
                                    type="number"
                                    name="sueldoMinimo"
                                    value={settings?.sueldoMinimo || ''}
                                    onChange={handleChange}
                                    className="w-full p-4 mt-1 bg-white rounded-2xl border-none text-xl font-black text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                                />
                                <p className="text-[8px] text-slate-400 mt-2 uppercase font-bold ml-2">Afecta el tope de la Gratificación Legal (4.75 IMM).</p>
                            </div>
                        </div>

                        {/* Topes */}
                        <div className="space-y-6 bg-slate-50 p-6 rounded-[2rem]">
                            <h3 className="text-xs font-black uppercase tracking-widest text-indigo-900 border-b border-slate-200 pb-3">Topes Imponibles (UF)</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Tope AFP/Salud</label>
                                    <input
                                        type="number"
                                        name="topeImponibleAFP"
                                        step="0.1"
                                        value={settings?.topeImponibleAFP || ''}
                                        onChange={handleChange}
                                        className="w-full p-4 mt-1 bg-white rounded-2xl border-none text-xl font-black text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Tope AFC</label>
                                    <input
                                        type="number"
                                        name="topeImponibleAFC"
                                        step="0.1"
                                        value={settings?.topeImponibleAFC || ''}
                                        onChange={handleChange}
                                        className="w-full p-4 mt-1 bg-white rounded-2xl border-none text-xl font-black text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Costos Patronales */}
                        <div className="space-y-6 bg-slate-50 p-6 rounded-[2rem] md:col-span-2">
                            <h3 className="text-xs font-black uppercase tracking-widest text-rose-900 border-b border-rose-200 pb-3">Costos Patronales (Cargo Empleador)</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">SIS - Seg. Invalidez y Sobrevivencia (%)</label>
                                    <input
                                        type="number"
                                        name="sisRate"
                                        step="0.01"
                                        value={settings?.sisRate || ''}
                                        onChange={handleChange}
                                        className="w-full p-4 mt-1 bg-white rounded-2xl border-none text-xl font-black text-rose-700 focus:ring-2 focus:ring-rose-500 outline-none shadow-sm"
                                    />
                                    <p className="text-[8px] text-slate-400 mt-2 uppercase font-bold ml-2">Actualmente 1.49% adjudicado. Este monto no se le descuenta al trabajador.</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Mutual de Seguridad Tasa Base (%)</label>
                                    <input
                                        type="number"
                                        name="mutualBaseRate"
                                        step="0.01"
                                        value={settings?.mutualBaseRate || ''}
                                        onChange={handleChange}
                                        className="w-full p-4 mt-1 bg-white rounded-2xl border-none text-xl font-black text-rose-700 focus:ring-2 focus:ring-rose-500 outline-none shadow-sm"
                                    />
                                    <p className="text-[8px] text-slate-400 mt-2 uppercase font-bold ml-2">Base general según D.S. N°67. (Ej. 0.90%).</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-6 border-t border-slate-100">
                        <button
                            type="submit"
                            disabled={saving}
                            className={`px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all flex items-center gap-2 ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {saving ? <RefreshCcw className="animate-spin" size={16} /> : <Save size={16} />}
                            Guardar Parámetros Globales
                        </button>
                    </div>
                </form>
            </div>
        </PageWrapper>
    );
};

export default GlobalSettings;
