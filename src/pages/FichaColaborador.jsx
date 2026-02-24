import React, { useState, useEffect } from 'react';
import {
    User, HardHat, CreditCard, ShoppingBag, Save, UserCheck, UserPlus,
    Upload, Trash2, Plus, Loader2, Search, Info, CheckCircle2,
    Calendar, Plane, Briefcase, Phone, Mail, MapPin, Camera, DollarSign,
    Clock, Building2, LayoutGrid, ExternalLink
} from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import Topbar from '../components/Topbar';
import usePermissions from '../hooks/usePermissions';
import PageWrapper from '../components/PageWrapper';
import PrintConfigModal from '../components/PrintConfigModal';

const ChileanData = {
    afps: ['PlanVital', 'Provida', 'Capital', 'Cuprum', 'Habitat', 'Modelo', 'Uno'],
    isapres: ['Banmédica', 'Colmena', 'Cruz Blanca', 'Consalud', 'Nueva Masvida', 'Vida Tres', 'Esencial'],
    banks: ['Banco de Chile', 'Banco Estado', 'Santander', 'BCI', 'Itaú', 'Scotiabank', 'Banco BICE', 'Banco Security', 'Banco Falabella', 'Banco Ripley', 'Banco Internacional', 'Banco Consorcio'],
    accountTypes: ['Cuenta Corriente', 'Cuenta Vista / RUT', 'Cuenta de Ahorro'],
    civilStatus: ['Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a', 'Conviviente Civil'],
    contractTypes: ['Plazo Fijo', 'Indefinido', 'Por Obra o Faena'],
    shifts: ['Mañana (08:00 - 16:00)', 'Tarde (16:00 - 00:00)', 'Noche (00:00 - 08:00)', '4x4', 'rotativo', 'Administrativo'],
    bonusTypes: ['Bono Asistencia', 'Bono Producción', 'Bono Movilización', 'Bono Colación', 'Gratificación']
};

