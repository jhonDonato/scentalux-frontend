'use client';
import {
  BarChart,
  ChevronLeft,
  Home,
  Package,
  PackagePlus,
  Receipt,
  Settings,
  ShoppingBag,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userRole = localStorage.getItem('scentalux_user_role');
    console.log('🔐 User role in AdminLayout:', userRole); // Para debug
    
    // 🔥 CAMBIO IMPORTANTE: Cambiar 'admin' por 'ADMIN'
    if (userRole !== 'ADMIN') {
      console.log('❌ Usuario no es ADMIN, redirigiendo...');
      router.replace('/');
    } else {
      console.log('✅ Usuario es ADMIN, permitiendo acceso');
      setIsAdmin(true);
    }
    setIsLoading(false);
  }, [router]);

  // Mostrar loading mientras se verifica
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }
  
  return (
    <SidebarProvider>
      <Sidebar side="left">
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <h2 className="font-headline text-lg group-data-[collapsible=icon]:hidden">
              Admin Panel
            </h2>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === '/admin/estadisticas'}
              tooltip="Estadísticas"
            >
              <Link href="/admin/estadisticas">
                <BarChart />
                <span>Estadísticas</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/admin/estadisticas'}
                tooltip="Estadísticas"
              >
                <Link href="/admin/estadisticas">
                  <BarChart />
                  <span>Estadísticas</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/admin/evidencias'}
                tooltip="Evidencias"
              >
                <Link href="/admin/evidencias">
                  <Receipt />
                  <span>Evidencias</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/admin/perfumes'}
                tooltip="Perfumes"
              >
                <Link href="/admin/perfumes">
                  <PackagePlus />
                  <span>Perfumes</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/admin/inventario'}
                tooltip="Inventario"
              >
                <Link href="/admin/inventario">
                  <Package />
                  <span>Inventario</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
           <SidebarMenu>
             <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Volver al inicio">
                    <Link href="/">
                      <Home />
                      <span>Volver al inicio</span>
                    </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
           </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}