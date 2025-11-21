import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ClinicDataProvider } from './context/ClinicDataContext';
import AppLayout from './components/Layout/AppLayout';
import DashboardPage from './pages/DashboardPage';
import PacientesListPage from './pages/PacientesListPage';
import PacienteDetalhePage from './pages/PacienteDetalhePage';
import AtendimentosPage from './pages/AtendimentosPage';
import ProfissionaisPage from './pages/ProfissionaisPage';
import AgendaPage from './pages/AgendaPage';
import RelatoriosPage from './pages/RelatoriosPage';
import ConfiguracoesPage from './pages/ConfiguracoesPage';
import LoginPage from './pages/LoginPage';
import { useAuth } from './context/AuthContext';

const App: React.FC = () => {
  const { session, loading } = useAuth();

  // While auth state is loading, show nothing or a spinner
  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;

  return (
    <ClinicDataProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={session ? <AppLayout /> : <Navigate to="/login" replace />}
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="pacientes" element={<PacientesListPage />} />
            <Route path="pacientes/:id" element={<PacienteDetalhePage />} />
            <Route path="atendimentos" element={<AtendimentosPage />} />
            <Route path="profissionais" element={<ProfissionaisPage />} />
            <Route path="agenda" element={<AgendaPage />} />
            <Route path="relatorios" element={<RelatoriosPage />} />
            <Route path="configuracoes" element={<ConfiguracoesPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </ClinicDataProvider>
  );
};

export default App;