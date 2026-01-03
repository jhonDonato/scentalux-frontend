"use client";

import type { ReactNode } from 'react';
import { createContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

// URL del backend Spring Boot
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9090';

// Mapeo de roles del backend al frontend
const roleMapping: Record<string, 'admin' | 'waiter' | 'kitchen'> = {
  'ADMIN': 'admin',
  'MESERO': 'waiter',
  'COCINA': 'kitchen'
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Verificar si hay token guardado
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        // Decodificar el token JWT para obtener info del usuario
        const payload = JSON.parse(atob(token.split('.')[1]));
        const backendRole = payload.role?.split(',')[0] || 'USER';
        
        const userData: User = {
          id: '1', // Temporal, podrías obtener el ID real del backend
          name: payload.sub.split('@')[0], // Extraer nombre del email
          username: payload.sub,
          role: roleMapping[backendRole] || 'waiter'
        };
        
        setUser(userData);
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('auth_token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      
      // Guardar token
      localStorage.setItem('auth_token', data.access_token);
      
      // Crear objeto usuario
      const backendRole = data.roles[0] || 'USER';
      const userData: User = {
        id: '1', // Temporal
        name: data.username.split('@')[0],
        username: data.username,
        role: roleMapping[backendRole] || 'waiter'
      };
      
      setUser(userData);
      
      // Redirigir según el rol
      switch (userData.role) {
        case 'admin':
          router.push('/admin');
          break;
        case 'waiter':
          router.push('/waiter');
          break;
        case 'kitchen':
          router.push('/kitchen');
          break;
        default:
          router.push('/login');
      }
      
      return true;
      
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, [router]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('auth_token');
    router.push('/login');
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="w-full max-w-md space-y-4 p-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}