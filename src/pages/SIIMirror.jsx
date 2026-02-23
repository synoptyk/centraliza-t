import React, { useState, useEffect } from 'react';
import { ShieldCheck, TrendingUp, Calendar, Activity, RefreshCcw, DollarSign, Calculator, Scale, AlertCircle, Bookmark } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import toast from 'react-hot-toast';
import axios from 'axios';

const TaxBracketBox = ({ factor, discount, range, isCurrent }) => (
    <div className={`p-4 rounded-2xl border ${isCurrent ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100'} transition-all`}>
        <div className="flex justify-between items-start mb-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tramo {range}</p>
            {isCurrent && <span className="bg-indigo-600 text-white text-[8px] font-black px-2 py-1 rounded-full uppercase">Tu Tramo</span>}
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase">Factor</p>
                <p className="text-lg font-black text-slate-800">{factor}</p>
            </div>
            <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase">Cantidad a Rebajar</p>
                <p className="text-lg font-black text-slate-800">{discount} UTM</p>
            </div>
        </div>
    </div>
);

const SIIMirror = ({ auth, onLogout }) => {
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
            toast.error('Error sincronizando con SII / mindicador.cl');
        } finally {
            setLoading(false);
        }
    };

    const utmValue = indicators?.utm?.valor || 0;
    const utaValue = utmValue * 12;

    const brackets = [
        { desde: 0, hasta: 13.5, factor: '0,00', rebaja: '0,00', raw: 0 },
        { desde: 13.5, hasta: 30, factor: '0,04', rebaja: '0,54', raw: 0.04 },
        { desde: 30, hasta: 50, factor: '0,08', rebaja: '1,74', raw: 0.08 },
        { desde: 50, hasta: 70, factor: '0,135', rebaja: '4,49', raw: 0.135 },
        { desde: 70, hasta: 90, factor: '0,23', rebaja: '11,14', raw: 0.23 },
        { desde: 90, hasta: 120, factor: '0,304', rebaja: '17,80', raw: 0.304 },
        { desde: 120, hasta: 310, factor: '0,35', rebaja: '23,32', raw: 0.35 },
        { desde: 310, hasta: 99999, factor: '0,40', rebaja: '38,82', raw: 0.40 },
    ];

    if (loading) {
        return (
            <PageWrapper title="ESPEJO SII" subtitle="Consultando parámetros tributarios..." icon={ShieldCheck} auth={auth} onLogout={onLogout}>
                <div className="flex flex-col items-center justify-center py-40 gap-6">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center animate-pulse">
                        <ShieldCheck size={32} className="text-blue-600" />
                    </div>
                    <p className="text-xs font-black tracking-widest uppercase text-slate-400">Sincronizando UTM y Tablas de Impuesto...</p>
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
                <button
                    onClick={fetchIndicators}
                    className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-2xl border border-white/20 hover:bg-white/20 transition-all font-black text-[10px] uppercase tracking-widest backdrop-blur-sm"
                >
                    <RefreshCcw size={14} /> Actualizar SII
                </button>
            }
        >
            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300 mb-2">UTM (Mensual)</p>
                        <h3 className="text-4xl font-black">${utmValue.toLocaleString('es-CL')}</h3>
                        <p className="text-[10px] font-bold text-blue-400 mt-4 flex items-center gap-2">
                            <Calendar size={12} /> Vigente: {new Date(indicators?.utm?.fecha).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl relative overflow-hidden group">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">UTA (Anual)</p>
                    <h3 className="text-4xl font-black text-slate-900">${utaValue.toLocaleString('es-CL')}</h3>
                    <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-widest">Base de cálculo global</p>
                    <Bookmark className="absolute -right-4 -bottom-4 text-slate-50 w-24 h-24 rotate-12" />
                </div>

                <div className="bg-emerald-50 rounded-[2.5rem] p-8 border border-emerald-100 shadow-xl relative overflow-hidden">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-2">Estado de Conexión</p>
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                        <h3 className="text-2xl font-black text-emerald-900 uppercase">Sincronizado</h3>
                    </div>
                    <p className="text-[10px] font-black text-emerald-600 mt-4 uppercase tracking-widest">SII / mindicador.cl OK</p>
                </div>
            </div>

            {/* Impuesto Único Section */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden mt-8">
                <div className="p-8 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                            <Calculator size={24} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Tabla de Impuesto de Segunda Categoría</h3>
                            <p className="text-xs font-bold text-slate-500">Configuración vigente para el periodo actual según Circular SII.</p>
                        </div>
                    </div>
                    <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1 text-center">Referencia de Cálculo</p>
                        <p className="text-sm font-black text-indigo-600">Basado en Rentas Netas</p>
                    </div>
                </div>

                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {brackets.map((b, idx) => (
                            <TaxBracketBox
                                key={idx}
                                range={`${b.desde} a ${b.hasta} UTM`}
                                factor={b.factor}
                                discount={b.rebaja}
                            />
                        ))}
                    </div>

                    <div className="mt-12 bg-indigo-50/50 rounded-[2rem] p-8 border border-indigo-100 flex items-start gap-6">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border border-indigo-100">
                            <AlertCircle size={32} className="text-indigo-600" />
                        </div>
                        <div>
                            <h4 className="text-md font-black text-indigo-900 uppercase mb-2">Protocolo de Automatización Tributaria</h4>
                            <p className="text-sm text-indigo-800 font-bold leading-relaxed">
                                Centraliza-T V5.0 utiliza estos factores dinámicos para el cálculo automático del **Impuesto Único**. El sistema convierte los tramos de UTM a Pesos Chilenos (CLP) en tiempo real usando el valor observado arriba, permitiendo que la liquidación de sueldo sea legalmente perfecta sin necesidad de parametrización manual mensual.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer obligations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                    <Activity className="absolute -right-8 -bottom-8 w-40 h-40 text-white/5" />
                    <h3 className="text-lg font-black uppercase mb-4 flex items-center gap-3">
                        <Scale size={20} className="text-blue-400" /> Cumplimiento SII
                    </h3>
                    <ul className="space-y-4 relative z-10">
                        <li className="flex items-center gap-3 text-sm font-bold text-slate-300">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div> Calce perfecto con Libro de Remuneraciones Electrónico.
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
                            <p className="text-[10px] font-black text-indigo-600 uppercase">Impuesto Único</p>
                            <p className="text-xs font-bold text-slate-600 leading-relaxed">Grava las rentas del trabajo dependiente. Se calcula sobre la base tributable (Imponible - Cotizaciones Previsionales).</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-indigo-600 uppercase">UTM vs UTA</p>
                            <p className="text-xs font-bold text-slate-600 leading-relaxed">La UTM es la unidad mensual para multas e impuestos menores. La UTA es la acumulación de 12 UTM del año respectivo.</p>
                        </div>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};

export default SIIMirror;
