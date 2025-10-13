'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, User as UserIcon, LayoutDashboard, ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import CartSheet from '@/components/cart/CartSheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Header() {
  const { cartCount } = useCart();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = localStorage.getItem('scentalux_auth_status') === 'true';
      const role = localStorage.getItem('scentalux_user_role');
      setIsAuthenticated(loggedIn);
      setUserRole(role);
    };
    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('scentalux_auth_status');
    localStorage.removeItem('scentalux_user_role');
    window.dispatchEvent(new Event('storage'));
    router.push('/');
    router.refresh();
  };
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
     <div className="container flex h-16 items-center pl-12">

        <div className="flex items-center">
           <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold font-headline text-lg">Scenta Lux</span>
          </Link>
        <nav className="hidden items-center space-x-1 text-sm font-medium md:flex">
           <Button variant="ghost" asChild>
              <Link href="/">Inicio</Link>
          </Button>
           <Button variant="ghost" asChild>
              <Link href="/categories">Categorías</Link>
          </Button>
          <Button variant="ghost" asChild>
              <Link href="/asesoria">Asesoría</Link>
          </Button>
          <Button variant="ghost" asChild>
              <Link href="/about">Sobre Nosotros</Link>
          </Button>
          <Button variant="ghost" asChild>
            <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer">
              Ayuda
            </a>
          </Button>
           {userRole === 'ADMIN' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost">
                  Opciones de Admin
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem asChild>
                  <Link href="/admin/estadisticas">Estadísticas</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/evidencias">Evidencias</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/perfumes">Perfumes</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/inventario">Inventario</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>
        </div>

      <div className="flex flex-1 items-center justify-end space-x-2 translate-x-28">
          <nav className="flex items-center space-x-2">
             {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="icon" className="rounded-full">
                    <UserIcon className="h-5 w-5" />
                    <span className="sr-only">Toggle user menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Perfil</Link>
                  </DropdownMenuItem>
                  {userRole === 'ADMIN' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin/estadisticas"><LayoutDashboard className="mr-2 h-4 w-4" />Admin</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem>Soporte</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>Cerrar Sesión</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Iniciar Sesión</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Registrarse</Link>
                </Button>
              </>
            )}
            <CartSheet>
              <Button variant="outline" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs">
                    {cartCount}
                  </span>
                )}
              </Button>
            </CartSheet>
          </nav>
        </div>
      </div>
    </header>
  );
}
