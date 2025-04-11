import React from 'react';
import { useAuth } from '@/hooks/useAuth';

const CustomerDashboard: React.FC = () => {
    const { user } = useAuth();

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Customer Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Bookings</h2>
                    <p>View and manage your bookings.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Favorites</h2>
                    <p>Access your saved services.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Payments</h2>
                    <p>View payment history and methods.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Reviews</h2>
                    <p>Leave feedback for services.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Messages</h2>
                    <p>Communicate with service providers.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Settings</h2>
                    <p>Manage your account preferences.</p>
                </div>
            </div>
        </div>
    );
};

export default CustomerDashboard; 