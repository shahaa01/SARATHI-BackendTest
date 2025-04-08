import { apiRequest } from './queryClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { insertUserSchema } from '@shared/schema';

// Auth types
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  role: 'customer' | 'provider' | null;
}

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'provider';
  profileImageUrl?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// Login validation schema
export const loginSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

// Registration schema - reuse from shared schema
export const registerSchema = insertUserSchema;

// Login hook
export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const res = await apiRequest('POST', '/api/auth/login', credentials);
      const data = await res.json();
      return data.user as User;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['currentUser'], data);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
};

// Register hook
export const useRegister = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userData: z.infer<typeof registerSchema>) => {
      const res = await apiRequest('POST', '/api/auth/register', userData);
      const data = await res.json();
      return data.user as User;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['currentUser'], data);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
};

// Logout hook
export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/auth/logout', {});
      return true;
    },
    onSuccess: () => {
      queryClient.setQueryData(['currentUser'], null);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
};

// Current user hook
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        
        if (res.status === 401) {
          return null;
        }
        
        if (!res.ok) {
          throw new Error('Failed to fetch user');
        }
        
        const data = await res.json();
        return data.user as User;
      } catch (error) {
        return null;
      }
    },
  });
};
