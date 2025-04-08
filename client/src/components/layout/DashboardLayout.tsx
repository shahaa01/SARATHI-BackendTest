import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Home, 
  CalendarDays, 
  Star, 
  Settings, 
  PieChart, 
  Clock, 
  Bolt, 
  LogOut,
  Menu,
  BellRing,
  ChevronRight
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [location, setLocation] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on location change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      setLocation('/auth');
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const isActive = (path: string) => {
    return location === path;
  };

  const customerNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <Home className="h-5 w-5 mr-3" /> },
    { path: '/dashboard/bookings', label: 'My Bookings', icon: <CalendarDays className="h-5 w-5 mr-3" /> },
    { path: '/dashboard/reviews', label: 'My Reviews', icon: <Star className="h-5 w-5 mr-3" /> },
    { path: '/dashboard/settings', label: 'Settings', icon: <Settings className="h-5 w-5 mr-3" /> },
  ];

  const providerNavItems = [
    { path: '/dashboard', label: 'Overview', icon: <PieChart className="h-5 w-5 mr-3" /> },
    { path: '/dashboard/bookings', label: 'Bookings', icon: <CalendarDays className="h-5 w-5 mr-3" /> },
    { path: '/dashboard/availability', label: 'Availability', icon: <Clock className="h-5 w-5 mr-3" /> },
    { path: '/dashboard/reviews', label: 'Reviews', icon: <Star className="h-5 w-5 mr-3" /> },
    { path: '/dashboard/services', label: 'Services & Rates', icon: <Bolt className="h-5 w-5 mr-3" /> },
    { path: '/dashboard/settings', label: 'Settings', icon: <Settings className="h-5 w-5 mr-3" /> },
  ];

  const navItems = user?.role === 'provider' ? providerNavItems : customerNavItems;

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar for larger screens */}
      <aside className="bg-white shadow-lg z-20 w-full md:w-64 md:min-h-screen md:fixed hidden md:block">
        <div className="p-4 flex justify-center md:justify-start items-center border-b border-gray-100">
          <Link href="/dashboard">
            <h1 className="text-2xl font-bold text-primary cursor-pointer">
              Sarathi
            </h1>
          </Link>
        </div>
        
        {/* Sidebar Navigation */}
        <nav className="p-4">
          <div className="space-y-3">
            <p className="text-xs uppercase font-semibold text-gray-500 mb-2">
              {user?.role === 'provider' ? 'Provider Dashboard' : 'Customer Dashboard'}
            </p>
            
            {navItems.map((item) => (
              <Link 
                key={item.path} 
                href={item.path}
                className={`flex items-center px-4 py-3 rounded-lg ${
                  isActive(item.path)
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-gray-700 hover:bg-gray-100 transition-all'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-100">
            <button 
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </button>
          </div>
        </nav>
      </aside>
      
      {/* Mobile navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg z-30 border-t">
        <div className="flex justify-around items-center">
          <Link 
            href="/dashboard"
            className={`flex flex-col items-center py-2 px-3 ${isActive('/dashboard') ? 'text-primary' : 'text-gray-500'}`}
          >
            <Home className="h-6 w-6" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          
          <Link 
            href="/dashboard/bookings"
            className={`flex flex-col items-center py-2 px-3 ${isActive('/dashboard/bookings') ? 'text-primary' : 'text-gray-500'}`}
          >
            <CalendarDays className="h-6 w-6" />
            <span className="text-xs mt-1">Bookings</span>
          </Link>
          
          <Link 
            href="/dashboard/reviews"
            className={`flex flex-col items-center py-2 px-3 ${isActive('/dashboard/reviews') ? 'text-primary' : 'text-gray-500'}`}
          >
            <Star className="h-6 w-6" />
            <span className="text-xs mt-1">Reviews</span>
          </Link>
          
          <Link 
            href="/dashboard/settings"
            className={`flex flex-col items-center py-2 px-3 ${isActive('/dashboard/settings') ? 'text-primary' : 'text-gray-500'}`}
          >
            <Settings className="h-6 w-6" />
            <span className="text-xs mt-1">Settings</span>
          </Link>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="flex-1 md:ml-64 min-h-screen pb-20 md:pb-10">
        {/* Top header with user info and notifications */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex md:hidden items-center">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="mr-2">
                <Menu className="h-6 w-6 text-gray-700" />
              </button>
              <h1 className="text-xl font-bold text-primary">
                Sarathi
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button className="p-2 rounded-full hover:bg-gray-100 transition-all relative">
                  <BellRing className="h-6 w-6 text-gray-500" />
                  <span className="absolute top-1 right-1 bg-primary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    2
                  </span>
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                  <img 
                    src={user?.profileImageUrl || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=random`} 
                    alt="User avatar" 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="hidden md:block">
                  <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40">
            <div className="bg-white w-2/3 h-full shadow-lg">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-lg">Menu</h2>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
              <nav className="p-4">
                {navItems.map((item) => (
                  <Link 
                    key={item.path} 
                    href={item.path}
                    className={`flex items-center px-4 py-3 rounded-lg mb-2 ${
                      isActive(item.path)
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-gray-700 hover:bg-gray-100 transition-all'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button 
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Logout
                  </button>
                </div>
              </nav>
            </div>
          </div>
        )}

        {/* Page content */}
        {children}
        
        {/* Footer Section */}
        <footer className="bg-white px-4 py-8 border-t border-gray-100">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <h1 className="text-xl font-bold text-primary">Sarathi</h1>
                <p className="text-sm text-gray-500 mt-1">Your Trusted Service Partner</p>
              </div>
              
              <div className="flex space-x-4">
                <a href="#" className="text-gray-500 hover:text-primary transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                  </svg>
                </a>
                
                <a href="#" className="text-gray-500 hover:text-primary transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                
                <a href="#" className="text-gray-500 hover:text-primary transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-100 text-center text-sm text-gray-500">
              <p>&copy; {new Date().getFullYear()} Sarathi. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default DashboardLayout;
