import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import { Rocket, Menu } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import ProjectRegistration from './pages/ProjectRegistration';
import ApplicantEntry from './pages/ApplicantEntry';
import Interviews from './pages/Interviews';
import Tests from './pages/Tests';
import DocumentUpload from './pages/DocumentUpload';
import AcreditaPrevencion from './pages/AcreditaPrevencion';
import FichaColaborador from './pages/FichaColaborador';
import HiringApproval from './pages/HiringApproval';
import HistoryPage from './pages/History';
import ContractedPersonal from './pages/ContractedPersonal';
import Contenedor from './pages/Contenedor';
import Settings from './pages/Settings';
import DashboardEmpresa from './pages/DashboardEmpresa';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ChatBubble from './components/ChatBubble';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import CommandCenter from './pages/admin/CommandCenter';
import RemoteApproval from './pages/RemoteApproval';
import PublicTestPortal from './pages/PublicTestPortal';
import { Toaster } from 'react-hot-toast';
import MasterProfileModal from './components/MasterProfileModal';
import HumanCapitalMaster from './pages/HumanCapitalMaster';
import CommercialAdmin from './pages/CommercialAdmin';
import BillingAndSubscription from './pages/BillingAndSubscription';
import LandingPage from './pages/LandingPage';
import ContractManager from './pages/ContractManager';
import HelpCenter from './pages/HelpCenter';
import Payroll from './pages/Payroll';
import GlobalSettings from './pages/GlobalSettings';
import Finiquitos from './pages/Finiquitos';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles, auth }) => {
    if (!auth) {
        return <Navigate to="/login" replace />;
    }
    if (allowedRoles && !allowedRoles.includes(auth.role)) {
        return <Navigate to="/dashboard" replace />;
    }
    return children;
};

