import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth, loginSchema, registerSchema } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest, queryClient } from '@/lib/queryClient';
import OTPVerification from './OTPVerification';
import { Loader2 } from 'lucide-react';

interface AuthFormProps {
  type: 'login' | 'register';
}

export const AuthForm: React.FC<AuthFormProps> = ({ type }) => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { loginMutation, registerMutation } = useAuth();
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [isRequestingOTP, setIsRequestingOTP] = useState(false);
  const [tempUserId, setTempUserId] = useState<number | null>(null);
  const [registrationData, setRegistrationData] = useState<any>(null);

  // Explicitly create types for both form schemas to help TypeScript
  type LoginFormValues = z.infer<typeof loginSchema>;
  type RegisterFormValues = z.infer<typeof registerSchema>;
  
  // Determine which schema to use based on form type
  const schema = type === 'login' ? loginSchema : registerSchema;
  
  // Set up form with persistent values
  const defaultRegisterValues = {
    username: '', 
    password: '', 
    confirmPassword: '', 
    email: '', 
    firstName: '', 
    lastName: '', 
    role: 'customer',
    phone: '' as string,  // Type assertion to help TypeScript understand these can't be null
    address: '' as string,
    city: 'Kathmandu',
    profileImageUrl: '' as string,
  };
  
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: type === 'login' 
      ? { username: '', password: '' } 
      : defaultRegisterValues,
    mode: 'onChange', // Validate field on change
  });

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

  // Handle form submission with more robust error handling
  const onSubmit = async (values: LoginFormValues | RegisterFormValues) => {
    // No outer try/catch - handle errors in each specific form submission block
    if (type === 'login') {
      // Safe to cast to LoginFormValues when in login mode
      const loginValues = values as LoginFormValues;
      
      try {
        // Just pass username and password for login
        const result = await loginMutation.mutateAsync({
          username: loginValues.username,
          password: loginValues.password
        });
        // Only redirect on success
        if (result) {
          setLocation('/dashboard');
        }
      } catch (error) {
        // Display login-specific error
        toast({
          title: "Login failed",
          description: error instanceof Error ? error.message : "Invalid username or password",
          variant: "destructive",
        });
      }
    } else {
      // Safe to cast to RegisterFormValues when in register mode
      const registerValues = values as RegisterFormValues;
      
      // Convert form values to the expected format for registration
      const registerData = {
        username: registerValues.username,
        password: registerValues.password,
        email: registerValues.email,
        firstName: registerValues.firstName, 
        lastName: registerValues.lastName,
        role: registerValues.role || 'customer',
        // Optional fields - pass as empty string if null/undefined
        phone: registerValues.phone || '',
        address: registerValues.address || '',
        city: registerValues.city || 'Kathmandu',
        profileImageUrl: '',
        confirmPassword: registerValues.confirmPassword
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
    }
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending || isRequestingOTP;

  // If showing OTP verification, render that component instead of the form
  if (showOTPVerification && tempUserId && registrationData) {
    return (
      <OTPVerification
        email={registrationData.email}
        tempUserId={tempUserId}
        userData={registrationData}
        onVerificationSuccess={handleVerificationSuccess}
        onBack={handleBackToRegistration}
      />
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          {type === 'login' ? 'Login to Sarathi' : 'Join Sarathi'}
        </CardTitle>
        <CardDescription>
          {type === 'login' 
            ? 'Enter your credentials to access your account' 
            : 'Create an account to get started'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            {type === 'register' && (
              <>
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john.doe@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="+977 9812345678" 
                          {...field} 
                          value={field.value || ''} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="123 Main St" 
                          {...field} 
                          value={field.value || ''} 
                        />
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
                      <FormLabel>I am a</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="customer">Customer</SelectItem>
                          <SelectItem value="provider">Service Provider</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {type === 'register' && (
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isRequestingOTP ? 'Sending verification code...' : 'Processing...'}
                </span>
              ) : (
                type === 'login' ? 'Sign in' : 'Create account'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        {type === 'login' ? (
          <p className="text-sm text-gray-500">
            Don't have an account?{' '}
            <Button 
              variant="link" 
              className="p-0 h-auto text-primary" 
              onClick={() => setLocation('/register')}
            >
              Sign up
            </Button>
          </p>
        ) : (
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <Button 
              variant="link" 
              className="p-0 h-auto text-primary" 
              onClick={() => setLocation('/login')}
            >
              Sign in
            </Button>
          </p>
        )}
      </CardFooter>
    </Card>
  );
};

export default AuthForm;
