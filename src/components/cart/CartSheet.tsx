'use client';

import Link from 'next/link';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { usePerfumes } from '@/context/PerfumeContext';
import CartItem from './CartItem';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { ShoppingBag, X, CreditCard } from 'lucide-react';
import { Badge } from '../ui/badge';

export default function CartSheet({ children }: { children: React.ReactNode }) {
  const { cartItems, cartCount } = useCart();
  const { getPerfumeById } = usePerfumes();

  const detailedCartItems = cartItems.map(item => {
    const perfume = getPerfumeById(item.id);
    return perfume ? { ...item, perfume } : null;
  }).filter(Boolean);

  const subtotal = detailedCartItems.reduce((total, item) => {
    if (!item) return total;
    return total + item.perfume.price * item.quantity;
  }, 0);

  const taxes = subtotal * 0.08;
  const total = subtotal + taxes;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className="relative">
          {children}
          {cartCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs min-w-0"
            >
              {cartCount}
            </Badge>
          )}
        </div>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col p-0 sm:max-w-lg">
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-6 w-6 text-primary" />
              <SheetTitle className="font-headline text-xl m-0">Mi Carrito</SheetTitle>
            </div>
            <Badge variant="secondary" className="font-semibold">
              {cartCount} item{cartCount !== 1 ? 's' : ''}
            </Badge>
          </div>
        </SheetHeader>
        
        {detailedCartItems.length > 0 ? (
          <>
            <ScrollArea className="flex-1">
              <div className="flex flex-col p-6">
                <div className="space-y-4">
                  {detailedCartItems.map((item) => item && (
                    <CartItem key={item.id} item={item} />
                  ))}
                </div>
              </div>
            </ScrollArea>
            
            <div className="border-t bg-muted/20 p-6 space-y-4">
              {/* Resumen de precios */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Impuestos (8%)</span>
                  <span className="font-medium">${taxes.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col gap-3">
                <Button asChild size="lg" className="w-full gap-2">
                  <Link href="/checkout">
                    <CreditCard className="h-4 w-4" />
                    Proceder al Pago
                  </Link>
                </Button>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full">
                    Seguir Comprando
                  </Button>
                </SheetTrigger>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="font-headline text-xl">Carrito Vacío</h3>
              <p className="text-muted-foreground text-sm">
                Agrega algunos productos increíbles a tu carrito
              </p>
            </div>
            <SheetTrigger asChild>
              <Button className="gap-2">
                <ShoppingBag className="h-4 w-4" />
                Explorar Productos
              </Button>
            </SheetTrigger>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}