import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Redirect, useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { loginSchema, registerSchema } from "@/lib/auth";
import { Loader2 } from "lucide-react";
import OTPVerification from "@/components/auth/OTPVerification";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import '@/styles/pages/auth/AuthPage.scss';

const AuthPage: React.FC = () => {
  const { user, isLoading, loginMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  // OTP verification states
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [isRequestingOTP, setIsRequestingOTP] = useState(false);
  const [tempUserId, setTempUserId] = useState<number | null>(null);
  const [registrationData, setRegistrationData] = useState<any>(null);
  
  // Parse URL parameters to determine initial active tab and role
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    const tab = params.get('tab');
    const role = params.get('role');
    
    if (tab === 'login' || tab === 'register') {
      setActiveTab(tab);
    }
    
    if (role && activeTab === 'register') {
      const registerForm = document.querySelector('form[name="register-form"]');
      if (registerForm) {
        const roleInput = registerForm.querySelector('input[name="role"]');
        if (roleInput) {
          (roleInput as HTMLInputElement).value = role;
        }
      }
    }
  }, [location]);

  // Redirect if user is already logged in
  if (user) {
    return <Redirect to="/dashboard" />;
  }

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'customer' | 'provider'>('customer');
  const [error, setError] = useState('');
  const { login: authLogin, register: authRegister } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        await authLogin(email, password);
      } else {
        await authRegister({ email, password, name, role });
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
    }
  };

  const LoginForm = () => {
    const form = useForm<z.infer<typeof loginSchema>>({
      resolver: zodResolver(loginSchema),
      defaultValues: {
        username: "",
        password: "",
      },
    });

    const onSubmit = (values: z.infer<typeof loginSchema>) => {
      loginMutation.mutate(values);
    };

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </Form>
    );
  };

  const RegisterForm = () => {
    const form = useForm<z.infer<typeof registerSchema>>({
      resolver: zodResolver(registerSchema),
      defaultValues: {
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        firstName: "",
        lastName: "",
        role: "customer",
        phone: "",
        address: "",
        city: "Kathmandu",
        profileImageUrl: "",
      },
    });

    const onSubmit = async (values: z.infer<typeof registerSchema>) => {
      // Log form data to verify values
      console.log("Registration data:", values);
      
      // Create registration data object
      const registerData = {
        username: values.username,
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        role: values.role,
        phone: values.phone || '',
        address: values.address || '',
        city: values.city || 'Kathmandu',
        profileImageUrl: '',
        confirmPassword: values.confirmPassword
      };
      
      try {
        setIsRequestingOTP(true);
        // Instead of directly registering, initiate the OTP flow
        const res = await apiRequest('POST', '/api/register/send-otp', registerData);
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to initiate registration');
        }
        
        const data = await res.json();
        // Store the temporary user ID and registration data
        setTempUserId(data.tempUserId);
        setRegistrationData(registerData);
        
        // Show OTP verification component
        setShowOTPVerification(true);
        
        toast({
          title: "Verification required",
          description: `We've sent a verification code to ${registerData.email}`,
        });
      } catch (error) {
        toast({
          title: "Registration failed",
          description: error instanceof Error ? error.message : "An unknown error occurred",
          variant: "destructive",
        });
      } finally {
        setIsRequestingOTP(false);
      }
    };

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="johndoe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="john@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Type</FormLabel>
                <div className="flex space-x-2">
                  <Button 
                    type="button"
                    variant={field.value === "customer" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => form.setValue("role", "customer")}
                  >
                    Customer
                  </Button>
                  <Button 
                    type="button"
                    variant={field.value === "provider" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => form.setValue("role", "provider")}
                  >
                    Service Provider
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isRequestingOTP}
          >
            {isRequestingOTP ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Verification Code...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>
      </Form>
    );
  };

  // Handle successful OTP verification
  const handleVerificationSuccess = (user: any) => {
    // Set user data in the React Query cache
    queryClient.setQueryData(["/api/user"], user);
    
    toast({
      title: "Registration successful",
      description: `Welcome to Sarathi, ${user.firstName}!`
    });
    
    // Redirect to dashboard
    setLocation('/dashboard');
  };

  // Handle going back from OTP verification to the registration form
  const handleBackToRegistration = () => {
    setShowOTPVerification(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>{isLogin ? 'Login' : 'Register'}</h1>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Role</label>
                <div className="role-selector">
                  <Button
                    variant={role === 'customer' ? 'primary' : 'outline'}
                    size="medium"
                    onClick={() => setRole('customer')}
                    type="button"
                  >
                    Customer
                  </Button>
                  <Button
                    variant={role === 'provider' ? 'primary' : 'outline'}
                    size="medium"
                    onClick={() => setRole('provider')}
                    type="button"
                  >
                    Provider
                  </Button>
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button variant="primary" size="large" fullWidth type="submit">
            {isLogin ? 'Login' : 'Register'}
          </Button>
        </form>

        <div className="auth-toggle">
          <p>
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <Button
              variant="text"
              size="small"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Register' : 'Login'}
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;