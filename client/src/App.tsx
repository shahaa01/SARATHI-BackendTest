import React from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import HomePage from '@/pages/HomePage';
import AuthPage from '@/pages/auth/AuthPage';
import Dashboard from '@/pages/dashboard/Dashboard';
import ProviderDashboard from '@/pages/dashboard/provider/ProviderDashboard';
import ServiceDetail from '@/pages/services/ServiceDetail';
import ProviderProfile from '@/pages/profile/ProviderProfile';
import NotFound from '@/pages/NotFound';

const ProtectedRoute: React.FC<{ path: string; component: React.ComponentType; allowedRoles?: string[] }> = ({
    path,
    component: Component,
    allowedRoles,
}) => {
    const { isAuthenticated, user } = useAuth();
    const [, setLocation] = useLocation();

    if (!isAuthenticated) {
        setLocation('/auth');
        return null;
    }

    if (allowedRoles && !allowedRoles.includes(user?.role || '')) {
        setLocation('/auth');
        return null;
    }

    return <Component />;
};

const App: React.FC = () => {
    return (
        <Switch>
            {/* Public routes */}
            <Route path="/" component={HomePage} />
            <Route path="/auth" component={AuthPage} />
            <Route path="/services/:serviceId" component={ServiceDetail} />
            <Route path="/providers/:providerId" component={ProviderProfile} />

            {/* Protected routes */}
            <Route path="/dashboard">
                <ProtectedRoute path="/dashboard" component={Dashboard} allowedRoles={['customer']} />
            </Route>
            <Route path="/dashboard/provider">
                <ProtectedRoute path="/dashboard/provider" component={ProviderDashboard} allowedRoles={['provider']} />
            </Route>

            {/* 404 route */}
            <Route component={NotFound} />
        </Switch>
    );
};

export default App;
