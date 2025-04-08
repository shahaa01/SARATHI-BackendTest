import React from 'react';
import { Redirect } from 'wouter';
import { useAuth } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'customer' | 'provider' | null;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole = null 
}) => {
  const { user, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Redirect to="/auth" />;
  }

  // If role is required, check user's role
  if (requiredRole && user.role !== requiredRole) {
    return <Redirect to="/dashboard" />;
  }

  // Otherwise, render children
  return <>{children}</>;
};

export default ProtectedRoute;