function AppContent() {
    const [auth, setAuth] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedCENTRALIZATApplicant, setSelectedCENTRALIZATApplicant] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    // Check auth on mount
    useEffect(() => {
        const user = localStorage.getItem('centralizat_user') || sessionStorage.getItem('centralizat_user');
        if (user) {
            try {
                setAuth(JSON.parse(user));
            } catch (e) {
                localStorage.removeItem('centralizat_user');
                sessionStorage.removeItem('centralizat_user');
            }
        }
        setLoading(false);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('centralizat_user');
        sessionStorage.removeItem('centralizat_user');
        setAuth(null);
    };

    if (loading) return null;

    // Sidebar should only show in dashboard routes
    const isAppRoute = location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/register' && location.pathname !== '/forgot-password' && !location.pathname.startsWith('/resetpassword') && location.pathname !== '/remote-approval' && !location.pathname.startsWith('/test-psicolaboral');

    return (
        <div className={`flex min-h-screen ${isAppRoute ? 'bg-slate-50' : 'bg-white'}`}>
            {auth && isAppRoute && (
                <Sidebar
                    onOpenCENTRALIZAT={setSelectedCENTRALIZATApplicant}
                    auth={auth}
                    setAuth={setAuth}
                    onLogout={handleLogout}
                    isOpen={isMenuOpen}
                    setIsOpen={setIsMenuOpen}
                />
            )}

            <main className={`flex-1 transition-all duration-300 print:ml-0 print:p-0 overflow-hidden ${auth && isAppRoute ? 'md:ml-80' : ''}`}>
                {auth && isAppRoute && (
                    <div className="md:hidden bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                                <Rocket className="text-white" size={18} />
                            </div>
                            <span className="text-sm font-black tracking-tighter text-slate-900">CENTRALIZA-T</span>
                        </div>
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600"
                        >
                            <Menu size={24} />
                        </button>
                    </div>
                )}
                <AnimatePresence mode="wait">
                    <Routes location={location} key={location.pathname}>
                        {/* Public Routes */}
                        <Route path="/" element={<LandingPage auth={auth} />} />
                        <Route path="/login" element={!auth ? <LoginPage setAuth={setAuth} /> : <Navigate to="/dashboard" />} />
                        <Route path="/register" element={!auth ? <RegisterPage /> : <Navigate to="/dashboard" />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/resetpassword/:resettoken" element={<ResetPasswordPage />} />
                        <Route path="/remote-approval" element={<RemoteApproval />} />
                        <Route path="/test-psicolaboral/:token" element={<PublicTestPortal />} />

                        {/* Protected App Routes */}
                        <Route path="/dashboard" element={
                            <ProtectedRoute auth={auth}>
                                <Dashboard onOpenCENTRALIZAT={setSelectedCENTRALIZATApplicant} auth={auth} onLogout={handleLogout} />
                            </ProtectedRoute>
                        } />

                        <Route path="/admin/command-center" element={
                            <ProtectedRoute auth={auth} allowedRoles={['Ceo_Centralizat']}>
                                <CommandCenter auth={auth} onLogout={handleLogout} />
                            </ProtectedRoute>
                        } />

                        <Route path="/comercial" element={
                            <ProtectedRoute auth={auth} allowedRoles={['Ceo_Centralizat']}>
                                <CommercialAdmin auth={auth} onLogout={handleLogout} />
                            </ProtectedRoute>
                        } />

                        <Route path="/proyectos" element={
                            <ProtectedRoute auth={auth}>
                                <ProjectRegistration auth={auth} onLogout={handleLogout} />
                            </ProtectedRoute>
                        } />

                        <Route path="/ingreso" element={
                            <ProtectedRoute auth={auth}>
                                <ApplicantEntry auth={auth} onLogout={handleLogout} />
                            </ProtectedRoute>
                        } />

                        <Route path="/entrevista" element={
                            <ProtectedRoute auth={auth}>
                                <Interviews onOpenCENTRALIZAT={setSelectedCENTRALIZATApplicant} auth={auth} onLogout={handleLogout} />
                            </ProtectedRoute>
                        } />

                        <Route path="/tests" element={
                            <ProtectedRoute auth={auth}>
                                <Tests onOpenCENTRALIZAT={setSelectedCENTRALIZATApplicant} auth={auth} onLogout={handleLogout} />
                            </ProtectedRoute>
                        } />

                        <Route path="/documentos" element={
                            <ProtectedRoute auth={auth}>
                                <DocumentUpload onOpenCENTRALIZAT={setSelectedCENTRALIZATApplicant} auth={auth} onLogout={handleLogout} />
                            </ProtectedRoute>
                        } />

                        <Route path="/acreditacion-prevencion" element={
                            <ProtectedRoute auth={auth}>
                                <AcreditaPrevencion onOpenCENTRALIZAT={setSelectedCENTRALIZATApplicant} auth={auth} onLogout={handleLogout} />
                            </ProtectedRoute>
                        } />

                        <Route path="/contenedor" element={
                            <ProtectedRoute auth={auth}>
                                <Contenedor auth={auth} onLogout={handleLogout} />
                            </ProtectedRoute>
                        } />

                        <Route path="/ficha-colaborador" element={
                            <ProtectedRoute auth={auth}>
                                <FichaColaborador onOpenCENTRALIZAT={setSelectedCENTRALIZATApplicant} auth={auth} onLogout={handleLogout} />
                            </ProtectedRoute>
                        } />

                        <Route path="/contratacion" element={
                            <ProtectedRoute auth={auth}>
                                <HiringApproval onOpenCENTRALIZAT={setSelectedCENTRALIZATApplicant} auth={auth} onLogout={handleLogout} />
                            </ProtectedRoute>
                        } />

                        <Route path="/historial" element={
                            <ProtectedRoute auth={auth}>
                                <HistoryPage onOpenCENTRALIZAT={setSelectedCENTRALIZATApplicant} auth={auth} onLogout={handleLogout} />
                            </ProtectedRoute>
                        } />

                        <Route path="/contratados" element={
                            <ProtectedRoute auth={auth}>
                                <ContractedPersonal onOpenCENTRALIZAT={setSelectedCENTRALIZATApplicant} auth={auth} onLogout={handleLogout} />
                            </ProtectedRoute>
                        } />

                        <Route path="/contratos" element={
                            <ProtectedRoute auth={auth}>
                                <ContractManager auth={auth} onLogout={handleLogout} />
                            </ProtectedRoute>
                        } />

                        <Route path="/ayuda" element={
                            <ProtectedRoute auth={auth}>
                                <HelpCenter auth={auth} onLogout={handleLogout} />
                            </ProtectedRoute>
                        } />

                        <Route path="/nomina" element={
                            <ProtectedRoute auth={auth}>
                                <Payroll auth={auth} onLogout={handleLogout} />
                            </ProtectedRoute>
                        } />

                        <Route path="/finiquitos" element={
                            <ProtectedRoute auth={auth}>
                                <Finiquitos auth={auth} onLogout={handleLogout} />
                            </ProtectedRoute>
                        } />

                        <Route path="/parametros-legales" element={
                            <ProtectedRoute auth={auth} allowedRoles={['Ceo_Centralizat', 'Admin_Empresa']}>
                                <GlobalSettings auth={auth} onLogout={handleLogout} />
                            </ProtectedRoute>
                        } />

                        <Route path="/gestion-capital-humano" element={
                            <ProtectedRoute auth={auth}>
                                <HumanCapitalMaster onOpenCENTRALIZAT={setSelectedCENTRALIZATApplicant} auth={auth} onLogout={handleLogout} />
                            </ProtectedRoute>
                        } />

                        <Route path="/configuracion" element={
                            <ProtectedRoute auth={auth}>
                                <Settings auth={auth} onLogout={handleLogout} />
                            </ProtectedRoute>
                        } />

                        <Route path="/suscripcion" element={
                            <ProtectedRoute auth={auth}>
                                <BillingAndSubscription auth={auth} onLogout={handleLogout} />
                            </ProtectedRoute>
                        } />

                        <Route path="/dashboard-empresa" element={
                            <ProtectedRoute auth={auth}>
                                <DashboardEmpresa auth={auth} onLogout={handleLogout} />
                            </ProtectedRoute>
                        } />

                        <Route path="*" element={<div className="flex items-center justify-center h-full text-slate-400 font-black uppercase tracking-[0.2em]">404 | No se encontró el nodo</div>} />
                    </Routes>
                </AnimatePresence>
            </main>
            {auth && isAppRoute && <ChatBubble auth={auth} />}
            <Toaster position="top-right" />

            {selectedCENTRALIZATApplicant && (
                <MasterProfileModal
                    applicant={selectedCENTRALIZATApplicant}
                    onClose={() => setSelectedCENTRALIZATApplicant(null)}
                />
            )}
        </div>
    );
}

function App() {
    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AppContent />
        </Router>
    );
}

export default App;
