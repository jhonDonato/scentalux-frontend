
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/dashboard-layout';
import { LayoutDashboard, Tag, Utensils, BarChart3, Package, Notebook, CalendarDays } from 'lucide-react';

export default function WaiterLayout({
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
  
  // Allow admin to see waiter page too
  if (user.role !== 'waiter' && user.role !== 'admin') {
      router.push('/login');
      return <div className="flex h-screen w-screen items-center justify-center">Redirigiendo...</div>;
  }

  let navItems;
  if (user.role === 'admin') {
    navItems = [
      { href: '/admin', label: 'Reportes', icon: BarChart3 },
      { href: '/menu-editor', label: 'Editor de Menú', icon: Utensils },
      { href: '/waiter/offers', label: 'Ofertas', icon: Tag },
      { href: '/admin/inventory', label: 'Inventario', icon: Package },
      { href: '/waiter', label: 'Mesas', icon: LayoutDashboard },
      { href: '/admin/calendar', label: 'Calendario', icon: CalendarDays },
      { href: '/admin/notes', label: 'Notas', icon: Notebook },
    ];
  } else { // Waiter
    navItems = [
      { href: '/waiter', label: 'Mesas', icon: LayoutDashboard },
      { href: '/menu-editor', label: 'Editor de Menú', icon: Utensils },
      { href: '/waiter/offers', label: 'Ofertas', icon: Tag },
    ];
  }


  return <div className="light"><DashboardLayout navItems={navItems}>{children}</DashboardLayout></div>;
}
