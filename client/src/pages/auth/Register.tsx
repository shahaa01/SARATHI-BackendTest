import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import AuthForm from '@/components/auth/AuthForm';

const Register: React.FC = () => {
  const [location] = useLocation();
  
  // Check for role query param to pre-select the role
  const params = new URLSearchParams(window.location.search);
  const role = params.get('role') === 'provider' ? 'provider' : 'customer';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Create Your Sarathi Account</h1>
          <p className="text-gray-600">Join Kathmandu's trusted service marketplace</p>
        </div>

        <AuthForm type="register" />
      </div>
    </div>
  );
};

export default Register;
