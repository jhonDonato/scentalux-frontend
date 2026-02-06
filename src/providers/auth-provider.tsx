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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9090';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // --- PARSER DE ROLES ULTRA-RESILIENTE ---
  const parseBackendRole = (rawRole: any): 'admin' | 'waiter' | 'kitchen' => {
    console.log("DEBUG [Auth]: Analizando rol crudo:", rawRole);
    
    let roleString = "";

    try {
      // Caso 1: Es un Arreglo (Ej: [{authority: 'ROLE_ADMIN'}] o ['ROLE_ADMIN'])
      if (Array.isArray(rawRole) && rawRole.length > 0) {
        const first = rawRole[0];
        roleString = typeof first === 'object' ? (first.authority || first.role || JSON.stringify(first)) : String(first);
      } 
      // Caso 2: Es un Objeto simple
      else if (typeof rawRole === 'object' && rawRole !== null) {
        roleString = rawRole.authority || rawRole.role || JSON.stringify(rawRole);
      } 
      // Caso 3: Es un String directo
      else {
        roleString = String(rawRole || "");
      }

      const normalized = roleString.toUpperCase();
      console.log("DEBUG [Auth]: String de rol identificado:", normalized);

      if (normalized.includes('ADMIN')) return 'admin';
      if (normalized.includes('MESERO') || normalized.includes('WAITER')) return 'waiter';
      if (normalized.includes('COCINA') || normalized.includes('KITCHEN')) return 'kitchen';
      
    } catch (e) {
      console.error("DEBUG [Auth]: Error fatal parseando rol:", e);
    }

    return 'waiter'; // Fallback seguro
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log("DEBUG [Auth]: Payload JWT completo:", payload);

        const currentTime = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < currentTime) {
          localStorage.removeItem('auth_token');
          setUser(null);
        } else {
          // Buscamos el rol en cualquier lugar posible del token
          const finalRole = parseBackendRole(payload.role || payload.roles || payload.authorities);
          
          const userData: User = {
            id: '1',
            name: payload.sub.split('@')[0],
            username: payload.sub,
            role: finalRole
          };
          console.log("DEBUG [Auth]: Usuario verificado y seteado:", userData);
          setUser(userData);
        }
      } catch (error) {
        console.error("DEBUG [Auth]: Error decodificando token:", error);
        localStorage.removeItem('auth_token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      console.log("DEBUG [Auth]: Respuesta de Login completa:", data);
      
      localStorage.setItem('auth_token', data.access_token);
      
      // Aplicamos la misma lógica de parseo a la respuesta del login
      const finalRole = parseBackendRole(data.roles || data.role || data.authorities);

      const userData: User = {
        id: '1',
        name: data.username ? data.username.split('@')[0] : username.split('@')[0],
        username: data.username || username,
        role: finalRole
      };
      
      setUser(userData);

      // Redirigir según el rol detectado
      if (finalRole === 'admin') router.push('/admin');
      else if (finalRole === 'waiter') router.push('/waiter');
      else if (finalRole === 'kitchen') router.push('/kitchen');
      else router.push('/login');
      
      return true;
    } catch (error) {
      console.error("DEBUG [Auth]: Error en proceso de login:", error);
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
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <Skeleton className="h-12 w-48 mx-auto" />
          <p className="text-sm text-muted-foreground animate-pulse">Sincronizando seguridad...</p>
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