import React from 'react';
import { useAuth } from '@/hooks/useAuth';

const ProviderDashboard: React.FC = () => {
    const { user } = useAuth();

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Provider Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Your Services</h2>
                    <p>Manage your offered services.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Bookings</h2>
                    <p>View and manage your bookings.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Earnings</h2>
                    <p>Track your earnings and payments.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Reviews</h2>
                    <p>View customer feedback and ratings.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Schedule</h2>
                    <p>Manage your availability.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Settings</h2>
                    <p>Configure your provider account.</p>
                </div>
            </div>
        </div>
    );
};

export default ProviderDashboard; 