import { useAuth } from "@/lib/auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component,
  requiredRole
}: {
  path: string;
  component: React.ComponentType;
  requiredRole?: 'customer' | 'provider' | null;
}) {
  const { user, isLoading } = useAuth();
  const Component = component;

  return (
    <Route
      path={path}
      component={() => {
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-border" />
            </div>
          );
        }

        if (!user) {
          return <Redirect to="/auth" />;
        }

        if (requiredRole && user.role !== requiredRole) {
          return <Redirect to="/dashboard" />;
        }

        return <Component />;
      }}
    />
  );
}