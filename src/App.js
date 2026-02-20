import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
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
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ChatBubble from './components/ChatBubble';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import CommandCenter from './pages/admin/CommandCenter';
import RemoteApproval from './pages/RemoteApproval';
import PublicTestPortal from './pages/PublicTestPortal';
import { Toaster } from 'react-hot-toast';
import MasterProfileModal from './components/MasterProfileModal';
import HumanCapitalMaster from './pages/HumanCapitalMaster';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles, auth }) => {
    if (!auth) {
        return <Navigate to="/login" replace />;
    }
    if (allowedRoles && !allowedRoles.includes(auth.role)) {
        return <Navigate to="/" replace />;
    }
    return children;
};

function AppContent() {
    const [auth, setAuth] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedCENTRALIZATApplicant, setSelectedCENTRALIZATApplicant] = useState(null);
    const location = useLocation();

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

    return (
        <div className="flex bg-slate-50 min-h-screen">
            {auth && <Sidebar onOpenCENTRALIZAT={setSelectedCENTRALIZATApplicant} auth={auth} setAuth={setAuth} onLogout={handleLogout} />}

            <main className={`flex-1 ${auth ? 'ml-80' : ''} transition-all print:ml-0 print:p-0 overflow-hidden`}>
                <AnimatePresence mode="wait">
                    <Routes location={location} key={location.pathname}>
                        <Route path="/login" element={!auth ? <LoginPage setAuth={setAuth} /> : <Navigate to="/" />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/resetpassword/:resettoken" element={<ResetPasswordPage />} />

                        <Route path="/" element={
                            <ProtectedRoute auth={auth}>
                                <Dashboard onOpenCENTRALIZAT={setSelectedCENTRALIZATApplicant} auth={auth} onLogout={handleLogout} />
                            </ProtectedRoute>
                        } />

                        <Route path="/admin/command-center" element={
                            <ProtectedRoute auth={auth} allowedRoles={['Ceo_Centralizat']}>
                                <CommandCenter auth={auth} onLogout={handleLogout} />
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

                        <Route path="/dashboard-empresa" element={
                            <ProtectedRoute auth={auth}>
                                <DashboardEmpresa auth={auth} onLogout={handleLogout} />
                            </ProtectedRoute>
                        } />

                        <Route path="/remote-approval" element={<RemoteApproval />} />
                        <Route path="/test-psicolaboral/:token" element={<PublicTestPortal />} />
                        <Route path="*" element={<div className="flex items-center justify-center h-full text-slate-400 font-black uppercase tracking-[0.2em]">404 | No se encontró el nodo</div>} />
                    </Routes>
                </AnimatePresence>
            </main>
            {auth && <ChatBubble auth={auth} />}
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
