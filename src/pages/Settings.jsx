import React, { useState, useEffect, useMemo } from 'react';
import {
    Settings as SettingsIcon, User, Mail, Phone, Briefcase, Plus, Trash2, Save,
    Loader2, ShieldCheck, UserCog, Building2, Search, LayoutGrid, List,
    Pencil, Ban, CheckCircle, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../utils/api';
import PageWrapper from '../components/PageWrapper';

// --- HELPER COMPONENTS ---

const ContactModal = ({ isOpen, onClose, onSave, contact, companies, type }) => {
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        email: '',
        phone: '',
        companyId: '',
        blocked: false
    });

    useEffect(() => {
        if (contact) {
            setFormData({
                name: contact.name || '',
                role: contact.role || '',
                email: contact.email || '',
                phone: contact.phone || '',
                companyId: contact.companyId || '',
                blocked: contact.blocked || false
            });
        } else {
            setFormData({ name: '', role: '', email: '', phone: '', companyId: '', blocked: false });
        }
    }, [contact, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                            {contact ? 'Editar Contacto' : 'Nuevo Contacto'}
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                            {type === 'managers' ? 'Gerencia de Aprobación' : 'Personal Administrativo'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-slate-900 shadow-sm">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Empresa</label>
                            <select
                                value={formData.companyId}
                                onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none"
                            >
                                <option value="">EMPRESA END TO END (INTERNO)</option>
                                {companies.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nombre Completo</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                                    placeholder="Juan Pérez"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Cargo / Rol</label>
                                <input
                                    type="text"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                                    placeholder="Gerente Operaciones"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                                    placeholder="ejemplo@email.cl"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Celular</label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                                    placeholder="+56 9 ..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-slate-50/50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-all">
                        Cancelar
                    </button>
                    <button
                        onClick={() => onSave(formData)}
                        className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
                    >
                        Guardar Contacto
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const ContactSection = ({ title, icon: Icon, type, description, contacts, companies, onAdd, onRemove, onUpdate }) => {
    const [viewMode, setViewMode] = useState('grid'); // grid, table
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingContact, setEditingContact] = useState(null);
    const [editingIndex, setEditingIndex] = useState(-1);

    const filteredContacts = useMemo(() => {
        return (contacts || []).map((c, i) => ({ ...c, originalIndex: i })).filter(c =>
            c.name?.toLowerCase().includes(search.toLowerCase()) ||
            c.email?.toLowerCase().includes(search.toLowerCase()) ||
            companies.find(comp => comp._id === c.companyId)?.name?.toLowerCase().includes(search.toLowerCase())
        );
    }, [contacts, search, companies]);

    const handleEdit = (contact, index) => {
        setEditingContact(contact);
        setEditingIndex(index);
        setIsModalOpen(true);
    };

    const handleSaveContact = (formData) => {
        if (editingIndex >= 0) {
            onUpdate(type, editingIndex, null, formData);
        } else {
            onAdd(type, formData);
        }
        setIsModalOpen(false);
        setEditingContact(null);
        setEditingIndex(-1);
    };

    const toggleBlock = (index) => {
        const contact = contacts[index];
        onUpdate(type, index, 'blocked', !contact.blocked);
    };

    return (
        <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100 flex flex-col gap-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-3xl bg-slate-900 text-white flex items-center justify-center shadow-xl shadow-slate-900/10">
                        <Icon size={28} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">{title}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">{description}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar contacto..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all w-64"
                        />
                    </div>

                    <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-200">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm shadow-indigo-600/10' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-2 rounded-xl transition-all ${viewMode === 'table' ? 'bg-white text-indigo-600 shadow-sm shadow-indigo-600/10' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <List size={18} />
                        </button>
                    </div>

                    <button
                        onClick={() => { setEditingContact(null); setEditingIndex(-1); setIsModalOpen(true); }}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-900 transition-all flex items-center gap-2 shadow-xl shadow-indigo-600/20"
                    >
                        <Plus size={16} /> Agregar
                    </button>
                </div>
            </div>

            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredContacts.map((contact) => (
                        <div
                            key={contact.originalIndex}
                            className={`group relative p-6 rounded-[2.5rem] border transition-all duration-500 ${contact.blocked
                                    ? 'bg-slate-50/50 border-slate-100 opacity-60'
                                    : 'bg-white border-slate-100 hover:border-indigo-500/20 hover:shadow-2xl hover:shadow-indigo-500/10'
                                }`}
                        >
                            {/* Actions Floating */}
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                <button onClick={() => toggleBlock(contact.originalIndex)} className={`p-2 rounded-xl shadow-lg transition-all ${contact.blocked ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white' : 'bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white'}`}>
                                    {contact.blocked ? <CheckCircle size={14} /> : <Ban size={14} />}
                                </button>
                                <button onClick={() => handleEdit(contact, contact.originalIndex)} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl shadow-lg hover:bg-indigo-600 hover:text-white transition-all">
                                    <Pencil size={14} />
                                </button>
                                <button onClick={() => onRemove(type, contact.originalIndex)} className="p-2 bg-slate-50 text-slate-400 rounded-xl shadow-lg hover:bg-red-500 hover:text-white transition-all">
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-all ${contact.blocked ? 'bg-slate-200 text-slate-400' : 'bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-lg'}`}>
                                        {contact.name?.charAt(0) || '?'}
                                    </div>
                                    <div className="overflow-hidden">
                                        <h4 className="font-black text-slate-900 uppercase tracking-tight leading-none mb-1 truncate">
                                            {contact.name}
                                        </h4>
                                        <div className="flex items-center gap-2">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{contact.role}</p>
                                            {contact.blocked && <span className="text-[8px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-black">BLOQUEADO</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 text-[11px] font-bold text-slate-600 truncate">
                                        <Mail size={14} className="text-slate-300" /> {contact.email}
                                    </div>
                                    <div className="flex items-center gap-3 text-[11px] font-bold text-slate-600">
                                        <Phone size={14} className="text-slate-300" /> {contact.phone}
                                    </div>
                                    <div className="flex items-center gap-3 text-[11px] font-black text-indigo-600 uppercase tracking-tighter bg-indigo-50 py-1.5 px-3 rounded-xl w-fit">
                                        <Building2 size={12} /> {companies.find(c => c._id === contact.companyId)?.name || 'END TO END INTERNO'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="overflow-hidden border border-slate-100 rounded-[2.5rem]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Contacto</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Cargo</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Empresa</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredContacts.map((contact) => (
                                    <tr key={contact.originalIndex} className={`hover:bg-slate-50/50 transition-colors ${contact.blocked ? 'opacity-50 grayscale' : ''}`}>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs uppercase">
                                                    {contact.name?.charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-slate-900 uppercase">{contact.name}</span>
                                                    <span className="text-[10px] text-slate-400 font-bold">{contact.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{contact.role}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter bg-indigo-50 px-2 py-1 rounded-lg">
                                                {companies.find(c => c._id === contact.companyId)?.name || 'E2E INTERNO'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => toggleBlock(contact.originalIndex)} title={contact.blocked ? "Desbloquear" : "Bloquear"} className={`p-2 rounded-xl transition-all ${contact.blocked ? 'text-emerald-500 hover:bg-emerald-50' : 'text-rose-400 hover:bg-rose-50'}`}>
                                                    {contact.blocked ? <CheckCircle size={16} /> : <Ban size={16} />}
                                                </button>
                                                <button onClick={() => handleEdit(contact, contact.originalIndex)} className="p-2 text-indigo-400 hover:bg-indigo-50 rounded-xl transition-all">
                                                    <Pencil size={16} />
                                                </button>
                                                <button onClick={() => onRemove(type, contact.originalIndex)} className="p-2 text-slate-300 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {filteredContacts.length === 0 && (
                <div className="py-20 text-center border-4 border-dashed border-slate-50 rounded-[3rem] flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                        <Search size={40} />
                    </div>
                    <p className="text-sm text-slate-400 font-bold italic uppercase tracking-widest">No se detectaron nodos de contacto</p>
                </div>
            )}

            <AnimatePresence>
                {isModalOpen && (
                    <ContactModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onSave={handleSaveContact}
                        contact={editingContact}
                        companies={companies}
                        type={type}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

const Settings = ({ auth, onLogout }) => {
    const [config, setConfig] = useState({ managers: [], admins: [] });
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [configRes, companiesRes] = await Promise.all([
                api.get('/config'),
                api.get('/companies')
            ]);
            setConfig(configRes.data);
            setCompanies(companiesRes.data);
        } catch (error) {
            toast.error('Error al cargar datos');
        }
        finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const sanitizeContacts = (list) => (list || []).map(c => ({
                ...c,
                companyId: c.companyId === "" ? null : c.companyId
            }));

            const payload = {
                managers: sanitizeContacts(config.managers),
                admins: sanitizeContacts(config.admins)
            };

            await api.put('/config', payload);
            toast.success('Protocolos configurados correctamente');
        } catch (error) {
            toast.error('Error al guardar configuración');
        } finally {
            setSaving(false);
        }
    };

    const addContact = (type, contactData) => {
        setConfig(prev => ({
            ...prev,
            [type]: [...(prev[type] || []), contactData]
        }));
    };

    const removeContact = (type, index) => {
        setConfig(prev => {
            const updatedList = [...(prev[type] || [])];
            updatedList.splice(index, 1);
            return { ...prev, [type]: updatedList };
        });
    };

    const updateContact = (type, index, field, value) => {
        setConfig(prev => {
            const updatedList = [...(prev[type] || [])];
            if (field === null) {
                updatedList[index] = value;
            } else {
                updatedList[index] = { ...updatedList[index], [field]: value };
            }
            return { ...prev, [type]: updatedList };
        });
    };

    return (
        <PageWrapper
            className="max-w-[1600px] mx-auto space-y-12 pb-32"
            title="CONFIGURACIÓN DE PROTOCOLOS"
            subtitle="Gestión estratégica de nodos de aprobación y flujos administrativos"
            icon={SettingsIcon}
            auth={auth}
            onLogout={onLogout}
            headerActions={
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-white/10 backdrop-blur-sm text-white px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/20 transition-all border border-white/20 flex items-center gap-3 active:scale-95 disabled:opacity-50"
                >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Sincronizar Ecosistema
                </button>
            }
        >
            {loading ? (
                <div className="flex flex-col items-center justify-center py-60 gap-6">
                    <div className="relative">
                        <Loader2 size={60} className="text-slate-900 animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-ping"></div>
                        </div>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] animate-pulse">Sincronizando Ajustes Globales...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-12 max-w-7xl mx-auto">
                    <ContactSection
                        title="Nodos de Aprobación"
                        description="Alta gerencia autorizada para la validación final de contratos"
                        icon={ShieldCheck}
                        type="managers"
                        contacts={config.managers}
                        companies={companies}
                        onAdd={addContact}
                        onRemove={removeContact}
                        onUpdate={updateContact}
                    />

                    <ContactSection
                        title="Administración Central"
                        description="Nodos técnicos responsables de la recepción de data y reportes"
                        icon={UserCog}
                        type="admins"
                        contacts={config.admins}
                        companies={companies}
                        onAdd={addContact}
                        onRemove={removeContact}
                        onUpdate={updateContact}
                    />
                </div>
            )}
        </PageWrapper>
    );
};

export default Settings;
