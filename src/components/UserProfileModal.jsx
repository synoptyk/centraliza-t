import React, { useState, useRef } from 'react';
import { X, Mail, Phone, Building2, Shield, User, Camera, Check, Briefcase, FileText } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const UserProfileModal = ({ user, onClose, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
        position: user.position || '',
        cellphone: user.cellphone || '',
        rut: user.rut || '',
        photo: user.photo || ''
    });
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    // Handle Photo Upload
    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Basic validation (Cloudinary supports many, but let's limit)
        if (!file.type.startsWith('image/')) {
            toast.error('Solo se permiten imágenes (JPG, PNG, WEBP)');
            return;
        }

        setUploading(true);
        const uploadData = new FormData();
        uploadData.append("file", file);

        try {
            const res = await api.post('/users/upload-avatar', uploadData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (res.data.success) {
                const newPhotoUrl = res.data.secure_url;
                setFormData(prev => ({ ...prev, photo: newPhotoUrl }));
                toast.success('Foto subida exitosamente');
            }

        } catch (error) {
            console.error('Upload error:', error);
            const msg = error.response?.data?.message || 'Error al subir imagen';
            toast.error(msg);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put(`/users/${user._id}`, formData);
            toast.success('Perfil actualizado correctamente');
            onUpdate(res.data); // Update parent state
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Error al actualizar perfil');
        }
    };

    const PermissionBadge = ({ module, actions }) => {
        const actionList = Object.entries(actions).filter(([_, val]) => val).map(([key]) => key);
        if (actionList.length === 0) return null;

        return (
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs font-bold uppercase text-slate-600">{module}</span>
                <div className="flex gap-1">
                    {actionList.map(action => (
                        <span key={action} className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[9px] font-black uppercase rounded-full">
                            {action}
                        </span>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header Gradient */}
                <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-600 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all"
                    >
                        <X size={20} />
                    </button>
                    <div className="absolute -bottom-16 left-8">
                        <div className="relative group">
                            {/* Hidden File Input */}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handlePhotoChange}
                                className="hidden"
                                accept="image/*"
                            />
                            <div className="w-32 h-32 rounded-3xl bg-white p-1 shadow-xl rotate-3 group-hover:rotate-0 transition-all duration-500">
                                <img
                                    src={formData.photo || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                                    alt="Profile"
                                    className="w-full h-full object-cover rounded-2xl bg-slate-100"
                                />
                                {isEditing && (
                                    <div
                                        onClick={() => fileInputRef.current.click()}
                                        className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    >
                                        <Camera className="text-white" />
                                    </div>
                                )}
                            </div>
                            <div className="absolute bottom-2 right-2 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full"></div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="pt-20 px-8 pb-8 overflow-y-auto custom-scrollbar">

                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight">{user.name}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                                    {user.role.replace(/_/g, ' ')}
                                </span>
                                {user.companyId && (
                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                        <Building2 size={10} />
                                        Empresa ID: {user.companyId}
                                    </span>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="text-indigo-600 text-xs font-bold uppercase tracking-wider hover:text-indigo-800 transition-colors"
                        >
                            {isEditing ? 'Cancelar Edición' : 'Editar Perfil'}
                        </button>
                    </div>

                    {isEditing ? (
                        <form onSubmit={handleSubmit} className="space-y-4 animate-in slide-in-from-bottom-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Nombre Completo</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Cargo / Posición</label>
                                    <input
                                        type="text"
                                        value={formData.position}
                                        onChange={e => setFormData({ ...formData, position: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        placeholder="Ej. Gerente de RRHH"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Teléfono</label>
                                    <input
                                        type="text"
                                        value={formData.cellphone}
                                        onChange={e => setFormData({ ...formData, cellphone: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        placeholder="+56 9 ..."
                                    />
                                </div>
                                <div className="space-y-1 col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Foto URL (Temporal)</label>
                                    <input
                                        type="text"
                                        value={formData.photo}
                                        onChange={e => setFormData({ ...formData, photo: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Información de Contacto</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500">
                                            <Mail size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Email Corporativo</p>
                                            <p className="text-sm font-semibold text-slate-700">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500">
                                            <Phone size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Teléfono Movil</p>
                                            <p className="text-sm font-semibold text-slate-700">{user.cellphone || 'No registrado'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500">
                                            <Briefcase size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Cargo / Posición</p>
                                            <p className="text-sm font-semibold text-slate-700">{user.position || 'No registrado'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500">
                                            <FileText size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">RUT</p>
                                            <p className="text-sm font-semibold text-slate-700">{user.rut || 'No registrado'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Permisos & Accesos</h3>
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {(user.permissions && user.permissions.length > 0) ? (
                                        user.permissions.map((perm, idx) => (
                                            <PermissionBadge key={idx} module={perm.module} actions={perm.actions} />
                                        ))
                                    ) : (
                                        <p className="text-sm text-slate-500 italic">Acceso total (SuperAdmin) o sin restricciones específicas.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default UserProfileModal;
