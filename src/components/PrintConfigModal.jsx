import React, { useState } from 'react';
import { X, Layout, Maximize, Minimize, Type, Download, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PrintConfigModal = ({ isOpen, onClose, onConfirm, mode = 'download', title = "Configuración de Impresión" }) => {
    const [config, setConfig] = useState({
        format: 'A4',
        margin: '20mm',
        orientation: 'portrait',
        fitToPage: true,
        removeWatermarks: true
    });

    const applyPageStyles = (cfg) => {
        // Remove existing custom style
        const existingStyle = document.getElementById('dynamic-print-style');
        if (existingStyle) existingStyle.remove();

        // Create new style tag
        const style = document.createElement('style');
        style.id = 'dynamic-print-style';
        style.innerHTML = `
            @media print {
                @page {
                    size: ${cfg.format};
                    margin: ${cfg.margin};
                }
                * {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
            }
        `;
        document.head.appendChild(style);
    };

    const handleConfirm = () => {
        applyPageStyles(config);
        onConfirm(config, mode);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden"
                >
                    <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
                                <Layout size={20} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{title}</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Personaliza el formato de salida</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-3 text-slate-400 hover:text-rose-500 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-10 space-y-8">
                        {/* Page Size */}
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Maximize size={12} /> Tamaño de Página
                            </p>
                            <div className="grid grid-cols-3 gap-3">
                                {['A4', 'Carta', 'Legal'].map(size => (
                                    <button
                                        key={size}
                                        onClick={() => setConfig({ ...config, format: size })}
                                        className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${config.format === size ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white text-slate-400 border-slate-100 hover:border-indigo-200'}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Margins */}
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Minimize size={12} /> Márgenes
                            </p>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { label: 'Normal', val: '20mm' },
                                    { label: 'Mínimo', val: '10mm' },
                                    { label: 'Ancho', val: '30mm' }
                                ].map(margin => (
                                    <button
                                        key={margin.label}
                                        onClick={() => setConfig({ ...config, margin: margin.val })}
                                        className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${config.margin === margin.val ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl' : 'bg-white text-slate-400 border-slate-100 hover:border-indigo-200'}`}
                                    >
                                        {margin.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Options */}
                        <div className="space-y-6 pt-4 border-t border-slate-50">
                            <label className="flex items-center justify-between cursor-pointer group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-50 rounded-xl text-slate-400 group-hover:text-indigo-500 transition-colors">
                                        <Type size={16} />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Eliminar marcas de agua</span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={config.removeWatermarks}
                                    onChange={(e) => setConfig({ ...config, removeWatermarks: e.target.checked })}
                                    className="w-5 h-5 accent-indigo-600"
                                />
                            </label>

                            <label className="flex items-center justify-between cursor-pointer group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-50 rounded-xl text-slate-400 group-hover:text-indigo-500 transition-colors">
                                        <Maximize size={16} />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Ajustar a 1 página</span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={config.fitToPage}
                                    onChange={(e) => setConfig({ ...config, fitToPage: e.target.checked })}
                                    className="w-5 h-5 accent-indigo-600"
                                />
                            </label>
                        </div>
                    </div>

                    <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
                        <button
                            onClick={onClose}
                            className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="flex-1 py-4 bg-slate-900 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
                        >
                            {mode === 'print' ? <Printer size={16} /> : <Download size={16} />}
                            {mode === 'print' ? 'Iniciar Impresión' : 'Confirmar Selección'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default PrintConfigModal;
