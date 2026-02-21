import React, { useState } from 'react';
import { Smartphone, Globe } from 'lucide-react';
import { COUNTRIES } from '../utils/intlUtils';

const InternationalInput = ({
    label,
    value,
    onChange,
    type = 'text',
    name,
    placeholder,
    selectedCountry,
    onCountryChange,
    icon: Icon = Smartphone,
    isPhone = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const country = COUNTRIES.find(c => c.code === selectedCountry) || COUNTRIES[0];

    return (
        <div className="space-y-2">
            {label && <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>}
            <div className="relative group">
                {/* Country Selector for Phone or standalone */}
                {(isPhone || !label) && (
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10">
                        <button
                            type="button"
                            onClick={() => setIsOpen(!isOpen)}
                            className="flex items-center gap-1 px-3 py-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl border border-white/5 transition-all outline-none"
                        >
                            <span className="text-lg">{country.flag}</span>
                            {isPhone && <span className="text-[10px] font-bold text-slate-400">{country.prefix}</span>}
                        </button>

                        {isOpen && (
                            <div className="absolute top-full left-0 mt-2 w-64 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in duration-200">
                                <div className="max-h-60 overflow-y-auto py-2">
                                    {COUNTRIES.map((c) => (
                                        <button
                                            key={c.code}
                                            type="button"
                                            onClick={() => {
                                                onCountryChange(c.code);
                                                setIsOpen(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                                        >
                                            <span className="text-xl">{c.flag}</span>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-white">{c.name}</span>
                                                <span className="text-[9px] text-slate-500 font-medium">
                                                    {isPhone ? c.prefix : c.taxIdName}
                                                </span>
                                            </div>
                                            {selectedCountry === c.code && (
                                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {!isPhone && !onCountryChange && <Icon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />}

                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder || (isPhone ? "9 1234 5678" : country.placeholder)}
                    className={`w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 pr-6 text-sm focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-white font-medium ${isPhone ? 'pl-28' : (onCountryChange ? 'pl-28' : 'pl-12')
                        }`}
                    required
                />
            </div>
        </div>
    );
};

export default InternationalInput;