const SolicitudContratacion = ({ applicant, formData }) => {
    if (!applicant) return null;
    const personal = formData.personal;
    const logistics = formData.logistics;
    const contract = formData.contract;

    const Cell = ({ label, value, className = "" }) => (
        <div className={`border border-slate-900 flex flex-col min-h-[45px] ${className}`}>
            <div className="flex-1 px-2 py-1 text-[12px] font-bold text-slate-800 flex items-center justify-center text-center uppercase">
                {value || ''}
            </div>
            <div className="bg-slate-50 border-t border-slate-900 px-1 py-0.5 text-[8px] font-black text-slate-500 text-center uppercase tracking-tighter">
                {label}
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto bg-white p-8 font-sans print:p-0">
            {/* Header */}
            <div className="flex border border-slate-900 mb-6">
                <div className="w-40 border-r border-slate-900 p-4 flex items-center justify-center text-center text-[10px] font-bold text-slate-300">
                    LOGO EMPRESA
                </div>
                <div className="flex-1 p-4 text-center">
                    <h1 className="text-xl font-black text-slate-700 uppercase">Solicitud de Contratación</h1>
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Documento Oficial de Registro</p>
                </div>
            </div>

            {/* Names */}
            <div className="grid grid-cols-3 mb-4">
                <Cell label="Apellido Paterno" value={personal.lastNamePaterno} />
                <Cell label="Apellido Materno" value={personal.lastNameMaterno} />
                <Cell label="Nombres" value={personal.firstName} />
            </div>

            {/* ID / Civil Info */}
            <div className="grid grid-cols-4 mb-4">
                <Cell label="Fecha Nacimiento" value={personal.birthDate} />
                <Cell label="Cedula Identidad" value={applicant.rut} />
                <Cell label="Nacionalidad" value={personal.nationality} />
                <Cell label="Estado Civil" value={personal.civilStatus} />
            </div>

            {/* Health / AFP */}
            <div className="grid grid-cols-5 mb-0">
                <Cell label="A.F.P." value={formData.prevision.afp} />
                <Cell label="Prev. Salud" value={formData.prevision.healthSystem.provider || formData.prevision.healthSystem.type} />
                <Cell label="Plan de Salud Pactado" value={formData.prevision.healthSystem.planAmount > 0 ? `${formData.prevision.healthSystem.planAmount} ${formData.prevision.healthSystem.planCurrency}` : 'Legal 7%'} />
                <Cell label="Telefono" value={applicant.phone} />
                <Cell label="Celular" value={applicant.phone} />
            </div>
            <div className="grid grid-cols-3 mb-4">
                <Cell label="e-mail" value={applicant.email} className="col-span-1" />
                <Cell label="Cta Bancaria / Banco" value={`${formData.financial.bankData.bank} - ${formData.financial.bankData.accountNumber}`} className="col-span-1" />
                <Cell label="Lic. Conducir" value={personal.driverLicense} className="col-span-1" />
            </div>

            {/* Address */}
            <div className="grid grid-cols-3 mb-6">
                <Cell label="Domicilio" value={applicant.address} />
                <Cell label="Comuna" value={personal.commune} />
                <Cell label="Ciudad" value={personal.city} />
            </div>

            {/* Sizes */}
            <div className="flex items-center gap-8 mb-8 px-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tallas</span>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold">Camisa</span>
                    <div className="w-20 h-8 border border-slate-900 flex items-center justify-center font-bold text-xs">{logistics.clothingSizes.shirt}</div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold">Pantalón</span>
                    <div className="w-20 h-8 border border-slate-900 flex items-center justify-center font-bold text-xs">{logistics.clothingSizes.pants}</div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold">Zapatos</span>
                    <div className="w-20 h-8 border border-slate-900 flex items-center justify-center font-bold text-xs">{logistics.clothingSizes.shoes}</div>
                </div>
            </div>

            {/* Family Table */}
            <table className="w-full border-collapse border border-slate-900 mb-6 text-[10px]">
                <thead>
                    <tr className="bg-slate-50">
                        <th className="border border-slate-900 py-2 uppercase tracking-widest">Nombre</th>
                        <th className="border border-slate-900 py-2 uppercase tracking-widest w-40">Fecha Nacimiento</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="border border-slate-900 p-2 font-bold">CÓNYUGE: {personal.spouse.name}</td>
                        <td className="border border-slate-900 p-2 text-center">{personal.spouse.birthDate}</td>
                    </tr>
                    <tr>
                        <td className="border border-slate-900 p-2 font-black bg-slate-50/50" colSpan="2">HIJOS</td>
                    </tr>
                    {personal.children.map((child, idx) => (
                        <tr key={idx}>
                            <td className="border border-slate-900 p-2">{child.name}</td>
                            <td className="border border-slate-900 p-2 text-center">{child.birthDate}</td>
                        </tr>
                    ))}
                    {[...Array(Math.max(0, 5 - personal.children.length))].map((_, i) => (
                        <tr key={`empty-${i}`}>
                            <td className="border border-slate-900 p-2 h-8"></td>
                            <td className="border border-slate-900 p-2"></td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Emergency Contact */}
            <div className="grid grid-cols-3 mb-6">
                <Cell label="Nombre Contacto de Emergencia" value={formData.emergencyContact.name} />
                <Cell label="Mail" value="" />
                <Cell label="Telefono" value={formData.emergencyContact.phone} />
            </div>

            {/* Signature Area */}
            <div className="grid grid-cols-3 mb-8">
                <Cell label="Cargo al que postula" value={applicant.position} />
                <Cell label="Firma" value="" />
                <Cell label="Fecha" value={contract.startDate} />
            </div>

            <p className="text-[10px] italic text-slate-500 mb-12">Los datos aquí expresados son de exclusiva responsabilidad del trabajador.</p>

            <div className="border-t border-slate-200 pt-2 flex justify-end">
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">CENTRALIZA-T ECOSYSTEM</span>
            </div>
        </div>
    );
};

const FichaColaborador = ({ onOpenCENTRALIZAT, auth, onLogout }) => {
    const [applicants, setApplicants] = useState([]);
    const [selectedId, setSelectedId] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('personal');
    const [disciplinaryRecords, setDisciplinaryRecords] = useState([]);
    const [commendationRecords, setCommendationRecords] = useState([]); // personal, prevision, financial, logistics

    const [formData, setFormData] = useState({
        personal: {
            firstName: '',
            lastNamePaterno: '',
            lastNameMaterno: '',
            birthDate: '',
            civilStatus: 'Soltero/a',
            nationality: 'Chilena',
            isPensioner: false,
            commune: '',
            city: '',
            driverLicense: '',
            spouse: { name: '', birthDate: '' },
            children: []
        },
        prevision: { healthSystem: { provider: 'Fonasa', type: 'Fonasa', planAmount: 0, planCurrency: 'Pesos' }, afp: 'Modelo' },
        familyAllowances: [],
        emergencyContact: { name: '', phone: '' },
        financial: { liquidSalary: 0, bonuses: [], bankData: { bank: '', accountType: 'Cuenta Vista / RUT', accountNumber: '' } },
        logistics: { shift: [], clothingSizes: { shirt: '', jacket: '', pants: '', shoes: '' } },
        contract: { startDate: '', type: 'Plazo Fijo', durationMonths: 1, endDate: '' },
        vacations: { accruedDays: 0, takenDays: 0, lastCalculationDate: null }
    });
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [printMode, setPrintMode] = useState('download'); // 'print' or 'download'
    const [form, setForm] = useState({ bank: '', accountType: '', accountNumber: '', healthSystem: '', pensionSystem: '' });
    const { canUpdate } = usePermissions('ficha-colaborador');

    useEffect(() => {
        fetchAwaitingApplicants();
    }, []);

    const fetchAwaitingApplicants = async () => {
        setLoading(true);
        try {
            const res = await api.get('/applicants');
            // Filtrar los que están en proceso de aprobación o ya aprobados para cargar su ficha
            const awaiting = res.data.filter(a => ['Pendiente Aprobación Gerencia', 'Aprobado para Contratación', 'Acreditación'].includes(a.status));
            setApplicants(awaiting);
        } catch (error) {
            toast.error('Error al cargar postulantes');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async (config, mode = 'download') => {
        if (!selectedId) return;
        setIsPrintModalOpen(false);
        const applicant = applicants.find(a => a._id === selectedId);
        const loadingToast = toast.loading(`${mode === 'print' ? 'Preparando impresión' : 'Generando PDF'} para ${applicant.fullName}...`);

        try {
            const queryParams = new URLSearchParams({
                format: config.format,
                margin: config.margin,
                fitToPage: config.fitToPage
            }).toString();

            const res = await api.get(`/exports/profile/${selectedId}?${queryParams}`, { responseType: 'blob' });
            const blob = new Blob([res.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);

            if (mode === 'print') {
                const printWindow = window.open(url, '_blank');
                if (printWindow) {
                    printWindow.onload = () => {
                        printWindow.print();
                    };
                    toast.success('Documento listo para impresión', { id: loadingToast });
                } else {
                    toast.error('Por favor, permite las ventanas emergentes para imprimir', { id: loadingToast });
                }
            } else {
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `Ficha_${applicant.rut}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                toast.success('PDF generado con éxito', { id: loadingToast });
            }
        } catch (error) {
            console.error('Error downloading PDF:', error);
            toast.error('Error al procesar el documento', { id: loadingToast });
        }
    };

    const handleSelectApplicant = async (id) => {
        setSelectedId(id);
        const app = applicants.find(a => a._id === id);
        if (app && app.workerData) {
            // Transform dates to input format YYYY-MM-DD
            const wd = { ...app.workerData };
            if (wd.personal?.birthDate) wd.personal.birthDate = wd.personal.birthDate.split('T')[0];
            if (wd.personal?.spouse?.birthDate) wd.personal.spouse.birthDate = wd.personal.spouse.birthDate.split('T')[0];
            if (wd.personal?.children) {
                wd.personal.children = wd.personal.children.map(c => ({
                    ...c,
                    birthDate: c.birthDate ? c.birthDate.split('T')[0] : ''
                }));
            }
            if (wd.contract?.startDate) wd.contract.startDate = wd.contract.startDate.split('T')[0];
            if (wd.contract?.endDate) wd.contract.endDate = wd.contract.endDate.split('T')[0];

            // Attempt to pre-fill names from fullName if not already set
            if (!wd.personal?.firstName && app.fullName) {
                const parts = app.fullName.split(' ');
                if (parts.length >= 3) {
                    wd.personal = {
                        ...wd.personal,
                        firstName: parts[0],
                        lastNamePaterno: parts[parts.length - 2],
                        lastNameMaterno: parts[parts.length - 1]
                    };
                } else {
                    wd.personal = { ...wd.personal, firstName: app.fullName };
                }
            }

            setFormData(prev => ({ ...prev, ...wd }));

            // Fetch Labor Records
            try {
                const [discRes, commRes] = await Promise.all([
                    api.get(`/records/disciplinary?applicantId=${id}`),
                    api.get(`/records/commendations?applicantId=${id}`)
                ]);
                setDisciplinaryRecords(discRes.data);
                setCommendationRecords(commRes.data);
            } catch (error) {
                console.error('Error fetching records:', error);
            }
        }
    };

    const handleSave = async (isFinal = false) => {
        if (!selectedId) return toast.error('Seleccione un postulante');

        const applicant = applicants.find(a => a._id === selectedId);

        if (isFinal) {
            // Validaciones Estrictas para Gerencia
            if (!formData.financial.liquidSalary || formData.financial.liquidSalary <= 0) {
                return toast.error('Debe ingresar un Sueldo Líquido válido');
            }
            if (!formData.financial.bankData.bank || !formData.financial.bankData.accountNumber) {
                return toast.error('Debe completar los datos bancarios para el depósito');
            }
            if (!formData.contract.startDate) {
                return toast.error('Debe definir la Fecha de Inicio de contrato');
            }
        }

        setSaving(true);
        try {
            let statusUpdate = isFinal ? 'Enviado para Aprobación' : 'En Proceso Validación';

            // Bypass logic for Direct Hire
            if (isFinal && applicant?.isDirectHire) {
                statusUpdate = 'Contratado';
            }

            const payload = {
                workerData: { ...formData, validationStatus: statusUpdate === 'Contratado' ? 'Aprobado' : statusUpdate }
            };

            // Si es final y no es ingreso directo, gatillar el cambio de estado global para que aparezca en la cola de gerencia
            if (isFinal) {
                payload.status = statusUpdate === 'Contratado' ? 'Contratado' : 'Pendiente Aprobación Gerencia';
                if (statusUpdate === 'Contratado') {
                    payload.hiring = {
                        ...applicant.hiring,
                        managerApproval: 'Aprobado',
                        approvedBy: 'Ingreso Directo (Admin)',
                        contractStartDate: formData.contract.startDate,
                        contractType: formData.contract.type
                    };
                }
            }

            await api.put(`/applicants/${selectedId}`, payload);
            toast.success(statusUpdate === 'Contratado' ? 'Colaborador Contratado Exitosamente' : (isFinal ? 'Enviado a revisión de Gerencia' : 'Progreso guardado'));
            setSelectedId(''); // Limpiar selección para forzar refresco total de la cola
            fetchAwaitingApplicants();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al guardar datos');
        } finally {
            setSaving(false);
        }
    };

    const addBonus = () => {
        setFormData(prev => ({
            ...prev,
            financial: {
                ...prev.financial,
                bonuses: [...prev.financial.bonuses, { name: '', amount: 0 }]
            }
        }));
    };

    const removeBonus = (index) => {
        setFormData(prev => ({
            ...prev,
            financial: {
                ...prev.financial,
                bonuses: prev.financial.bonuses.filter((_, i) => i !== index)
            }
        }));
    };

    const SectionTitle = ({ title, icon: Icon }) => (
        <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <Icon size={20} />
            </div>
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{title}</h3>
        </div>
    );

    const Label = ({ children }) => <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">{children}</label>;

    const Input = ({ ...props }) => (
        <input
            {...props}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
        />
    );

    const Select = ({ children, ...props }) => (
        <select
            {...props}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
        >
            {children}
        </select>
    );

    return (
        <PageWrapper
            className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto"
            title="FICHA MAESTRA DE COLABORADOR"
            subtitle="Registro unificado de datos contractuales y personales"
            icon={UserPlus}
            auth={auth}
            onLogout={onLogout}
            headerActions={
                <div className="flex items-center gap-4">
                    {selectedId && (
                        <>
                            <button
                                onClick={() => {
                                    setPrintMode('download');
                                    setIsPrintModalOpen(true);
                                }}
                                className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20 hover:bg-white/20 transition-all flex items-center gap-2 text-xs font-bold text-white uppercase tracking-widest"
                            >
                                <FileText size={16} /> Descargar PDF
                            </button>
                            <button
                                onClick={() => {
                                    setPrintMode('print');
                                    setIsPrintModalOpen(true);
                                }}
                                className="bg-emerald-500 px-4 py-2 rounded-xl border border-emerald-400 hover:bg-emerald-600 transition-all flex items-center gap-2 text-xs font-bold text-white uppercase tracking-widest shadow-lg shadow-emerald-500/20"
                            >
                                <Plus size={16} /> Imprimir
                            </button>
                            <button
                                onClick={() => {
                                    const app = applicants.find(a => a._id === selectedId);
                                    if (app) onOpenCENTRALIZAT(app);
                                }}
                                className="bg-indigo-600 px-4 py-2 rounded-xl border border-indigo-500 hover:bg-indigo-700 transition-all flex items-center gap-2 text-xs font-bold text-white uppercase tracking-widest"
                                title="Ver CENTRALIZAT"
                            >
                                <ExternalLink size={16} />
                                CENTRALIZAT
                            </button>
                        </>
                    )}
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={16} />
                        <select
                            className="w-full pl-10 pr-4 py-2 bg-black/20 text-white border border-white/10 rounded-xl text-xs font-bold uppercase tracking-wider outline-none cursor-pointer appearance-none focus:bg-black/30 transition-all"
                            onChange={(e) => handleSelectApplicant(e.target.value)}
                            value={selectedId}
                        >
                            <option value="" className="text-slate-900 bg-white">Seleccionar Postulante...</option>
                            {applicants.map(app => (
                                <option key={app._id} value={app._id} className="text-slate-900 bg-white">{app.fullName} - {app.rut}</option>
                            ))}
                        </select>
                    </div>
                </div>
            }
        >

            {selectedId ? (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar Tabs */}
                    <div className="lg:col-span-1 space-y-2">
                        {[
                            { id: 'personal', label: 'Datos Personales', icon: User },
                            { id: 'prevision', label: 'Previsión y Salud', icon: HardHat },
                            { id: 'financial', label: 'Remuneraciones', icon: CreditCard },
                            { id: 'logistics', label: 'Logística y Tallas', icon: ShoppingBag },
                            { id: 'vacations', label: 'Vacaciones/Descansos', icon: Plane },
                            { id: 'conducta', label: 'Conducta y Méritos', icon: Trophy },
                            { id: 'preview_solicitud', label: 'Previsualizar Solicitud', icon: LayoutGrid },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-4 px-6 py-4 rounded-3xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'bg-white text-slate-400 border border-slate-50 hover:bg-slate-50'}`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}

                        <div className="pt-8 space-y-4">
                            <button
                                onClick={() => handleSave(false)}
                                className="w-full py-4 bg-emerald-50 text-emerald-600 rounded-3xl font-black text-xs uppercase tracking-widest border border-emerald-100 hover:bg-emerald-100 transition-all flex items-center justify-center gap-3"
                            >
                                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                Guardar Borrador
                            </button>
                            <button
                                onClick={() => handleSave(true)}
                                className={`w-full py-4 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 ${applicants.find(a => a._id === selectedId)?.isDirectHire ? 'bg-emerald-600 shadow-emerald-200 hover:bg-emerald-700' : 'bg-indigo-600 shadow-indigo-200 hover:bg-indigo-700'} text-white`}
                            >
                                {applicants.find(a => a._id === selectedId)?.isDirectHire ? (
                                    <>
                                        <UserCheck size={16} />
                                        Finalizar y Contratar
                                    </>
                                ) : (
                                    <>
                                        <UserCheck size={16} />
                                        Enviar a Gerencia
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Main Content Pane */}
                    <div className="lg:col-span-3 bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
                        {activeTab === 'personal' && (
                            <div className="animate-in slide-in-from-right-4 duration-500">
                                <SectionTitle title="Información Personal" icon={User} />
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <Label>Nombres</Label>
                                        <Input value={formData.personal.firstName} onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, firstName: e.target.value } })} />
                                    </div>
                                    <div>
                                        <Label>Apellido Paterno</Label>
                                        <Input value={formData.personal.lastNamePaterno} onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, lastNamePaterno: e.target.value } })} />
                                    </div>
                                    <div>
                                        <Label>Apellido Materno</Label>
                                        <Input value={formData.personal.lastNameMaterno} onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, lastNameMaterno: e.target.value } })} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                                    <div>
                                        <Label>Fecha de Nacimiento</Label>
                                        <Input type="date" value={formData.personal.birthDate} onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, birthDate: e.target.value } })} />
                                    </div>
                                    <div>
                                        <Label>Estado Civil</Label>
                                        <Select value={formData.personal.civilStatus} onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, civilStatus: e.target.value } })}>
                                            {ChileanData.civilStatus.map(s => <option key={s} value={s}>{s}</option>)}
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Nacionalidad</Label>
                                        <Input type="text" value={formData.personal.nationality} onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, nationality: e.target.value } })} />
                                    </div>
                                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                        <input
                                            type="checkbox"
                                            checked={formData.personal.isPensioner}
                                            onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, isPensioner: e.target.checked } })}
                                            className="w-5 h-5 rounded-lg border-2 border-slate-300 appearance-none checked:bg-indigo-600 checked:border-indigo-600 cursor-pointer transition-all"
                                        />
                                        <span className="text-sm font-bold text-slate-700">¿Es Pensionado?</span>
                                        <Info size={14} className="text-slate-400" />
                                    </div>
                                </div>

                                <div className="mt-12">
                                    <SectionTitle title="Domicilio y Otros" icon={MapPin} />
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="md:col-span-1">
                                            <Label>Comuna</Label>
                                            <Input placeholder="Ej: Providencia" value={formData.personal.commune} onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, commune: e.target.value } })} />
                                        </div>
                                        <div className="md:col-span-1">
                                            <Label>Ciudad</Label>
                                            <Input placeholder="Ej: Santiago" value={formData.personal.city} onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, city: e.target.value } })} />
                                        </div>
                                        <div>
                                            <Label>Lic. Conducir</Label>
                                            <Input placeholder="Ej: Clase B" value={formData.personal.driverLicense} onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, driverLicense: e.target.value } })} />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-12">
                                    <SectionTitle title="Carga Familiar" icon={UserPlus} />
                                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-8">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Cónyuge</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <Label>Nombre Cónyuge</Label>
                                                <Input value={formData.personal.spouse.name} onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, spouse: { ...formData.personal.spouse, name: e.target.value } } })} />
                                            </div>
                                            <div>
                                                <Label>Fecha Nacimiento Cónyuge</Label>
                                                <Input type="date" value={formData.personal.spouse.birthDate} onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, spouse: { ...formData.personal.spouse, birthDate: e.target.value } } })} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hijos</h4>
                                            <button
                                                onClick={() => setFormData({ ...formData, personal: { ...formData.personal, children: [...formData.personal.children, { name: '', birthDate: '' }] } })}
                                                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
                                            >
                                                + Agregar Hijo
                                            </button>
                                        </div>
                                        {formData.personal.children.map((child, idx) => (
                                            <div key={idx} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm animate-in zoom-in-95 duration-200">
                                                <div className="flex-1">
                                                    <Label>Nombre Hijo/a</Label>
                                                    <Input value={child.name} onChange={(e) => {
                                                        const newChildren = [...formData.personal.children];
                                                        newChildren[idx].name = e.target.value;
                                                        setFormData({ ...formData, personal: { ...formData.personal, children: newChildren } });
                                                    }} />
                                                </div>
                                                <div className="w-48">
                                                    <Label>Fecha Nacimiento</Label>
                                                    <Input type="date" value={child.birthDate} onChange={(e) => {
                                                        const newChildren = [...formData.personal.children];
                                                        newChildren[idx].birthDate = e.target.value;
                                                        setFormData({ ...formData, personal: { ...formData.personal, children: newChildren } });
                                                    }} />
                                                </div>
                                                {canUpdate && (
                                                    <button
                                                        onClick={() => {
                                                            const newChildren = formData.personal.children.filter((_, i) => i !== idx);
                                                            setFormData({ ...formData, personal: { ...formData.personal, children: newChildren } });
                                                        }}
                                                        className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all self-end mb-1"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        {formData.personal.children.length === 0 && (
                                            <p className="text-center py-8 text-slate-300 font-bold text-xs uppercase tracking-widest border-2 border-dashed border-slate-50 rounded-3xl">Sin hijos registrados</p>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-12">
                                    <SectionTitle title="Contacto de Emergencia" icon={Phone} />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <Label>Nombre Completo</Label>
                                            <Input placeholder="Ej: Maria Lopez" value={formData.emergencyContact.name} onChange={(e) => setFormData({ ...formData, emergencyContact: { ...formData.emergencyContact, name: e.target.value } })} />
                                        </div>
                                        <div>
                                            <Label>Teléfono Emergencia</Label>
                                            <Input placeholder="+56 9..." value={formData.emergencyContact.phone} onChange={(e) => setFormData({ ...formData, emergencyContact: { ...formData.emergencyContact, phone: e.target.value } })} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'prevision' && (
                            <div className="animate-in slide-in-from-right-4 duration-500">
                                <SectionTitle title="Sistema Previsional" icon={HardHat} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="md:col-span-2 flex p-1 bg-slate-100 rounded-[2rem] mb-4">
                                        {['Fonasa', 'Isapre'].map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setFormData({ ...formData, prevision: { ...formData.prevision, healthSystem: { ...formData.prevision.healthSystem, type } } })}
                                                className={`flex-1 py-3.5 rounded-[1.75rem] text-xs font-black uppercase tracking-widest transition-all ${formData.prevision.healthSystem.type === type ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                    {formData.prevision.healthSystem.type === 'Isapre' ? (
                                        <>
                                            <div>
                                                <Label>Isapre</Label>
                                                <Select value={formData.prevision.healthSystem.provider} onChange={(e) => setFormData({ ...formData, prevision: { ...formData.prevision, healthSystem: { ...formData.prevision.healthSystem, provider: e.target.value } } })}>
                                                    <option value="">Seleccione Isapre</option>
                                                    {ChileanData.isapres.map(i => <option key={i} value={i}>{i}</option>)}
                                                </Select>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label>Monto Plan</Label>
                                                    <Input type="number" value={formData.prevision.healthSystem.planAmount} onChange={(e) => setFormData({ ...formData, prevision: { ...formData.prevision, healthSystem: { ...formData.prevision.healthSystem, planAmount: e.target.value } } })} />
                                                </div>
                                                <div>
                                                    <Label>Moneda</Label>
                                                    <Select value={formData.prevision.healthSystem.planCurrency} onChange={(e) => setFormData({ ...formData, prevision: { ...formData.prevision, healthSystem: { ...formData.prevision.healthSystem, planCurrency: e.target.value } } })}>
                                                        <option value="Pesos">Pesos ($)</option>
                                                        <option value="UF">UF</option>
                                                    </Select>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="md:col-span-2 p-6 bg-indigo-50 border border-indigo-100 rounded-3xl">
                                            <div className="flex items-center gap-4 text-indigo-600">
                                                <CheckCircle2 size={24} />
                                                <div>
                                                    <p className="font-black text-sm uppercase tracking-tight">FONASA Seleccionado</p>
                                                    <p className="text-xs font-bold opacity-70">El descuento se aplicará automáticamente según el 7% legal.</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="md:col-span-2">
                                        <Label>AFP</Label>
                                        <Select
                                            disabled={formData.personal.isPensioner}
                                            value={formData.prevision.afp}
                                            onChange={(e) => setFormData({ ...formData, prevision: { ...formData.prevision, afp: e.target.value } })}
                                            className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none transition-all ${formData.personal.isPensioner ? 'opacity-30' : 'cursor-pointer'}`}
                                        >
                                            {ChileanData.afps.map(a => <option key={a} value={a}>{a}</option>)}
                                        </Select>
                                        {formData.personal.isPensioner && <p className="mt-2 text-[10px] text-amber-600 font-bold uppercase flex items-center gap-1"><Info size={10} /> Pensionado exento de cotización AFP</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'financial' && (
                            <div className="animate-in slide-in-from-right-4 duration-500">
                                <SectionTitle title="Remuneraciones y Pagos" icon={CreditCard} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                                    <div>
                                        <Label>Sueldo Líquido Pactado</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input type="number" className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none" value={formData.financial.liquidSalary} onChange={(e) => setFormData({ ...formData, financial: { ...formData.financial, liquidSalary: e.target.value } })} />
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-end">
                                        <button onClick={addBonus} className="flex items-center justify-center gap-2 py-3.5 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95">
                                            <Plus size={16} /> Agregar Bono
                                        </button>
                                    </div>
                                </div>

                                {formData.financial.bonuses.map((bonus, idx) => (
                                    <div key={idx} className="flex items-center gap-4 mb-4 animate-in fade-in zoom-in duration-300">
                                        <div className="flex-1">
                                            <Input placeholder="Nombre del Bono" value={bonus.name} onChange={(e) => {
                                                const newBonuses = [...formData.financial.bonuses];
                                                newBonuses[idx].name = e.target.value;
                                                setFormData({ ...formData, financial: { ...formData.financial, bonuses: newBonuses } });
                                            }} />
                                        </div>
                                        <div className="w-48">
                                            <Input type="number" placeholder="Monto" value={bonus.amount} onChange={(e) => {
                                                const newBonuses = [...formData.financial.bonuses];
                                                newBonuses[idx].amount = e.target.value;
                                                setFormData({ ...formData, financial: { ...formData.financial, bonuses: newBonuses } });
                                            }} />
                                        </div>
                                        <button onClick={() => removeBonus(idx)} className="p-3.5 text-red-500 bg-red-50 rounded-2xl hover:bg-red-100 transition-all">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                ))}

                                <div className="mt-12 bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100">
                                    <SectionTitle title="Datos de Depósito" icon={Building2} />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <Label>Banco</Label>
                                            <Select value={formData.financial.bankData.bank} onChange={(e) => setFormData({ ...formData, financial: { ...formData.financial, bankData: { ...formData.financial.bankData, bank: e.target.value } } })}>
                                                <option value="">Seleccionar Banco</option>
                                                {ChileanData.banks.map(b => <option key={b} value={b}>{b}</option>)}
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>Tipo de Cuenta</Label>
                                            <Select value={formData.financial.bankData.accountType} onChange={(e) => setFormData({ ...formData, financial: { ...formData.financial, bankData: { ...formData.financial.bankData, accountType: e.target.value } } })}>
                                                {ChileanData.accountTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                            </Select>
                                        </div>
                                        <div className="md:col-span-2">
                                            <Label>Número de Cuenta</Label>
                                            <Input value={formData.financial.bankData.accountNumber} onChange={(e) => setFormData({ ...formData, financial: { ...formData.financial, bankData: { ...formData.financial.bankData, accountNumber: e.target.value } } })} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'logistics' && (
                            <div className="animate-in slide-in-from-right-4 duration-500">
                                <SectionTitle title="Equipamiento y Turnos" icon={LayoutGrid} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Tallas de Ropa</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label>Polera/Camisa</Label>
                                                <Input placeholder="Ej: M, L, XL" value={formData.logistics.clothingSizes.shirt} onChange={(e) => setFormData({ ...formData, logistics: { ...formData.logistics, clothingSizes: { ...formData.logistics.clothingSizes, shirt: e.target.value } } })} />
                                            </div>
                                            <div>
                                                <Label>Pantalón</Label>
                                                <Input placeholder="Ej: 42, 44" value={formData.logistics.clothingSizes.pants} onChange={(e) => setFormData({ ...formData, logistics: { ...formData.logistics, clothingSizes: { ...formData.logistics.clothingSizes, pants: e.target.value } } })} />
                                            </div>
                                            <div>
                                                <Label>Chaqueta/Polar</Label>
                                                <Input placeholder="Ej: L" value={formData.logistics.clothingSizes.jacket} onChange={(e) => setFormData({ ...formData, logistics: { ...formData.logistics, clothingSizes: { ...formData.logistics.clothingSizes, jacket: e.target.value } } })} />
                                            </div>
                                            <div>
                                                <Label>Calzado</Label>
                                                <Input placeholder="Ej: 42" value={formData.logistics.clothingSizes.shoes} onChange={(e) => setFormData({ ...formData, logistics: { ...formData.logistics, clothingSizes: { ...formData.logistics.clothingSizes, shoes: e.target.value } } })} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Turnos Asignados</h4>
                                        <div className="space-y-3">
                                            {ChileanData.shifts.map(s => (
                                                <label key={s} className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:bg-white hover:border-indigo-200 transition-all group">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.logistics.shift.includes(s)}
                                                        onChange={(e) => {
                                                            const newShifts = e.target.checked
                                                                ? [...formData.logistics.shift, s]
                                                                : formData.logistics.shift.filter(item => item !== s);
                                                            setFormData({ ...formData, logistics: { ...formData.logistics, shift: newShifts } });
                                                        }}
                                                        className="w-5 h-5 rounded-lg border-2 border-slate-300 appearance-none checked:bg-indigo-600 checked:border-indigo-600 cursor-pointer"
                                                    />
                                                    <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600">{s}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-16 bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl shadow-indigo-900/10">
                                    <SectionTitle title="Vigencia de Contrato" icon={Clock} />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Fecha de Inicio</label>
                                            <input type="date" className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold text-white outline-none focus:ring-4 focus:ring-indigo-500/20" value={formData.contract.startDate} onChange={(e) => setFormData({ ...formData, contract: { ...formData.contract, startDate: e.target.value } })} />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Tipo de Contrato</label>
                                            <select className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold text-white outline-none cursor-pointer" value={formData.contract.type} onChange={(e) => setFormData({ ...formData, contract: { ...formData.contract, type: e.target.value } })}>
                                                {ChileanData.contractTypes.map(t => <option key={t} value={t} className="bg-slate-900">{t}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'vacations' && (
                            <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
                                <SectionTitle title="Control de Vacaciones y Descansos" icon={Plane} />

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                                    <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 flex flex-col items-center text-center">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Días Devengados</p>
                                        <p className="text-4xl font-black text-slate-900 tracking-tighter">{(formData.vacations?.accruedDays || 0).toFixed(2)}</p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-2 italic">Acumulado a la fecha</p>
                                    </div>
                                    <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 flex flex-col items-center text-center">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 text-rose-500">Días Tomados</p>
                                        <p className="text-4xl font-black text-rose-500 tracking-tighter">{(formData.vacations?.takenDays || 0).toFixed(1)}</p>
                                        <div className="mt-4 w-full">
                                            <Label>Carga Manual</Label>
                                            <Input
                                                type="number"
                                                step="0.5"
                                                className="text-center bg-white"
                                                value={formData.vacations?.takenDays || 0}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    vacations: { ...formData.vacations, takenDays: parseFloat(e.target.value) || 0 }
                                                })}
                                            />
                                        </div>
                                    </div>
                                    <div className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-xl shadow-indigo-100 flex flex-col items-center text-center text-white">
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2 text-white">Saldo Disponible</p>
                                        <p className="text-4xl font-black tracking-tighter text-white">
                                            {((formData.vacations?.accruedDays || 0) - (formData.vacations?.takenDays || 0)).toFixed(2)}
                                        </p>
                                        <p className="text-[10px] font-bold mt-2 italic opacity-60 text-white">Días para el finiquito</p>
                                    </div>
                                </div>

                                <div className="p-8 bg-amber-50 rounded-3xl border border-amber-100 flex gap-6">
                                    <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
                                        <Info size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-amber-900 uppercase tracking-wider mb-2">Nota Importante</p>
                                        <p className="text-xs font-bold text-amber-800 leading-relaxed uppercase tracking-widest opacity-70">
                                            El sistema calcula automáticamente el devengo de 1.25 días por cada mes completo trabajado desde el {formData.contract?.startDate ? new Date(formData.contract.startDate).toLocaleDateString() : 'la fecha de contrato'}.
                                            Si registra días tomados manualmente, estos se descontarán del próximo cálculo de finiquito.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'conducta' && (
                            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-3 mb-2">
                                        <Trophy className="text-emerald-500" /> Méritos y Reconocimientos
                                    </h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Historial de excelencia y cultura organizacional</p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {commendationRecords.length === 0 ? (
                                            <div className="col-span-2 p-10 bg-slate-50 border border-dashed border-slate-200 rounded-[2.5rem] text-center">
                                                <Trophy size={40} className="mx-auto text-slate-200 mb-3" />
                                                <p className="text-xs font-black text-slate-400 uppercase">Sin reconocimientos registrados</p>
                                            </div>
                                        ) : commendationRecords.map(comm => (
                                            <div key={comm._id} className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-[2rem] flex gap-4">
                                                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                                                    <Award size={24} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">{comm.category}</p>
                                                    <p className="text-sm font-black text-slate-800 tracking-tight">{comm.title}</p>
                                                    <p className="text-xs font-bold text-slate-500 mt-2 italic">"{comm.reason}"</p>
                                                    <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-tighter">{new Date(comm.date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-8">
                                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-3 mb-2">
                                        <ShieldAlert className="text-rose-500" /> Medidas Disciplinarias
                                    </h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Registro legal según Art. 154 Reglamento Interno</p>

                                    <div className="space-y-4">
                                        {disciplinaryRecords.length === 0 ? (
                                            <div className="p-10 bg-slate-50 border border-dashed border-slate-200 rounded-[2.5rem] text-center">
                                                <CheckCircle2 size={40} className="mx-auto text-slate-200 mb-3" />
                                                <p className="text-xs font-black text-slate-400 uppercase">Conducta ejemplar: Sin amonestaciones</p>
                                            </div>
                                        ) : disciplinaryRecords.map(action => (
                                            <div key={action._id} className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm flex items-start justify-between">
                                                <div className="flex gap-6">
                                                    <div className={`p-4 rounded-2xl ${action.type === 'Multa' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
                                                        <ShieldAlert size={24} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${action.type === 'Multa' ? 'bg-amber-100 border-amber-200' : 'bg-rose-100 border-rose-200'
                                                                }`}>{action.type}</span>
                                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{action.internalRegArticle}</span>
                                                        </div>
                                                        <p className="text-sm font-black text-slate-800 tracking-tight">{action.reason}</p>
                                                        <p className="text-xs font-bold text-slate-400 mt-2 max-w-xl">{action.incidentDetails}</p>
                                                        <div className="flex items-center gap-6 mt-6">
                                                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                                <Calendar size={12} /> {new Date(action.date).toLocaleDateString()}
                                                            </div>
                                                            <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${action.status === 'Firmado' ? 'text-emerald-500' : 'text-amber-500'
                                                                }`}>
                                                                {action.status === 'Firmado' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                                                {action.status}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-white p-32 rounded-[4rem] text-center border-2 border-dashed border-slate-100">
                    <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-8">
                        <UserPlus size={48} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Esperando Selección</h3>
                    <p className="text-slate-400 font-bold max-w-sm mx-auto mt-2 leading-relaxed">Seleccione un postulante aprobado para comenzar con el levantamiento de su ficha administrativa de colaborador.</p>
                </div>
            )
            }
            {isPrintModalOpen && (
                <PrintConfigModal
                    isOpen={isPrintModalOpen}
                    onClose={() => setIsPrintModalOpen(false)}
                    onConfirm={handleDownloadPDF}
                    mode={printMode}
                />
            )}
        </PageWrapper>
    );
};

export default FichaColaborador;
