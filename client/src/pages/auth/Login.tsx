import React from 'react';
import AuthForm from '@/components/auth/AuthForm';

const Login: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Sarathi</h1>
          <p className="text-gray-600">Welcome back! Login to continue</p>
        </div>

        <AuthForm type="login" />
      </div>
    </div>
  );
};

export default Login;
