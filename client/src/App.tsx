import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { ThemeProvider } from "@/components/ui/ThemeProvider";

// Auth Pages
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import UserChoice from "@/pages/landing/UserChoice";

// Dashboard Pages
import CustomerDashboard from "@/pages/dashboard/CustomerDashboard";
import ProviderDashboard from "@/pages/dashboard/ProviderDashboard";
import BookingList from "@/pages/dashboard/bookings/BookingList";
import Reviews from "@/pages/dashboard/reviews/Reviews";
import Services from "@/pages/dashboard/provider/Services";
import Availability from "@/pages/dashboard/provider/Availability";

// Protected Route
import ProtectedRoute from "@/components/auth/ProtectedRoute";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={UserChoice} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* Customer Dashboard Routes */}
      <Route path="/dashboard">
        {(params) => (
          <ProtectedRoute>
            <CustomerDashboard />
          </ProtectedRoute>
        )}
      </Route>
      
      {/* Provider Dashboard Routes */}
      <Route path="/dashboard/provider">
        {(params) => (
          <ProtectedRoute requiredRole="provider">
            <ProviderDashboard />
          </ProtectedRoute>
        )}
      </Route>
      
      {/* Shared Dashboard Routes */}
      <Route path="/dashboard/bookings">
        {(params) => (
          <ProtectedRoute>
            <BookingList />
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/dashboard/reviews">
        {(params) => (
          <ProtectedRoute>
            <Reviews />
          </ProtectedRoute>
        )}
      </Route>
      
      {/* Provider-specific Routes */}
      <Route path="/dashboard/services">
        {(params) => (
          <ProtectedRoute requiredRole="provider">
            <Services />
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/dashboard/availability">
        {(params) => (
          <ProtectedRoute requiredRole="provider">
            <Availability />
          </ProtectedRoute>
        )}
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <Router />
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
