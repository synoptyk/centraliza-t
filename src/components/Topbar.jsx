import React from 'react';
import { motion } from 'framer-motion';
import { LogOut, Menu } from 'lucide-react';
import NotificationCenter from './NotificationCenter';

const Topbar = ({ title, subtitle, icon: Icon, actions, auth, onLogout }) => {
    return (
        <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 left-0 md:left-80 z-40 flex flex-col no-print"
        >
            {/* Mini Promo Banner */}
            <div className="w-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white text-[9px] sm:text-[10px] md:text-xs font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] py-1.5 px-2 text-center z-50 flex justify-center items-center gap-1.5 sm:gap-2 border-b border-white/10 shadow-md overflow-hidden">
                <span className="text-sm">🥵</span>
                <span className="opacity-80 truncate">Deja de acumular diplomas de software y</span>
                <span className="text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded border border-emerald-400/20 shrink-0">CENTRALIZA-T</span>
                <span className="text-sm">🚀</span>
            </div>

            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 opacity-95 backdrop-blur-md shadow-lg shadow-indigo-900/10"></div>
                <div className="absolute inset-x-0 bottom-0 h-px bg-white/10"></div>

                <div className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3 sm:gap-6">
                        <button
                            onClick={() => window.dispatchEvent(new Event('open-mobile-menu'))}
                            className="md:hidden p-2 -ml-2 text-white/80 hover:text-white transition-colors"
                        >
                            <Menu size={24} />
                        </button>
                        {Icon && (
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10 shadow-inner shrink-0">
                                <Icon className="text-white" size={16} />
                            </div>
                        )}
                        <div className="flex flex-col min-w-0">
                            <h1 className="text-sm sm:text-lg font-black text-white uppercase tracking-tight leading-none mb-0.5 truncate">
                                {title}
                            </h1>
                            {subtitle && (
                                <p className="text-[8px] sm:text-[10px] font-bold text-indigo-200 uppercase tracking-widest truncate hidden xs:block">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {actions && (
                            <div className="flex items-center gap-3 border-r border-white/10 pr-4 mr-2">
                                {actions}
                            </div>
                        )}

                        <div className="flex items-center gap-3">
                            {auth && <NotificationCenter auth={auth} />}
                            <button
                                onClick={onLogout}
                                className="p-3 text-white/60 hover:text-white hover:bg-rose-600/20 rounded-2xl transition-all group/logout"
                                title="Finalizar Sesión"
                            >
                                <LogOut size={20} className="group-hover:scale-110 transition-all" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Topbar;
