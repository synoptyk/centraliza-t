import React from 'react';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import NotificationCenter from './NotificationCenter';

const Topbar = ({ title, subtitle, icon: Icon, actions, auth, onLogout }) => {
    return (
        <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 left-80 z-40"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 opacity-95 backdrop-blur-md shadow-lg shadow-indigo-900/10"></div>
            <div className="absolute inset-x-0 bottom-0 h-px bg-white/10"></div>

            <div className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    {Icon && (
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10 shadow-inner">
                            <Icon className="text-white" size={20} />
                        </div>
                    )}
                    <div className="flex flex-col">
                        <h1 className="text-lg font-black text-white uppercase tracking-tight leading-none mb-0.5">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest">
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
        </motion.div>
    );
};

export default Topbar;
