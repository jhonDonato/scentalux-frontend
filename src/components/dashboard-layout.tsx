
"use client";

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Logo } from '@/components/icons';
import { LogOut, BellIcon, PhoneIncoming } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from './ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { RealTimeClock } from './real-time-clock';
import * as api from '@/lib/api';
import { useEffect, useState } from 'react';
import { Notification } from '@/lib/types';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  active?: boolean;
}

interface DashboardLayoutProps {
  children: ReactNode;
  navItems: NavItem[];
}

export function DashboardLayout({ children, navItems }: DashboardLayoutProps) {
  const { user, logout, isLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  const fetchNotifications = () => {
    api.getNotifications().then(setNotifications);
  }

  useEffect(() => {
    const interval = setInterval(fetchNotifications, 5000);
    fetchNotifications();
    return () => clearInterval(interval);
  }, []);

  const checkIsActive = (itemHref: string) => {
    return pathname === itemHref;
  }
  
  const handleAcceptCall = async (e: React.MouseEvent, tableId: string, notificationId: string) => {
    e.stopPropagation();
    await api.acceptCall(tableId, notificationId);
    fetchNotifications();
  };

  const dismissNotification = async (notificationId: string) => {
    await api.dismissNotification(notificationId);
    fetchNotifications();
  }

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    if (typeof window !== 'undefined') {
      router.push('/login');
    }
    return null;
  }
  
  const getRoleDisplayName = (role: string) => {
    switch (role) {
        case 'admin': return 'Administrador';
        case 'waiter': return 'Mesero';
        case 'kitchen': return 'Cocinero(a)';
        default: return role;
    }
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="w-8 h-8 text-primary" />
            <span className="font-bold text-lg text-sidebar-foreground group-data-[collapsible=icon]:hidden">Costa Del Sur</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={checkIsActive(item.href)}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={logout} tooltip="Cerrar Sesión">
                <LogOut />
                <span>Cerrar Sesión</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
          <SidebarTrigger />
          <div className="flex items-center gap-4">
             <RealTimeClock />
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <BellIcon className="h-5 w-5" />
                  {notifications.length > 0 && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0">{notifications.length}</Badge>
                  )}
                  <span className="sr-only">Notificaciones</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                    <DropdownMenuItem disabled>No hay notificaciones</DropdownMenuItem>
                ) : (
                    notifications.slice(0, 5).map(n => (
                        <DropdownMenuItem key={n.id} onSelect={(e) => e.preventDefault()} className={`flex flex-col items-start gap-1`}>
                           <p className="text-sm font-medium">{n.message}</p>
                           <div className="w-full flex justify-between items-center">
                                <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(n.timestamp, { addSuffix: true, locale: es })}
                               </p>
                               {n.type === 'call' && n.tableId && (
                                   <Button size="xs" onClick={(e) => handleAcceptCall(e, n.tableId!, n.id)}>
                                        <PhoneIncoming className="mr-1 h-3 w-3" />
                                        Aceptar
                                   </Button>
                               )}
                           </div>
                        </DropdownMenuItem>
                    ))
                )}
                 {notifications.length > 0 && (
                    <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => notifications.forEach(n => dismissNotification(n.id))}>
                        Limpiar todo
                    </DropdownMenuItem>
                    </>
                 )}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://i.pravatar.cc/150?u=${user.id}`} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground capitalize">{getRoleDisplayName(user.role)}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>Cerrar Sesión</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-muted/30">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
