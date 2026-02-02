import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardPage } from './pages/DashboardPage';
import { IntegrationsPage } from './pages/IntegrationsPage';
import { IntegrationBuilderPage } from './pages/IntegrationBuilderPage';
import { UsersPage } from './pages/UsersPage';
import { PlansPage } from './pages/PlansPage';
import { AISettingsPage } from './pages/AISettingsPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { useAppSelector } from './store/hooks';

function App() {
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

    if (!isAuthenticated) {
        return (
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        );
    }

    return (
        <Routes>
            <Route path="/" element={<DashboardLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="integrations" element={<IntegrationsPage />} />
                <Route path="integrations/new" element={<IntegrationBuilderPage />} />
                <Route path="integrations/:id/edit" element={<IntegrationBuilderPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="plans" element={<PlansPage />} />
                <Route path="ai-settings" element={<AISettingsPage />} />
                <Route path="audit-log" element={<AuditLogPage />} />
                <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;

