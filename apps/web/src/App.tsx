import { Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { ListingDetailPage } from './pages/ListingDetailPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { SavedListingsPage } from './pages/SavedListingsPage';
import { SubscriptionPage } from './pages/SubscriptionPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';

function App() {
    return (
        <Routes>
            {/* Public routes with layout */}
            <Route element={<AppLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/listing/:id" element={<ListingDetailPage />} />
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

