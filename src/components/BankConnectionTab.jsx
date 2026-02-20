import React, { useState } from 'react';
import {
    CreditCard,
    Lock,
    Smartphone,
    Globe,
    ShieldCheck,
    Zap,
    ArrowRight,
    Building2,
    DollarSign,
    Check
} from 'lucide-react';

const BankConnectionTab = () => {
    const [selectedProvider, setSelectedProvider] = useState('mercadopago');

    const ProviderCard = ({ id, name, icon: Icon, description, active }) => (
        <button
            onClick={() => setSelectedProvider(id)}
            className={`w-full p-8 rounded-[2rem] border-2 transition-all duration-500 text-left group relative overflow-hidden ${selectedProvider === id
                    ? 'border-indigo-500 bg-indigo-500/5 shadow-2xl shadow-indigo-500/10'
                    : 'border-white/5 bg-[#0f172a] hover:border-white/10'
                }`}
        >
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className={`p-4 rounded-2xl ${selectedProvider === id ? 'bg-indigo-500 text-white' : 'bg-white/5 text-slate-400'} transition-colors group-hover:scale-110 duration-500`}>
                        <Icon size={24} />
                    </div>
                    {active && <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>}
                </div>
                <h4 className="text-white font-black uppercase tracking-widest text-sm mb-2">{name}</h4>
                <p className="text-slate-500 text-[10px] font-bold leading-relaxed">{description}</p>
            </div>
            <div className={`absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity`}>
                <Icon size={120} />
            </div>
        </button>
    );

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h3 className="text-white font-black uppercase tracking-widest text-sm flex items-center gap-3">
                        <Lock className="text-indigo-400" size={18} /> Seguridad en Pasarelas
                    </h3>
                    <p className="text-slate-500 text-[10px] font-bold tracking-widest uppercase">Ecosistema Conectado v5.0 (Chile)</p>
                </div>
                <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-3">
                    <ShieldCheck className="text-emerald-500" size={14} />
                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Encriptación Bancaria Activa</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <ProviderCard
                    id="mercadopago"
                    name="Mercado Pago"
                    icon={Smartphone}
                    description="Integración oficial con Webpay, Tarjetas de Crédito y Débito. Depósito inmediato."
                    active={true}
                />
                <ProviderCard
                    id="transbank"
                    name="Transbank Webpay"
                    icon={CreditCard}
                    description="La red de pagos más grande de Chile. Flujo directo para cuentas comerciales."
                />
                <ProviderCard
                    id="transfer"
                    name="Transferencia Directa"
                    icon={Building2}
                    description="Configure sus datos bancarios para recepcionar pagos sin comisiones externas."
                />
            </div>

            {/* Configuration Form for Selected Provider */}
            <div className="bg-[#0f172a] border border-white/5 rounded-[2.5rem] p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-20 opacity-5 bg-emerald-500 rounded-bl-full"></div>

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20">
                    <div className="space-y-8">
                        <div>
                            <h4 className="text-white font-black uppercase tracking-[0.2em] text-lg mb-2">Configuración {selectedProvider === 'mercadopago' ? 'Mercado Pago' : 'Banco'}</h4>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Ingrese sus credenciales de integración para habilitar cobros en tiempo real.</p>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Public Key / API Key</label>
                                <input
                                    type="text"
                                    placeholder="APP_USR-XXXX-XXXX-XXXX"
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 px-6 text-white text-xs outline-none focus:border-indigo-500/50 transition-all font-mono"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Access Token</label>
                                <input
                                    type="password"
                                    placeholder="••••••••••••••••••••••••••••"
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 px-6 text-white text-xs outline-none focus:border-indigo-500/50 transition-all font-mono"
                                />
                            </div>
                        </div>

                        <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-2xl shadow-indigo-600/20 active:scale-95 flex items-center gap-3">
                            Probar Conexión <ArrowRight size={16} />
                        </button>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 space-y-6">
                            <h5 className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-3">
                                <Zap className="text-indigo-400" size={16} /> Beneficios de Integración
                            </h5>
                            <ul className="space-y-4">
                                {[
                                    'Conciliación bancaria automática cada 24 horas',
                                    'Activación inmediata de planes tras el pago',
                                    'Facturación electrónica automática (Opcional)',
                                    'Alertas de transacciones fallidas en tiempo real'
                                ].map((text, i) => (
                                    <li key={i} className="flex items-center gap-4 group">
                                        <div className="w-5 h-5 rounded flex items-center justify-center bg-emerald-500/20 text-emerald-500">
                                            <Check size={12} />
                                        </div>
                                        <span className="text-[11px] font-bold text-slate-400 group-hover:text-white transition-colors">{text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-6 flex gap-4">
                            <Lock className="text-amber-500 shrink-0" size={24} />
                            <p className="text-[10px] font-bold text-amber-500/80 leading-relaxed uppercase tracking-tighter">
                                CENTRALIZA-T nunca almacena sus claves de API en texto plano. Todos los tokens son encriptados con AES-256 antes de ser guardados en el ecosistema.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BankConnectionTab;
