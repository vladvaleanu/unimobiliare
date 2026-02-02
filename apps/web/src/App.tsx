import { Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';

// Placeholder pages (will create later)
function DashboardPage() {
    return <div style={{ padding: '2rem' }}>Dashboard - Coming Soon</div>;
}

function SavedListingsPage() {
    return <div style={{ padding: '2rem' }}>Saved Listings - Coming Soon</div>;
}

function SubscriptionPage() {
    return <div style={{ padding: '2rem' }}>Subscription - Coming Soon</div>;
}

function App() {
    return (
        <Routes>
            {/* Public routes with layout */}
            <Route element={<AppLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchPage />} />
            </Route>

            {/* Auth routes (no layout) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected routes with layout */}
            <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/saved" element={<SavedListingsPage />} />
                    <Route path="/subscription" element={<SubscriptionPage />} />
                </Route>
            </Route>
        </Routes>
    );
}

export default App;
