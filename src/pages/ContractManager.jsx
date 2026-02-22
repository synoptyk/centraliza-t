import React, { useState, useEffect } from 'react';
import {
    FileText, Sparkles, Download, Save, Users, History,
    FilePlus, ChevronRight, Loader2, CheckCircle, AlertCircle,
    Building2, Calendar, DollarSign, UserCheck
} from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import PageWrapper from '../components/PageWrapper';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ContractManager = ({ auth, onLogout }) => {
    const [applicants, setApplicants] = useState([]);
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const [contracts, setContracts] = useState([]);
    const [selectedContract, setSelectedContract] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('');
    const [view, setView] = useState('list'); // 'list' | 'editor'

    useEffect(() => {
        fetchApprovedApplicants();
        fetchContracts();
    }, []);

    const fetchApprovedApplicants = async () => {
        try {
            const res = await api.get('/applicants');
            // Solo aquellos aprobados que esperan formalización legal
            const active = res.data.filter(app =>
                app.status === 'Aprobado para Contratación'
            );
            setApplicants(active);
        } catch (error) {
            toast.error('Error al cargar candidatos');
        }
    };

    const fetchContracts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/contracts');
            setContracts(res.data);
        } catch (error) {
            console.error('Error al cargar contratos');
        } finally {
            setLoading(false);
        }
    };

    const generateInitialContract = (applicant) => {
        setSelectedApplicant(applicant);
        const today = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: es });

        const template = `
            <div style="font-family: 'Inter', sans-serif; line-height: 1.6; color: #1e293b; padding: 40px;">
                <h1 style="text-align: center; color: #020617; text-transform: uppercase; font-weight: 900; margin-bottom: 40px;">Contrato Individual de Trabajo</h1>
                
                <p>En Santiago de Chile, a ${today}, entre <strong>${auth.company?.name || 'LA EMPRESA'}</strong>, RUT <strong>${auth.company?.taxId || 'N/A'}</strong>, representada por <strong>${auth.name}</strong>, en adelante "el empleador"; y don(ña) <strong>${applicant.fullName}</strong>, RUT <strong>${applicant.rut}</strong>, de nacionalidad <strong>${applicant.country === 'CL' ? 'Chilena' : applicant.country}</strong>, en adelante "el trabajador", se ha convenido el siguiente contrato de trabajo:</p>
                
                <h3 style="color: #4f46e5; text-transform: uppercase; font-size: 14px; margin-top: 30px;">PRIMERO: CARGO Y FUNCIONES</h3>
                <p>El trabajador se obliga a desempeñar las funciones de <strong>${applicant.position}</strong>, realizando todas las labores inherentes a dicho cargo y aquellas que el empleador le encomiende para el buen servicio de la empresa.</p>
                
                <h3 style="color: #4f46e5; text-transform: uppercase; font-size: 14px; margin-top: 30px;">SEGUNDO: REMUNERACIÓN</h3>
                <p>El empleador se compromete a pagar al trabajador una remuneración líquida mensual de <strong>$${parseInt(applicant.workerData?.financial?.liquidSalary || 0).toLocaleString()}</strong>, pagaderos en forma mensual por períodos vencidos el último día hábil de cada mes.</p>
                
                <h3 style="color: #4f46e5; text-transform: uppercase; font-size: 14px; margin-top: 30px;">TERCERO: JORNADA DE TRABAJO</h3>
                <p>La jornada de trabajo será de 44 horas semanales, distribuidas de lunes a viernes, conforme al reglamento interno de la empresa.</p>
                
                <div style="margin-top: 100px; display: flex; justify-content: space-between;">
                    <div style="text-align: center; width: 200px; border-top: 1px solid #94a3b8; padding-top: 10px;">
                        <p style="font-size: 10px; font-weight: bold;">FIRMA EMPLEADOR</p>
                        <p style="font-size: 10px;">${auth.company?.name || 'CENTRALIZA-T'}</p>
                    </div>
                    <div style="text-align: center; width: 200px; border-top: 1px solid #94a3b8; padding-top: 10px;">
                        <p style="font-size: 10px; font-weight: bold;">FIRMA TRABAJADOR</p>
                        <p style="font-size: 10px;">${applicant.fullName}</p>
                    </div>
                </div>
            </div>
        `;

        setContent(template);
        setTitle(`Contrato de Trabajo - ${applicant.fullName}`);
        setView('editor');
    };

    const handleSave = async () => {
        setGenerating(true);
        try {
            const payload = {
                applicantId: selectedApplicant._id,
                title,
                type: 'Contrato Inicial',
                content,
                hiringDetails: {
                    salary: selectedApplicant.workerData?.financial?.liquidSalary,
                    position: selectedApplicant.position,
                    startDate: selectedApplicant.workerData?.contract?.startDate
                }
            };

            await api.post('/contracts', payload);

            // ACTUALIZACIÓN LÓGICA: Ahora el estado pasa a ser oficialmente 'Contratado'
            await api.put(`/applicants/${selectedApplicant._id}`, { status: 'Contratado' });

            toast.success('Contrato Formalizado y Archivado');
            fetchContracts();
            fetchApprovedApplicants();
            setView('list');
        } catch (error) {
            toast.error('Error al guardar documento');
        } finally {
            setGenerating(false);
        }
    };

    const downloadPDF = async (contractId) => {
        try {
            const response = await api.get(`/contracts/${contractId}/pdf`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${selectedContract?.title || 'Contrato'}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            toast.error('Error al generar PDF');
        }
    };

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['clean']
        ],
    };

    return (
        <PageWrapper
            className="space-y-8 animate-in fade-in duration-500"
            title="CONTRATACIONES"
            subtitle="Inteligencia Contractual de próxima generación"
            icon={FileText}
            auth={auth}
            onLogout={onLogout}
        >
            {view === 'list' ? (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left: Approved Waiting for Contract */}
                    <div className="lg:col-span-1 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden flex flex-col">
                        <div className="p-8 bg-indigo-600 text-white relative overflow-hidden">
                            <Sparkles className="absolute -right-4 -top-4 opacity-10" size={100} />
                            <h3 className="text-xl font-black uppercase italic relative z-10">Listos para Contrato</h3>
                            <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest relative z-10">Aprobados por Gerencia</p>
                        </div>
                        <div className="flex-1 overflow-y-auto max-h-[600px] divide-y divide-slate-50">
                            {applicants.map(app => (
                                <div key={app._id} className="p-6 hover:bg-slate-50 transition-all flex items-center justify-between group">
                                    <div>
                                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{app.fullName}</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{app.position}</p>
                                    </div>
                                    <button
                                        onClick={() => generateInitialContract(app)}
                                        className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                                        title="Generar con IA"
                                    >
                                        <Sparkles size={16} />
                                    </button>
                                </div>
                            ))}
                            {applicants.length === 0 && (
                                <div className="p-10 text-center text-slate-300">
                                    <p className="text-[10px] font-black uppercase">No hay candidatos pendientes</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Existing Documents */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center">
                                    <History size={24} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">Archivo Maestro de Documentos</h4>
                                    <p className="text-xs font-bold text-slate-400 uppercase">Gestión histórica de anexos y contratos</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <div className="px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black uppercase text-slate-400 border border-slate-100">
                                    Total: {contracts.length} docs
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {contracts.map(contract => (
                                <div key={contract._id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all group overflow-hidden relative">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <FileText size={80} />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${contract.status === 'Firmado' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                                {contract.status}
                                            </span>
                                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{contract.type}</span>
                                        </div>
                                        <h3 className="text-lg font-black text-slate-900 uppercase mb-1 truncate">{contract.title}</h3>
                                        <div className="flex items-center gap-2 mb-6">
                                            <div className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center text-[10px] font-black text-slate-400">
                                                {contract.applicantId?.fullName.charAt(0)}
                                            </div>
                                            <p className="text-xs font-bold text-slate-500">{contract.applicantId?.fullName}</p>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => { setSelectedContract(contract); downloadPDF(contract._id); }}
                                                className="flex-1 py-3 bg-slate-50 text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all border border-slate-100 flex items-center justify-center gap-2"
                                            >
                                                <Download size={14} /> PDF
                                            </button>
                                            <button className="flex-1 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2">
                                                <sparkles size={14} /> Editar IA
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {contracts.length === 0 && !loading && (
                                <div className="col-span-2 py-20 text-center border-2 border-dashed border-slate-100 rounded-[3rem]">
                                    <FilePlus size={48} className="mx-auto text-slate-100 mb-4" />
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No hay documentos registrados aún</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Editor Header */}
                    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => setView('list')}
                                className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all"
                            >
                                <ChevronRight className="rotate-180" size={24} />
                            </button>
                            <div>
                                <input
                                    className="text-2xl font-black text-slate-900 uppercase bg-transparent border-none outline-none focus:ring-0 w-full"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedApplicant?.fullName} | {selectedApplicant?.rut}</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleSave}
                                disabled={generating}
                                className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all flex items-center gap-2"
                            >
                                {generating ? <Loader2 className="animate-spin" size={16} /> : <Save size={18} />}
                                Finalizar y Archivar
                            </button>
                        </div>
                    </div>

                    {/* Rich Editor */}
                    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden min-h-[800px] flex flex-col">
                        <div className="p-10 flex-1 quill-container">
                            <ReactQuill
                                theme="snow"
                                value={content}
                                onChange={setContent}
                                modules={modules}
                                className="h-full"
                            />
                        </div>
                    </div>
                </div>
            )}
        </PageWrapper>
    );
};

export default ContractManager;
