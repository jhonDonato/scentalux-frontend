"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/dashboard-layout';
import { LayoutDashboard, BarChart3, Package, Utensils, Tag, Notebook, CalendarDays } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
  if (!isLoading) {
    console.log("DEBUG [AdminLayout]: Verificando acceso para rol:", user?.role);
    if (!user || user.role !== 'admin') {
      console.warn("DEBUG [AdminLayout]: Redirigiendo porque el rol no es admin.");
      router.push('/login');
    } else {
      console.log("DEBUG [AdminLayout]: Acceso concedido.");
    }
  }
}, [user, isLoading, router]);

  const navItems = [
    { href: '/admin', label: 'Reportes', icon: BarChart3 },
    { href: '/admin/menu-editor', label: 'Editor de Menú', icon: Utensils },
    { href: '/waiter/offers', label: 'Ofertas', icon: Tag },
    { href: '/admin/inventory', label: 'Inventario', icon: Package },
    { href: '/waiter', label: 'Mesas', icon: LayoutDashboard },
    { href: '/admin/calendar', label: 'Calendario', icon: CalendarDays },
    { href: '/admin/notes', label: 'Notas', icon: Notebook },
  ];

  return <div className="light"><DashboardLayout navItems={navItems}>{children}</DashboardLayout></div>;
}