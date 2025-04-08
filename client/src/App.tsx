import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { AuthProvider } from "@/lib/auth";
import { ProtectedRoute } from "@/lib/protected-route";

// Auth Pages
import AuthPage from "@/pages/auth/AuthPage";
import UserChoice from "@/pages/landing/UserChoice";

// Dashboard Pages
import CustomerDashboard from "@/pages/dashboard/CustomerDashboard";
import ProviderDashboard from "@/pages/dashboard/ProviderDashboard";
import BookingList from "@/pages/dashboard/bookings/BookingList";
import Reviews from "@/pages/dashboard/reviews/Reviews";
import Services from "@/pages/dashboard/provider/Services";
import Availability from "@/pages/dashboard/provider/Availability";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={UserChoice} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Customer Dashboard Routes */}
      <ProtectedRoute path="/dashboard" component={CustomerDashboard} />
      
      {/* Provider Dashboard Routes */}
      <ProtectedRoute path="/dashboard/provider" component={ProviderDashboard} />
      
      {/* Shared Dashboard Routes */}
      <ProtectedRoute path="/dashboard/bookings" component={BookingList} />
      <ProtectedRoute path="/dashboard/reviews" component={Reviews} />
      
      {/* Provider-specific Routes */}
      <ProtectedRoute path="/dashboard/services" component={Services} />
      <ProtectedRoute path="/dashboard/availability" component={Availability} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
