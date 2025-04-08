import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Loader2 } from 'lucide-react';

// OTP schema - 6 digit code
const otpSchema = z.object({
  otp: z.string().min(6, { message: "Please enter the 6-digit code" }).max(6, { message: "OTP should be 6 digits" })
    .regex(/^\d+$/, { message: "OTP should contain only numbers" }),
});

interface OTPVerificationProps {
  email: string;
  tempUserId: number;
  userData: any;
  onVerificationSuccess: (user: any) => void;
  onBack: () => void;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({ 
  email, 
  tempUserId, 
  userData, 
  onVerificationSuccess,
  onBack 
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const form = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof otpSchema>) => {
    try {
      setIsSubmitting(true);
      // Send OTP verification request
      const res = await apiRequest('POST', '/api/register/verify-otp', {
        email,
        tempUserId,
        otp: values.otp.trim()
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'OTP verification failed');
      }

      const data = await res.json();
      toast({
        title: 'Success!',
        description: 'Your account has been created successfully.',
      });
      
      // Call the success callback with the user data
      onVerificationSuccess(data.user);
    } catch (error) {
      toast({
        title: 'Verification failed',
        description: error instanceof Error ? error.message : 'Failed to verify OTP',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setIsResending(true);
      const res = await apiRequest('POST', '/api/register/resend-otp', {
        email,
        tempUserId
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to resend OTP');
      }

      toast({
        title: 'OTP Resent',
        description: 'A new verification code has been sent to your email.',
      });
    } catch (error) {
      toast({
        title: 'Failed to resend OTP',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary">Verify Your Email</CardTitle>
        <CardDescription>
          Enter the 6-digit code sent to <span className="font-medium">{email}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter 6-digit code" 
                      maxLength={6}
                      autoComplete="off"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col space-y-3 pt-2">
              <Button 
                type="submit"
                disabled={isSubmitting} 
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying
                  </>
                ) : (
                  'Verify & Create Account'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-3">
        <div className="text-sm text-center">
          <span>Didn't receive the code? </span>
          <Button 
            variant="link" 
            className="p-0 h-auto text-primary" 
            onClick={handleResendOTP}
            disabled={isResending}
          >
            {isResending ? (
              <>
                <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Resending...
              </>
            ) : (
              'Resend Code'
            )}
          </Button>
        </div>
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={onBack}
          type="button"
        >
          Back to Registration
        </Button>
      </CardFooter>
    </Card>
  );
};

export default OTPVerification;