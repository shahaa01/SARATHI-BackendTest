import React from 'react';
import { Redirect } from 'wouter';
import { useCurrentUser } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'customer' | 'provider' | null;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole = null 
}) => {
  const { data: user, isLoading } = useCurrentUser();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary border-r-2 border-b-2 border-gray-200"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Redirect to="/login" />;
  }

  // If role is required, check user's role
  if (requiredRole && user.role !== requiredRole) {
    return <Redirect to="/dashboard" />;
  }

  // Otherwise, render children
  return <>{children}</>;
};

export default ProtectedRoute;
