
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/dashboard-layout';
import { LayoutDashboard, UtensilsCrossed } from 'lucide-react';

export default function KitchenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);
  
  if (isLoading || !user) {
    return (
        <div className="flex h-screen w-screen items-center justify-center">
            <div>Cargando...</div>
        </div>
    );
  }

  // Allow admin and kitchen roles
  if (user.role !== 'kitchen' && user.role !== 'admin') {
      router.push('/login');
      return <div className="flex h-screen w-screen items-center justify-center">Redirigiendo...</div>;
  }
  
  const navItems = [
    { href: '/kitchen', label: 'Pedidos', icon: UtensilsCrossed },
  ];

  if (user.role === 'admin') {
    navItems.push({ href: '/waiter', label: 'Mesas', icon: LayoutDashboard });
    navItems.push({ href: '/admin', label: 'Admin', icon: LayoutDashboard });
  }


  return <div className="light"><DashboardLayout navItems={navItems}>{children}</DashboardLayout></div>;
}
