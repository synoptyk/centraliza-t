import React, { useState, useEffect } from 'react';
import { Plus, Building2, Users, User, ShieldCheck, CheckSquare, Square, Pencil, Trash2, LayoutGrid, List, Download, Upload, FileSpreadsheet, AlertCircle, TrendingUp, DollarSign, Activity, Zap, X as CloseIcon, Eye, EyeOff, RefreshCw, Key, Globe } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import PageWrapper from '../../components/PageWrapper';
import * as XLSX from 'xlsx';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { COUNTRIES, validateTaxId } from '../../utils/intlUtils';
import InternationalInput from '../../components/InternationalInput';

const MODULES_LIST = [
    { id: 'dashboard', name: 'Dashboard Central' },
    { id: 'admin-command', name: 'Centro de Mando CEO' },
    { id: 'comercial', name: 'Mando Comercial' },
    { id: 'proyectos', name: 'Gestión de Proyectos' },
    { id: 'ingreso', name: 'Captura de Talento' },
    { id: 'entrevista', name: 'Entrevistas Filtro' },
    { id: 'tests', name: 'Evaluación Técnica' },
    { id: 'acreditacion-prevencion', name: 'Seguridad & Prevención' },
    { id: 'documentos', name: 'Gestión Documental' },
    { id: 'ficha-colaborador', name: 'Ficha y Validación' },
    { id: 'contratos', name: 'Contrataciones (Generación IA)' },
    { id: 'contratacion', name: 'Aprobaciones (Firma Final)' },
    { id: 'nomina', name: 'Nómina (Payroll)' },
    { id: 'finiquitos', name: 'Finiquitos y Desvinculación' },
    { id: 'gestion-capital-humano', name: 'Capital Humano 360' },
    { id: 'contenedor', name: 'Contenedor (Portal Cliente)' },
    { id: 'banco-central', name: 'Banco Central' },
    { id: 'previred', name: 'PreviRed' },
    { id: 'sii', name: 'SII' },
    { id: 'dt', name: 'Dirección del Trabajo (DT)' },
    { id: 'banco', name: 'Banco / Pagos' },
    { id: 'configuracion', name: 'Ajustes del Sistema' },
    { id: 'parametros-legales', name: 'Parámetros Legales' },
    { id: 'suscripcion', name: 'Planes & Facturas' },
    { id: 'ayuda', name: 'Centro de Ayuda' }
];

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const CommandCenter = ({ auth, onLogout }) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [companies, setCompanies] = useState([]);
    const [users, setUsers] = useState([]);
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCompanyModal, setShowCompanyModal] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);
    const [editingCompany, setEditingCompany] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [viewMode, setViewMode] = useState('grid');
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkType, setBulkType] = useState('companies'); // 'companies' or 'users'
    const [bulkLoading, setBulkLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false); // New state for password visibility
    const [showCredentialsModal, setShowCredentialsModal] = useState(false);
    const [createdCredentials, setCreatedCredentials] = useState(null);

    // Company Form
    const [companyForm, setCompanyForm] = useState({
        name: '', rut: '', address: '', phone: '', email: '', web: '', industry: '',
        businessLine: '',
        country: 'CL',
        legalRepresentatives: [], // Array of { rut, name, email, phone }
        commercialContacts: [],   // Array of { name, phone, email }
        contractStartDate: '', contractDurationMonths: '', contractEndDate: '',
        contractedUsersLimit: 5, userValueUF: '', monthlyTotalUF: '',
        serviceMode: 'FULL_HR_360'
    });

    // Auto-calculate Contract End Date
    useEffect(() => {
        if (companyForm.contractStartDate && companyForm.contractDurationMonths) {
            const start = new Date(companyForm.contractStartDate);
            // Add months to start date
            const end = new Date(start.setMonth(start.getMonth() + Number(companyForm.contractDurationMonths)));
            // Format to YYYY-MM-DD for input
            setCompanyForm(prev => ({
                ...prev,
                contractEndDate: end.toISOString().split('T')[0]
            }));
        }
    }, [companyForm.contractStartDate, companyForm.contractDurationMonths]);

    // User Form
    const [userForm, setUserForm] = useState({
        name: '', email: '', role: 'Usuario_Centralizat', password: '',
        rut: '', position: '', cellphone: '', companyId: '', permissions: [],
        country: 'CL'
    });

    // Fetch data on mount
    useEffect(() => {
        fetchData();
    }, []);




    // KPI Data
    const kpiData = {
        revenue: companies.reduce((sum, c) => sum + (parseFloat(c.monthlyTotalUF) || 0), 0),
        companies: companies.length,
        users: users.length,
        applicants: applicants.length
    };

    // Revenue Chart Data (Mock - replace with real data if available)
    const revenueChartData = [
        { name: 'Ene', value: 1200 },
        { name: 'Feb', value: 1900 },
        { name: 'Mar', value: 2400 },
        { name: 'Abr', value: 2100 },
        { name: 'May', value: 2800 },
        { name: 'Jun', value: 3200 }
    ];

    // Industry Distribution
    const industryData = companies.reduce((acc, company) => {
        const industry = company.industry || 'Sin Clasificar';
        const existing = acc.find(item => item.name === industry);
        if (existing) {
            existing.value += 1;
        } else {
            acc.push({ name: industry, value: 1 });
        }
        return acc;
    }, []);

    // Users by Company
    const usersByCompanyData = companies.map(company => ({
        name: company.name.length > 15 ? company.name.substring(0, 15) + '...' : company.name,
        value: users.filter(u => u.companyId?._id === company._id || u.companyId === company._id).length
    })).slice(0, 10);

    const handleSubmitCompany = async (e) => {
        e.preventDefault();

        if (!validateTaxId(companyForm.rut, companyForm.country)) {
            const countryData = COUNTRIES.find(c => c.code === (companyForm.country || 'CL')) || COUNTRIES[0];
            return toast.error(`${countryData.taxIdName} de Empresa inválido`);
        }
        try {
            if (editingCompany) {
                await api.put(`/companies/${editingCompany._id}`, companyForm);
                toast.success('Empresa actualizada exitosamente');
            } else {
                await api.post('/companies', companyForm);
                toast.success('Empresa creada exitosamente');
            }
            setShowCompanyModal(false);
            setEditingCompany(null);
            setCompanyForm({
                name: '', rut: '', address: '', phone: '', email: '', web: '', industry: '',
                businessLine: '',
                legalRepresentatives: [],
                commercialContacts: [],
                contractStartDate: '', contractDurationMonths: '', contractEndDate: '',
                contractedUsersLimit: 5, userValueUF: '', monthlyTotalUF: '',
                serviceMode: 'FULL_HR_360'
            });
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al guardar empresa');
        }
    };

    const handleDeleteCompany = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta empresa?')) {
            try {
                await api.delete(`/companies/${id}`);
                toast.success('Empresa eliminada');
                fetchData();
            } catch (error) {
                toast.error('Error al eliminar empresa');
            }
        }
    };

    const handleEditCompany = (company) => {
        setEditingCompany(company);
        setCompanyForm(company);
        setShowCompanyModal(true);
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        setUserForm({
            ...user,
            // Ensure companyId is the ID string, handle null
            companyId: user.companyId ? user.companyId._id : '',
            password: '' // Don't populate password on edit
        });
        setShowUserModal(true);
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
            try {
                await api.delete(`/users/${id}`);
                toast.success('Usuario eliminado');
                fetchData();
            } catch (error) {
                toast.error('Error al eliminar usuario');
            }
        }
    };

    const handleSubmitUser = async (e) => {
        e.preventDefault();

        if (userForm.rut && !validateTaxId(userForm.rut, userForm.country)) {
            const countryData = COUNTRIES.find(c => c.code === (userForm.country || 'CL')) || COUNTRIES[0];
            return toast.error(`${countryData.taxIdName} de Usuario inválido`);
        }
        try {
            // Validation: External users MUST have a companyId
            if ((userForm.role === 'Usuario_Empresa' || userForm.role === 'Admin_Empresa') && !userForm.companyId) {
                toast.error('Error: "Usuario_Empresa" requiere una empresa. Si es interno, use "Usuario_Centralizat".');
                return;
            }

            // Transform permissions array to backend format if needed, or send as is
            const payload = {
                ...userForm,
                companyId: userForm.companyId === "" ? null : userForm.companyId
            };

            // If password is empty (Create: auto-gen, Edit: keep existing), remove it
            if (!payload.password) {
                delete payload.password;
            }

            if (editingUser) {
                await api.put(`/users/${editingUser._id}`, payload);
                toast.success('Usuario actualizado exitosamente');
            } else {
                const res = await api.post('/users', payload);
                if (res.data && res.data.password) {
                    setCreatedCredentials(res.data);
                    setShowCredentialsModal(true);
                } else {
                    toast.success('Usuario creado (sin retorno de contraseña).');
                }
            }
            setShowUserModal(false);
            setEditingUser(null);
            setUserForm({
                name: '', email: '', role: 'Usuario_Centralizat', password: '',
                rut: '', position: '', cellphone: '', companyId: '', permissions: []
            });
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al guardar usuario');
        }
    };

    const handleGeneratePassword = () => {
        const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-2).toUpperCase();
        setUserForm(prev => ({ ...prev, password: randomPassword }));
        setShowPassword(true); // Show it so user can see what was generated
    };

    const handleResetAndResend = async () => {
        if (!editingUser) return;
        if (!window.confirm(`ADVERTENCIA DE SEGURIDAD\n\nEstá a punto de RESTABLECER la contraseña para ${editingUser.name}.\n\nEsta acción:\n1. Generará una NUEVA contraseña segura y la guardará en la base de datos.\n2. Enviará un correo al usuario con las nuevas credenciales.\n\nLa contraseña anterior, si existía, dejará de funcionar.\n\n¿Desea continuar?`)) {
            return;
        }

        const newPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-2).toUpperCase();

        try {
            toast.loading('Generando nuevas credenciales...');

            // 1. Update user with new password
            await api.put(`/users/${editingUser._id}`, {
                password: newPassword
            });

            // 2. Trigger resend credentials email
            await api.post('/users/resend-credentials', {
                name: editingUser.name,
                email: editingUser.email,
                password: newPassword
            }, { timeout: 45000 });

            toast.dismiss();
            toast.success('Credenciales restablecidas y enviadas por correo');
            setShowUserModal(false);
        } catch (error) {
            toast.dismiss();
            console.error('Reset Error:', error);
            toast.error(error.response?.data?.message || 'Error al restablecer credenciales');
        }
    };



    const handleExportExcel = () => {
        if (activeTab === 'dashboard') {
            const wsData = [
                ['KPI', 'Valor'],
                ['Ingresos Estimados', `UF ${kpiData.revenue}`],
                ['Empresas Activas', kpiData.companies],
                ['Usuarios Totales', kpiData.users],
                ['Dotación Gestionada', kpiData.applicants],
                [],
                ['Distribución por Industria'],
                ['Industria', 'Cantidad'],
                ...industryData.map(d => [d.name, d.value])
            ];
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Dashboard Resumen");
            XLSX.writeFile(wb, "Resumen_Corporativo.xlsx");
            toast.success('Resumen exportado');
            return;
        }

        const dataToExport = activeTab === 'companies' ? companies : users;

        // Map data to Spanish headers
        const translatedData = dataToExport.map(item => {
            if (activeTab === 'companies') {
                return {
                    'Nombre': item.name,
                    'RUT': item.rut,
                    'Dirección': item.address,
                    'Teléfono': item.phone,
                    'Email': item.email,
                    'Web': item.web,
                    'Industria': item.industry,
                    'Representante Legal': item.legalRepresentative
                };
            } else {
                return {
                    'Nombre': item.name,
                    'Email': item.email,
                    'Rol': item.role,
                    'RUT': item.rut,
                    'Cargo': item.position,
                    'Celular': item.cellphone,
                    'ID Empresa': item.companyId?._id || item.companyId || ''
                };
            }
        });

        const worksheet = XLSX.utils.json_to_sheet(translatedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, activeTab === 'companies' ? "Empresas" : "Usuarios");
        XLSX.writeFile(workbook, `${activeTab === 'companies' ? "Empresas" : "Usuarios"}_Export.xlsx`);
        toast.success('Exportación completada');
    };

    const handleDownloadTemplate = (type) => {
        let headers = [];
        if (type === 'companies') {
            headers = [['Nombre', 'RUT', 'Dirección', 'Teléfono', 'Email', 'Web', 'Industria', 'Representante Legal']];
        } else {
            headers = [['Nombre', 'Email', 'Rol', 'RUT', 'Cargo', 'Celular', 'ID Empresa']];
        }
        const worksheet = XLSX.utils.aoa_to_sheet(headers);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Plantilla");
        XLSX.writeFile(workbook, `Plantilla_${type}.xlsx`);
    };

    const handleBulkUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setBulkLoading(true);
        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const rawData = XLSX.utils.sheet_to_json(ws);

                // Map Spanish headers back to English keys
                const mappedData = rawData.map(row => {
                    if (bulkType === 'companies') {
                        return {
                            name: row['Nombre'],
                            rut: row['RUT'],
                            address: row['Dirección'],
                            phone: row['Teléfono'],
                            email: row['Email'],
                            web: row['Web'],
                            industry: row['Industria'],
                            legalRepresentative: row['Representante Legal']
                        };
                    } else {
                        return {
                            name: row['Nombre'],
                            email: row['Email'],
                            role: row['Rol'],
                            rut: row['RUT'],
                            position: row['Cargo'],
                            cellphone: row['Celular'],
                            companyId: row['ID Empresa']
                        };
                    }
                });

                const endpoint = bulkType === 'companies' ? '/companies/bulk' : '/users/bulk';
                const { data: results } = await api.post(endpoint, mappedData);

                toast.success(`Carga completada: ${results.created} creados, ${results.skipped} omitidos.`);
                if (results.errors.length > 0) {
                    console.error('Bulk errors:', results.errors);
                    toast.error(`${results.errors.length} errores encontrados. Revisar consola.`);
                }
                setShowBulkModal(false);
                fetchData();
            } catch (error) {
                console.error('Error parsing excel:', error);
                toast.error('Error al procesar el archivo Excel');
            } finally {
                setBulkLoading(false);
            }
        };
        reader.readAsBinaryString(file);
    };

    const fetchData = async () => {
        console.log('--- CommandCenter: Starting fetchData ---');
        try {
            setLoading(true);
            console.log('Fetching companies...');
            const companiesRes = await api.get('/companies');
            console.log('Companies loaded:', companiesRes.data?.length);

            console.log('Fetching users...');
            const usersRes = await api.get('/users');
            console.log('Users loaded:', usersRes.data?.length);

            console.log('Fetching applicants...');
            const applicantsRes = await api.get('/applicants');
            console.log('Applicants loaded:', applicantsRes.data?.length);

            setCompanies(companiesRes.data);
            setUsers(usersRes.data);
            setApplicants(applicantsRes.data);
        } catch (error) {
            console.error('Error fetching data in CommandCenter:', error);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
            } else if (error.request) {
                console.error('No response received:', error.request);
            } else {
                console.error('Error config:', error.message);
            }
            toast.error('Error al cargar datos. Revise la consola.');
        } finally {
            console.log('--- CommandCenter: fetchData finished ---');
            setLoading(false);
        }
    };

    const togglePermission = (moduleId, action) => {
        setUserForm(prev => {
            const permissionIndex = prev.permissions.findIndex(p => p.module === moduleId);
            let newPermissions = [...prev.permissions];

            if (permissionIndex === -1) {
                // If module permission doesn't exist, create it with this action
                newPermissions.push({
                    module: moduleId,
                    actions: {
                        create: action === 'create',
                        read: action === 'read',
                        update: action === 'update',
                        delete: action === 'delete'
                    }
                });
            } else {
                // Toggle the specific action
                newPermissions[permissionIndex] = {
                    ...newPermissions[permissionIndex],
                    actions: {
                        ...newPermissions[permissionIndex].actions,
                        [action]: !newPermissions[permissionIndex].actions[action]
                    }
                };
            }
            return { ...prev, permissions: newPermissions };
        });
    };

    return (
        <PageWrapper
            className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700"
            title="CENTRO DE MANDO EJECUTIVO"
            subtitle="Gestión de Ecosistemas y Roles Globales"
            icon={ShieldCheck}
            auth={auth}
            onLogout={onLogout}
            headerActions={
                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            setEditingCompany(null);
                            setCompanyForm({
                                name: '', rut: '', address: '', phone: '', email: '', web: '', industry: '',
                                businessLine: '',
                                legalRepresentatives: [],
                                commercialContacts: [],
                                contractStartDate: '', contractDurationMonths: '', contractEndDate: '',
                                contractedUsersLimit: 5, userValueUF: '', monthlyTotalUF: ''
                            });
                            setShowCompanyModal(true);
                        }}
                        className="bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider border border-white/20 hover:bg-white/20 transition-all flex items-center gap-2"
                    >
                        <Plus size={14} /> Nueva Empresa
                    </button>
                    <button
                        onClick={() => {
                            setEditingUser(null);
                            setUserForm({
                                name: '', email: '', role: 'Usuario_Centralizat', password: '',
                                rut: '', position: '', cellphone: '', companyId: '', permissions: []
                            });
                            setShowUserModal(true);
                        }}
                        className="bg-indigo-500 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-indigo-900/20 hover:bg-indigo-400 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                    >
                        <Plus size={14} /> Nuevo Usuario
                    </button>
                    <button
                        onClick={handleExportExcel}
                        className="bg-emerald-500 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-emerald-900/20 hover:bg-emerald-400 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                    >
                        <Download size={14} /> Exportar
                    </button>
                </div>
            }
        >

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-4">
                <div className="flex gap-6">
                    {['dashboard', 'companies', 'users'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 px-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative flex items-center gap-3 ${activeTab === tab ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {tab === 'dashboard' ? 'Panel' : tab === 'companies' ? 'Empresas' : 'Usuarios'}
                            {(
                                <span className={`px-2 py-0.5 rounded-full text-[9px] ${activeTab === tab ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                                    {tab === 'dashboard' ? '' : tab === 'companies' ? companies.length : users.length}
                                </span>
                            )}
                            {activeTab === tab && <div className="absolute bottom-[-17px] left-0 right-0 h-1 bg-indigo-600 rounded-full"></div>}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                        title="Vista Cuadrícula"
                    >
                        <LayoutGrid size={18} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                        title="Vista Lista"
                    >
                        <List size={18} />
                    </button>
                    <div className="w-px h-6 bg-slate-200 mx-1"></div>
                    <button
                        onClick={() => {
                            setBulkType(activeTab);
                            setShowBulkModal(true);
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-indigo-600 transition-all"
                    >
                        <Upload size={14} /> Carga Masiva
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden min-h-[500px]">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-indigo-600"></div>
                        <p className="mt-4 text-slate-400 text-sm font-black uppercase tracking-[0.2em]">Cargando...</p>
                    </div>
                ) : activeTab === 'dashboard' ? (
                    <div className="p-8 space-y-8 bg-slate-50/50">
                        {/* KPIs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600"><DollarSign size={24} /></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">+12%</span>
                                </div>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Ingresos Totales (Est.)</p>
                                <h3 className="text-3xl font-black text-slate-900">UF {kpiData.revenue.toLocaleString()}</h3>
                            </div>
                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-violet-50 rounded-2xl text-violet-600"><Building2 size={24} /></div>
                                </div>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Empresas Activas</p>
                                <h3 className="text-3xl font-black text-slate-900">{kpiData.companies}</h3>
                            </div>
                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-blue-50 rounded-2xl text-blue-600"><Users size={24} /></div>
                                </div>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Usuarios Sistema</p>
                                <h3 className="text-3xl font-black text-slate-900">{kpiData.users}</h3>
                            </div>
                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-amber-50 rounded-2xl text-amber-600"><Users size={24} /></div>
                                </div>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Dotación Gestionada</p>
                                <h3 className="text-3xl font-black text-slate-900">{kpiData.applicants}</h3>
                            </div>
                        </div>

                        {/* CHARTS ROW 1 */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Revenue Chart */}
                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-2">
                                    <TrendingUp size={20} className="text-indigo-600" /> Crecimiento de Ingresos
                                </h3>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={revenueChartData}>
                                            <defs>
                                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                                itemStyle={{ color: '#4f46e5', fontWeight: 'bold' }}
                                            />
                                            <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Industry Dist */}
                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-2">
                                    <Building2 size={20} className="text-emerald-600" /> Distribución por Industria
                                </h3>
                                <div className="h-[300px] w-full flex items-center justify-center">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={industryData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {industryData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* CHARTS ROW 2 */}
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-2">
                                <Users size={20} className="text-violet-600" /> Usuarios por Empresa
                            </h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={usersByCompanyData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} dy={10} interval={0} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                        <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'companies' ? (
                    companies.length > 0 ? (
                        <div className="p-8 space-y-4">
                            {viewMode === 'grid' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {companies.map((company) => (
                                        <CompanyCard key={company._id} company={company} onEdit={handleEditCompany} onDelete={handleDeleteCompany} />
                                    ))}
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-100">
                                                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Empresa</th>
                                                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">RUT</th>
                                                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Industria</th>
                                                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Email</th>
                                                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {companies.map((company) => (
                                                <tr key={company._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-all group">
                                                    <td className="py-4 px-4 text-sm font-black text-slate-900">{company.name}</td>
                                                    <td className="py-4 px-4 text-xs font-bold text-slate-500">{company.rut}</td>
                                                    <td className="py-4 px-4 text-xs font-bold text-indigo-500">{company.industry || '-'}</td>
                                                    <td className="py-4 px-4 text-xs font-bold text-slate-500">{company.email || '-'}</td>
                                                    <td className="py-4 px-4">
                                                        <div className="flex gap-2">
                                                            <button onClick={() => handleEditCompany(company)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><Pencil size={14} /></button>
                                                            <button onClick={() => handleDeleteCompany(company._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={14} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ) : (
                        <NoDataMessage icon={Building2} tab="empresas" />
                    )
                ) : activeTab === 'users' ? (
                    users.length > 0 ? (
                        <div className="p-8 space-y-4">
                            {viewMode === 'grid' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {users.map((user) => (
                                        <UserCard key={user._id} user={user} onEdit={handleEditUser} onDelete={handleDeleteUser} />
                                    ))}
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-100">
                                                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Usuario</th>
                                                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Rol</th>
                                                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Empresa</th>
                                                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Email</th>
                                                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((user) => (
                                                <tr key={user._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-all group">
                                                    <td className="py-4 px-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-black text-slate-900">{user.name}</span>
                                                            <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-wider">{user.position || '-'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${user.role.includes('Admin') ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4 text-xs font-bold text-slate-500">{user.companyId?.name || 'CENTRALIZA-T'}</td>
                                                    <td className="py-4 px-4 text-xs font-bold text-slate-500">{user.email}</td>
                                                    <td className="py-4 px-4">
                                                        <div className="flex gap-2">
                                                            <button onClick={() => handleEditUser(user)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><Pencil size={14} /></button>
                                                            <button onClick={() => handleDeleteUser(user._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={14} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ) : (
                        <NoDataMessage icon={Users} tab="usuarios" />
                    )
                ) : null}
            </div>
            {/* Company Modal */}
            {showCompanyModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="p-10">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
                                    {editingCompany ? 'Editar Empresa' : 'Nueva Empresa'}
                                </h2>
                                <button onClick={() => setShowCompanyModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                    <CloseIcon size={24} className="text-slate-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmitCompany} className="space-y-8">

                                {/* SECTION 1: DATOS EMPRESA */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-100 pb-2">Información Corporativa</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">País</label>
                                            <InternationalInput
                                                selectedCountry={companyForm.country}
                                                onCountryChange={(code) => setCompanyForm({ ...companyForm, country: code })}
                                                value={COUNTRIES.find(c => c.code === (companyForm.country || 'CL'))?.name || 'Chile'}
                                                icon={Globe}
                                                onChange={() => { }}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Razón Social / Nombre</label>
                                            <input type="text" required value={companyForm.name} onChange={e => setCompanyForm({ ...companyForm, name: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none transition-all text-xs font-bold" />
                                        </div>
                                        <div className="space-y-1">
                                            <InternationalInput
                                                label={COUNTRIES.find(c => c.code === (companyForm.country || 'CL'))?.taxIdName || 'RUT'}
                                                name="rut"
                                                value={companyForm.rut}
                                                onChange={e => setCompanyForm({ ...companyForm, rut: e.target.value })}
                                                selectedCountry={companyForm.country}
                                                icon={Building2}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Giro Comercial</label>
                                            <input type="text" value={companyForm.businessLine} onChange={e => setCompanyForm({ ...companyForm, businessLine: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none transition-all text-xs font-bold" />
                                        </div>
                                        <div className="col-span-2 space-y-1">
                                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Dirección Comercial</label>
                                            <input type="text" value={companyForm.address} onChange={e => setCompanyForm({ ...companyForm, address: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none transition-all text-xs font-bold" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Sitio Web</label>
                                            <input type="text" value={companyForm.web} onChange={e => setCompanyForm({ ...companyForm, web: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none transition-all text-xs font-bold" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Email General</label>
                                            <input type="email" value={companyForm.email} onChange={e => setCompanyForm({ ...companyForm, email: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none transition-all text-xs font-bold" />
                                        </div>
                                        <div className="space-y-1">
                                            <InternationalInput
                                                label="Teléfono"
                                                name="phone"
                                                value={companyForm.phone}
                                                onChange={e => setCompanyForm({ ...companyForm, phone: e.target.value })}
                                                selectedCountry={companyForm.country}
                                                isPhone={true}
                                                onCountryChange={(code) => setCompanyForm({ ...companyForm, country: code })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Industria</label>
                                            <input type="text" value={companyForm.industry} onChange={e => setCompanyForm({ ...companyForm, industry: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none transition-all text-xs font-bold" />
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 2: REPRESENTANTES LEGALES */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center border-b border-indigo-100 pb-2">
                                        <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest">Representantes Legales</h3>
                                        <button
                                            type="button"
                                            onClick={() => setCompanyForm(prev => ({
                                                ...prev,
                                                legalRepresentatives: [...prev.legalRepresentatives, { rut: '', name: '', email: '', phone: '' }]
                                            }))}
                                            className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-indigo-100 transition-all flex items-center gap-1"
                                        >
                                            <Plus size={12} /> Agregar Rep.
                                        </button>
                                    </div>

                                    {companyForm.legalRepresentatives.length === 0 && (
                                        <p className="text-xs text-slate-400 italic">No hay representantes legales registrados.</p>
                                    )}

                                    {companyForm.legalRepresentatives.map((rep, index) => (
                                        <div key={index} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 relative group">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newReps = companyForm.legalRepresentatives.filter((_, i) => i !== index);
                                                    setCompanyForm({ ...companyForm, legalRepresentatives: newReps });
                                                }}
                                                className="absolute top-2 right-2 p-1.5 bg-white text-slate-400 hover:text-red-500 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={14} />
                                            </button>

                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">RUT</label>
                                                    <input
                                                        type="text"
                                                        value={rep.rut}
                                                        onChange={e => {
                                                            const newReps = [...companyForm.legalRepresentatives];
                                                            newReps[index].rut = e.target.value;
                                                            setCompanyForm({ ...companyForm, legalRepresentatives: newReps });
                                                        }}
                                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 outline-none text-xs font-bold"
                                                        placeholder="12.345.678-9"
                                                    />
                                                </div>
                                                <div className="md:col-span-2 space-y-1">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Nombre Completo</label>
                                                    <input
                                                        type="text"
                                                        value={rep.name}
                                                        onChange={e => {
                                                            const newReps = [...companyForm.legalRepresentatives];
                                                            newReps[index].name = e.target.value;
                                                            setCompanyForm({ ...companyForm, legalRepresentatives: newReps });
                                                        }}
                                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 outline-none text-xs font-bold"
                                                        placeholder="Nombre Apellido"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Email</label>
                                                    <input
                                                        type="email"
                                                        value={rep.email}
                                                        onChange={e => {
                                                            const newReps = [...companyForm.legalRepresentatives];
                                                            newReps[index].email = e.target.value;
                                                            setCompanyForm({ ...companyForm, legalRepresentatives: newReps });
                                                        }}
                                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 outline-none text-xs font-bold"
                                                        placeholder="nombre@empresa.com"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Teléfono</label>
                                                    <input
                                                        type="text"
                                                        value={rep.phone}
                                                        onChange={e => {
                                                            const newReps = [...companyForm.legalRepresentatives];
                                                            newReps[index].phone = e.target.value;
                                                            setCompanyForm({ ...companyForm, legalRepresentatives: newReps });
                                                        }}
                                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 outline-none text-xs font-bold"
                                                        placeholder="+569..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* SECTION 3: CONTACTOS COMERCIALES */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center border-b border-indigo-100 pb-2">
                                        <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest">Contactos Comerciales</h3>
                                        <button
                                            type="button"
                                            onClick={() => setCompanyForm(prev => ({
                                                ...prev,
                                                commercialContacts: [...prev.commercialContacts, { name: '', phone: '', email: '' }]
                                            }))}
                                            className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-indigo-100 transition-all flex items-center gap-1"
                                        >
                                            <Plus size={12} /> Agregar Contacto
                                        </button>
                                    </div>

                                    {companyForm.commercialContacts.length === 0 && (
                                        <p className="text-xs text-slate-400 italic">No hay contactos comerciales registrados.</p>
                                    )}

                                    {companyForm.commercialContacts.map((contact, index) => (
                                        <div key={index} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 relative group">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newContacts = companyForm.commercialContacts.filter((_, i) => i !== index);
                                                    setCompanyForm({ ...companyForm, commercialContacts: newContacts });
                                                }}
                                                className="absolute top-2 right-2 p-1.5 bg-white text-slate-400 hover:text-red-500 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={14} />
                                            </button>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Nombre</label>
                                                    <input
                                                        type="text"
                                                        value={contact.name}
                                                        onChange={e => {
                                                            const newContacts = [...companyForm.commercialContacts];
                                                            newContacts[index].name = e.target.value;
                                                            setCompanyForm({ ...companyForm, commercialContacts: newContacts });
                                                        }}
                                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 outline-none text-xs font-bold"
                                                        placeholder="Nombre Apellido"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Celular</label>
                                                    <input
                                                        type="text"
                                                        value={contact.phone}
                                                        onChange={e => {
                                                            const newContacts = [...companyForm.commercialContacts];
                                                            newContacts[index].phone = e.target.value;
                                                            setCompanyForm({ ...companyForm, commercialContacts: newContacts });
                                                        }}
                                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 outline-none text-xs font-bold"
                                                        placeholder="+569..."
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Email</label>
                                                    <input
                                                        type="email"
                                                        value={contact.email}
                                                        onChange={e => {
                                                            const newContacts = [...companyForm.commercialContacts];
                                                            newContacts[index].email = e.target.value;
                                                            setCompanyForm({ ...companyForm, commercialContacts: newContacts });
                                                        }}
                                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 outline-none text-xs font-bold"
                                                        placeholder="contacto@empresa.com"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* SECTION 4: CONTRATO */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-100 pb-2">Detalles del Contrato</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Inicio Contrato</label>
                                            <input type="date" value={companyForm.contractStartDate ? companyForm.contractStartDate.split('T')[0] : ''} onChange={e => setCompanyForm({ ...companyForm, contractStartDate: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none transition-all text-xs font-bold" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Duración (Meses)</label>
                                            <input type="number" min="1" value={companyForm.contractDurationMonths} onChange={e => setCompanyForm({ ...companyForm, contractDurationMonths: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none transition-all text-xs font-bold" placeholder="Ej. 12" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Término / Renovación</label>
                                            <input type="date" disabled value={companyForm.contractEndDate ? companyForm.contractEndDate.split('T')[0] : ''} className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed text-xs font-bold" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Límite Usuarios</label>
                                            <input type="number" min="1" value={companyForm.contractedUsersLimit} onChange={e => setCompanyForm({ ...companyForm, contractedUsersLimit: e.target.value })} className="w-full px-4 py-2 bg-indigo-50/50 border border-indigo-100 rounded-xl focus:border-indigo-500 outline-none transition-all text-xs font-bold text-indigo-700" title="Solo editable por SuperAdmin" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Valor Usuario (UF)</label>
                                            <input type="number" step="0.01" value={companyForm.userValueUF} onChange={e => setCompanyForm({ ...companyForm, userValueUF: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none transition-all text-xs font-bold" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Total Mensual (UF)</label>
                                            <input type="number" step="0.01" value={companyForm.monthlyTotalUF} onChange={e => setCompanyForm({ ...companyForm, monthlyTotalUF: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none transition-all text-xs font-bold" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Modo de Servicio</label>
                                            <select
                                                value={companyForm.serviceMode}
                                                onChange={e => setCompanyForm({ ...companyForm, serviceMode: e.target.value })}
                                                className="w-full px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl focus:border-indigo-500 outline-none transition-all text-xs font-bold text-indigo-700"
                                            >
                                                <option value="FULL_HR_360">HR 360 (Integral)</option>
                                                <option value="RECRUITMENT_ONLY">AGENCIA (Solo Reclutamiento)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4 border-t border-slate-100 mt-8">
                                    <button type="button" onClick={() => setShowCompanyModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-slate-200 transition-all">Cancelar</button>
                                    <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">
                                        {editingCompany ? 'Actualizar Contrato' : 'Generar Contrato'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )
            }

            {/* User Modal */}
            {
                showUserModal && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-10">
                                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-8">
                                    {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                                </h2>
                                <form onSubmit={handleSubmitUser} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Column 1: Personal info */}
                                    <div className="space-y-6">
                                        <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-100 pb-2">Información Personal</h3>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="col-span-2 space-y-2">
                                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Nombre Completo</label>
                                                <input type="text" required value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">País</label>
                                                <InternationalInput
                                                    selectedCountry={userForm.country}
                                                    onCountryChange={(code) => setUserForm({ ...userForm, country: code })}
                                                    value={COUNTRIES.find(c => c.code === (userForm.country || 'CL'))?.name || 'Chile'}
                                                    icon={Globe}
                                                    onChange={() => { }}
                                                />
                                            </div>
                                            <InternationalInput
                                                label={COUNTRIES.find(c => c.code === (userForm.country || 'CL'))?.taxIdName || 'RUT'}
                                                name="rut"
                                                value={userForm.rut}
                                                onChange={e => setUserForm({ ...userForm, rut: e.target.value })}
                                                selectedCountry={userForm.country}
                                                icon={User}
                                            />
                                            <InternationalInput
                                                label="Celular"
                                                name="cellphone"
                                                value={userForm.cellphone}
                                                onChange={e => setUserForm({ ...userForm, cellphone: e.target.value })}
                                                selectedCountry={userForm.country}
                                                isPhone={true}
                                                onCountryChange={(code) => setUserForm({ ...userForm, country: code })}
                                            />
                                            <div className="col-span-2 space-y-2">
                                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Email Corporativo</label>
                                                <input type="email" required value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Cargo</label>
                                                <input type="text" value={userForm.position} onChange={e => setUserForm({ ...userForm, position: e.target.value })} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none" />
                                            </div>
                                            <div className="col-span-2 space-y-2">
                                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Contraseña {editingUser ? '(Opcional)' : ''}</label>
                                                <div className="relative">
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        value={userForm.password}
                                                        onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                                                        className={`w-full pl-5 pr-24 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-mono text-indigo-600 ${editingUser && !['CEO_CENTRALIZAT', 'ADMIN_CENTRALIZAT'].includes(auth?.role?.toUpperCase()) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        placeholder={editingUser ? (['CEO_CENTRALIZAT', 'ADMIN_CENTRALIZAT'].includes(auth?.role?.toUpperCase()) ? "Dejar en blanco para mantener actual" : "Solo SuperAdmin puede cambiar la clave") : "Dejar en blanco para autogenerar"}
                                                        disabled={editingUser && !['CEO_CENTRALIZAT', 'ADMIN_CENTRALIZAT'].includes(auth?.role?.toUpperCase())}
                                                    />
                                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                            title={showPassword ? "Ocultar Contraseña" : "Ver Contraseña"}
                                                        >
                                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                        </button>
                                                        {(!editingUser || ['CEO_CENTRALIZAT', 'ADMIN_CENTRALIZAT'].includes(auth?.role?.toUpperCase())) && (
                                                            <button
                                                                type="button"
                                                                onClick={handleGeneratePassword}
                                                                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                                title="Generar Contraseña Segura"
                                                            >
                                                                <Key size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                {editingUser && userForm.password === '' && (
                                                    <p className="text-[10px] text-amber-600 font-bold ml-1">
                                                        * La contraseña actual está oculta por seguridad.
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-100 pb-2 mt-6">Vinculación Empresarial</h3>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Empresa</label>
                                                <select
                                                    value={userForm.companyId}
                                                    onChange={e => {
                                                        const newCompanyId = e.target.value;
                                                        setUserForm(prev => ({
                                                            ...prev,
                                                            companyId: newCompanyId,
                                                            role: newCompanyId ? 'Usuario_Empresa' : 'Usuario_Centralizat'
                                                        }));
                                                    }}
                                                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none"
                                                >
                                                    <option value="">Empresa CENTRALIZA-T (Interno)</option>
                                                    {companies.map(c => (
                                                        <option key={c._id} value={c._id}>{c.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Rol en Sistema</label>
                                                <select
                                                    value={userForm.role}
                                                    onChange={e => setUserForm({ ...userForm, role: e.target.value })}
                                                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none"
                                                >
                                                    <option value="Usuario_Empresa">Usuario_Empresa</option>
                                                    <option value="Admin_Empresa">Admin_Empresa</option>
                                                    <option value="Usuario_Centralizat">Usuario_Centralizat</option>
                                                    <option value="Admin_Centralizat">Admin_Centralizat</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Column 2: Permissions */}
                                    <div className="space-y-6">
                                        <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-100 pb-2">Permisos de Módulos</h3>
                                        <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                            {MODULES_LIST.map(module => {
                                                const perm = userForm.permissions.find(p => p.module === module.id) || { actions: { create: false, read: false, update: false, delete: false } };
                                                const actions = perm.actions || { create: false, read: false, update: false, delete: false };

                                                return (
                                                    <div key={module.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:border-indigo-200 transition-all">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <span className="text-xs font-black uppercase tracking-wider text-slate-700">{module.name}</span>
                                                        </div>
                                                        <div className="grid grid-cols-4 gap-2">
                                                            {[
                                                                { id: 'read', label: 'Ver', icon: Square },
                                                                { id: 'create', label: 'Crear', icon: Plus },
                                                                { id: 'update', label: 'Editar', icon: Pencil },
                                                                { id: 'delete', label: 'Eliminar', icon: Trash2 }
                                                            ].map(actionType => (
                                                                <div
                                                                    key={actionType.id}
                                                                    onClick={() => togglePermission(module.id, actionType.id)}
                                                                    className={`cursor-pointer p-2 rounded-lg border text-center transition-all ${actions[actionType.id]
                                                                        ? 'bg-indigo-100 border-indigo-200 text-indigo-700'
                                                                        : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-200'
                                                                        }`}
                                                                >
                                                                    <div className="flex flex-col items-center gap-1">
                                                                        <actionType.icon size={14} />
                                                                        <span className="text-[9px] font-bold uppercase">{actionType.label}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-bold text-center">
                                            * Selecciona los módulos a los que este usuario tendrá acceso.
                                        </p>
                                    </div>

                                    <div className="col-span-1 lg:col-span-2 flex flex-col md:flex-row gap-4 pt-4 border-t border-slate-100">
                                        <button type="button" onClick={() => setShowUserModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-slate-200 transition-all">Cancelar</button>
                                        {editingUser && ['CEO_CENTRALIZAT', 'ADMIN_CENTRALIZAT'].includes(auth?.role?.toUpperCase()) && (
                                            <button
                                                type="button"
                                                onClick={handleResetAndResend}
                                                className="flex-1 py-4 bg-emerald-100 text-emerald-700 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-emerald-200 border border-emerald-200 transition-all flex items-center justify-center gap-2"
                                            >
                                                <RefreshCw size={16} /> Restablecer y Reenviar
                                            </button>
                                        )}
                                        <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">
                                            {editingUser ? 'Actualizar Usuario' : 'Crear Usuario'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Credentials Modal */}
            {
                showCredentialsModal && createdCredentials && (
                    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[70] p-4 animate-in fade-in duration-300">
                        <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
                            <div className="p-8 text-center space-y-6">
                                <div className="w-20 h-20 bg-emerald-100 rounded-full mx-auto flex items-center justify-center mb-4">
                                    <CheckSquare size={40} className="text-emerald-600" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Usuario Creado Exitosamente</h2>
                                <p className="text-slate-500 text-xs font-bold leading-relaxed">
                                    El usuario ha sido registrado. Aquí tienes sus credenciales de acceso iniciales.
                                </p>

                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-left space-y-4">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email</p>
                                        <p className="text-sm font-bold text-slate-800 break-all select-all">{createdCredentials.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contraseña</p>
                                        <p className="text-xl font-mono font-black text-indigo-600 select-all">{createdCredentials.password}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(`Credenciales Centraliza-T:\nEmail: ${createdCredentials.email}\nPassword: ${createdCredentials.password}\nURL: https://centraliza-t.synoptyk.cl`);
                                            toast.success('Copiado al portapapeles');
                                        }}
                                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                                    >
                                        Copiar Credenciales
                                    </button>
                                    <button
                                        onClick={async () => {
                                            try {
                                                toast.loading('Enviando correo...');
                                                await api.post('/users/resend-credentials', {
                                                    name: createdCredentials.name,
                                                    email: createdCredentials.email,
                                                    password: createdCredentials.password
                                                }, { timeout: 45000 });
                                                toast.dismiss();
                                                toast.success('Correo enviado exitosamente');
                                            } catch (error) {
                                                toast.dismiss();
                                                console.error('Resend Error:', error);
                                                toast.error(error.response?.data?.message || 'Error al enviar correo');
                                            }
                                        }}
                                        className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-purple-700 transition-all shadow-lg shadow-purple-200"
                                    >
                                        Reenviar Correo
                                    </button>
                                    <button
                                        onClick={() => setShowCredentialsModal(false)}
                                        className="w-full py-4 bg-white text-slate-500 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-slate-50 transition-all border border-slate-100"
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Bulk Upload Modal */}
            {
                showBulkModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[60] p-4">
                        <div className="bg-white rounded-[3rem] shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-300">
                            <div className="p-10 text-center space-y-8">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Carga Masiva {bulkType === 'companies' ? 'Empresas' : 'Usuarios'}</h2>
                                    <button onClick={() => setShowBulkModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                                        <CloseIcon size={20} className="text-slate-400" />
                                    </button>
                                </div>

                                <div className="p-10 border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50 flex flex-col items-center gap-6 group hover:border-indigo-400 transition-all">
                                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-all">
                                        <FileSpreadsheet size={40} className="text-indigo-600" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Sube tu archivo Excel o CSV</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Formatos admitidos: .xlsx, .xls, .csv</p>
                                    </div>
                                    <label className="w-full">
                                        <input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleBulkUpload} disabled={bulkLoading} />
                                        <div className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] cursor-pointer hover:bg-indigo-500 transition-all flex items-center justify-center gap-3">
                                            {bulkLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Upload size={16} /> Seleccionar Archivo</>}
                                        </div>
                                    </label>
                                </div>

                                <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 flex gap-4 text-left">
                                    <AlertCircle className="text-amber-600 flex-shrink-0" size={20} />
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Asegúrate de usar la plantilla correcta</p>
                                        <p className="text-[9px] text-amber-700 font-bold leading-relaxed">Los nombres de las columnas deben coincidir exactamente para que la carga sea exitosa.</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleDownloadTemplate(bulkType)}
                                    className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-200 transition-all flex items-center justify-center gap-3"
                                >
                                    <Download size={16} /> Descargar Plantilla .XLSX
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </PageWrapper >
    );
};

// Help helper components to keep main return clean
function CompanyCard({ company, onEdit, onDelete }) {
    return (
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Building2 size={24} className="text-indigo-600" />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{company.name}</h3>
                    <div className="flex gap-4 text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">
                        <span>RUT: {company.rut}</span>
                        {company.industry && <span> | {company.industry}</span>}
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => onEdit(company)} className="p-2 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 border border-slate-100 transition-all shadow-sm"><Pencil size={16} /></button>
                    <button onClick={() => onDelete(company._id)} className="p-2 bg-white text-red-500 rounded-xl hover:bg-red-50 border border-slate-100 transition-all shadow-sm"><Trash2 size={16} /></button>
                </div>
            </div>
        </div>
    );
}

function UserCard({ user, onEdit, onDelete }) {
    return (
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-md transition-all h-full flex flex-col justify-between">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                    <Users size={24} className="text-violet-600" />
                </div>
                <div className="flex-1">
                    <h3 className="text-base font-black text-slate-900 uppercase tracking-tight leading-tight">{user.name}</h3>
                    <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider">{user.position || 'Colaborador'}</p>
                </div>
            </div>
            <div className="space-y-3">
                <div className="flex flex-col gap-0.5">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Contacto</p>
                    <p className="text-xs font-bold text-slate-700 truncate">{user.email}</p>
                </div>
                <div className="flex flex-col gap-0.5">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Empresa</p>
                    <p className="text-xs font-bold text-slate-700">{user.companyId?.name || 'CENTRALIZA-T'}</p>
                </div>
                <div className="pt-4 flex items-center justify-between">
                    <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${user.role.includes('Admin') ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                        {user.role}
                    </span>
                    <div className="flex gap-1">
                        <button onClick={() => onEdit(user)} className="p-2 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 border border-slate-100 transition-all"><Pencil size={14} /></button>
                        <button onClick={() => onDelete(user._id)} className="p-2 bg-white text-red-500 rounded-xl hover:bg-red-50 border border-slate-100 transition-all"><Trash2 size={14} /></button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function NoDataMessage({ icon: Icon, tab }) {
    return (
        <div className="p-12 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl mx-auto flex items-center justify-center text-slate-300">
                <Icon size={40} />
            </div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tighter">No hay {tab} activas</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Las nuevas {tab} aparecerán aquí una vez registradas.</p>
        </div>
    );
}

export default CommandCenter;
