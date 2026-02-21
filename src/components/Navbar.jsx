import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, Menu, X } from 'lucide-react';

const Navbar = ({ isMenuOpen, setIsMenuOpen, light = true, auth = null }) => {
    const navigate = useNavigate();

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all ${light ? 'bg-white/80 backdrop-blur-xl border-b border-slate-100' : 'bg-slate-950/40 backdrop-blur-xl border-b border-white/5'}`}>
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                        <Rocket className="text-white" size={24} />
                    </div>
                    <span className={`text-xl font-black tracking-tighter ${light ? 'text-slate-900' : 'text-white'}`}>CENTRALIZA-T</span>
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-10">
                    <a href="/#features" className={`text-[10px] font-black uppercase tracking-widest transition-colors ${light ? 'text-slate-500 hover:text-indigo-600' : 'text-slate-400 hover:text-indigo-400'}`}>Funcionalidades</a>
                    <a href="/#pricing" className={`text-[10px] font-black uppercase tracking-widest transition-colors ${light ? 'text-slate-500 hover:text-indigo-600' : 'text-slate-400 hover:text-indigo-400'}`}>Planes</a>
                    <a href="/#nosotros" className={`text-[10px] font-black uppercase tracking-widest transition-colors ${light ? 'text-slate-500 hover:text-indigo-600' : 'text-slate-400 hover:text-indigo-400'}`}>Nosotros</a>

                    {auth ? (
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="bg-indigo-600 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-indigo-200"
                        >
                            Ir al Panel
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate('/login')}
                            className={`${light ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'} px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-lg`}
                        >
                            Acceso Clientes
                        </button>
                    )}
                </div>

                <button className={`${light ? 'text-slate-900' : 'text-white'} md:hidden`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
