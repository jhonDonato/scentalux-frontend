"use client";

import React, { Suspense, useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Phone, Clock, ShoppingCart, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardFooter, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/icons';
import { Badge } from '@/components/ui/badge'; // Asegúrate de tener este import
import type { MenuItem, Discount } from '@/lib/types';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import * as api from '@/lib/api';

// --- COMPONENTE DE TARJETA ACTUALIZADO (ESTILO FALABELLA) ---
function MenuItemCard({ item }: { item: MenuItem }) {
  // Lógica de cálculo de precios
  const hasDiscount = item.discount && item.discount.percentage > 0;
  const discountPercent = item.discount?.percentage || 0;
  const finalPrice = hasDiscount 
      ? item.price * (1 - discountPercent / 100) 
      : item.price;

  return (
    <Card className="overflow-hidden transition-all duration-300 group hover:shadow-xl border-muted flex flex-col h-full">
      {/* IMAGEN Y BADGE DE DESCUENTO */}
      <div className="relative h-56 w-full overflow-hidden bg-muted">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-xs italic">Sin imagen</div>
        )}
        
        {hasDiscount && (
          <Badge className="absolute top-3 left-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-2 py-1 shadow-md border-none">
            -{discountPercent}%
          </Badge>
        )}
      </div>

      <CardHeader className="p-4 pb-2 flex-none">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg font-bold font-headline line-clamp-1 group-hover:text-primary transition-colors">
            {item.name}
          </CardTitle>
        </div>
        <Badge variant="outline" className="w-fit text-[10px] uppercase tracking-wider text-muted-foreground">
          {item.category}
        </Badge>
      </CardHeader>

      <CardContent className="p-4 pt-1 flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {item.description}
        </p>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between border-t bg-gray-50/30 mt-auto h-20">
        {/* PRECIOS ESTILO FALABELLA */}
        <div className="flex flex-col justify-center">
          {hasDiscount ? (
            <>
              <span className="text-xs text-gray-400 line-through decoration-gray-400 font-medium">
                S/ {item.price.toFixed(2)}
              </span>
              <span className="text-2xl font-extrabold text-red-600 leading-none tracking-tight">
                S/ {finalPrice.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-xl font-bold text-slate-900">
              S/ {item.price.toFixed(2)}
            </span>
          )}
        </div>

        <Button size="icon" className="rounded-full shadow-lg hover:scale-110 transition-transform bg-primary" aria-label="Añadir al carrito">
          <ShoppingCart className="h-5 w-5 text-white" />
        </Button>
      </CardFooter>
    </Card>
  );
}

function CustomerMenuPageContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const tableQuery = searchParams.get('table');

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isCallAlertOpen, setIsCallAlertOpen] = useState(false);
  const [tableNumberInput, setTableNumberInput] = useState(tableQuery || '');
  const [activeTab, setActiveTab] = useState('Entradas');

  useEffect(() => {
    // Solo traemos los platos del menú, el descuento viene incluido en cada item gracias al DTO actualizado
    api.getMenuItems().then(items => setMenuItems(items.filter(item => item.published)));
  }, []);

  const categories: string[] = ['Entradas', 'Platos Fuertes', 'Platos a la Carta', 'Bebidas', 'Postres'];
  
  const menuByCategory = useMemo(() => {
    return categories.reduce((acc, category) => {
      const items = menuItems.filter(item => item.category === category && item.stock > 0);
      if (items.length > 0) acc[category] = items;
      return acc;
    }, {} as Record<string, MenuItem[]>);
  }, [menuItems]);

  const displayCategories = ['Entradas', 'Platos Fuertes', 'Platos a la Carta', 'Bebidas', 'Postres'];

  const defaultTab = useMemo(() => 
    Object.keys(menuByCategory).find(cat => displayCategories.includes(cat)) || 'Entradas', 
  [menuByCategory]);

  const handleCallWaiter = () => {
    const tableId = tableNumberInput;
    if(!tableId) {
        setIsCallAlertOpen(true);
        return;
    }
    api.callWaiter(tableId);
    toast({ title: "Llamada Enviada", description: `Un mesero atenderá la mesa ${tableId} pronto.` });
    setIsCallAlertOpen(false);
  };
  
  const submitCallFromAlert = () => {
      const tableId = tableNumberInput;
      if (!tableId || isNaN(parseInt(tableId, 10)) || parseInt(tableId, 10) <= 0) {
        toast({ title: "Número Inválido", variant: "destructive" });
        return;
      }
      handleCallWaiter();
  }

  return (
    <div className="min-h-screen bg-white text-foreground pb-20">
       <div className="dark">
        <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-white/10">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 text-white">
                <div className="flex items-center gap-4 text-xs md:text-sm font-medium opacity-80">
                    <Phone className="h-4 w-4 text-primary" />
                    <span className="hidden sm:inline">(+51) 927325659</span>
                </div>
                <Link href="/" className="flex flex-col items-center">
                    <Logo className="h-9 w-9 text-primary" />
                    <span className="text-lg font-bold tracking-tighter uppercase italic">Costa Del Sur</span>
                </Link>
                <div className="flex items-center gap-3">
                    {tableQuery && (
                      <Badge variant="secondary" className="font-bold px-3 py-1">Mesa {tableQuery}</Badge>
                    )}
                     <Link href="/login" passHref>
                        <Button variant="outline" size="sm" className="hidden sm:flex border-white/20 hover:bg-white/10">Acceso</Button>
                    </Link>
                </div>
            </div>
            <nav className="container mx-auto flex h-12 items-center justify-center px-4">
                <div className="flex items-center gap-6 md:gap-10 text-xs md:text-sm font-bold uppercase tracking-widest">
                    <Link href="/" className="text-white/60 hover:text-primary transition-colors">Inicio</Link>
                    <Link href="/menu" className="text-primary border-b-2 border-primary pb-1">Menú</Link>
                    <Link href="/#ofertas" className="text-white/60 hover:text-primary transition-colors">Ofertas</Link>
                </div>
            </nav>
        </header>
      </div>
      
      <main className="container mx-auto p-4 md:p-8 mt-6">
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-slate-900 uppercase italic">
            Nuestra Carta
          </h2>
          <div className="h-1.5 w-20 bg-primary mx-auto my-4 rounded-full"></div>
          <p className="text-muted-foreground max-w-lg mx-auto">Experiencia gastronómica con los ingredientes más frescos del litoral peruano.</p>
        </div>
        
        {activeTab === 'Platos a la Carta' && (
          <Alert className="mb-8 bg-amber-50 border-amber-200 text-amber-900 shadow-sm">
              <Clock className="h-4 w-4 !text-amber-700" />
              <AlertTitle className="font-bold">Aviso de cocina</AlertTitle>
              <AlertDescription className="text-sm">
                  Los platos a la carta tienen un tiempo estimado de 30 a 40 minutos.
              </AlertDescription>
          </Alert>
        )}

        {Object.keys(menuByCategory).length > 0 ? (
          <Tabs defaultValue={defaultTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex flex-wrap justify-center mb-10 bg-transparent gap-2 h-auto">
              {displayCategories.map((category) => (
                menuByCategory[category] && (
                  <TabsTrigger 
                    key={category} 
                    value={category} 
                    className="rounded-full px-6 py-2 border data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary transition-all font-bold text-xs uppercase tracking-widest shadow-sm"
                  >
                    {category}
                  </TabsTrigger>
                )
              ))}
            </TabsList>
            
            {Object.entries(menuByCategory).map(([category, items]) => (
              <TabsContent key={category} value={category} className="mt-0 focus-visible:outline-none">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {items.map((item) => (
                    <MenuItemCard key={item.id} item={item} />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed">
            <Utensils className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground font-medium">Estamos actualizando nuestra carta...</p>
          </div>
        )}
      </main>

      {/* BOTÓN FLOTANTE */}
      <Button
        onClick={handleCallWaiter}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl bg-red-600 hover:bg-red-700 text-white animate-bounce hover:animate-none group"
        size="icon"
      >
        <Phone className="h-6 w-6 group-hover:rotate-12 transition-transform" />
      </Button>

      {/* MODAL DE LLAMADA */}
      <AlertDialog open={isCallAlertOpen} onOpenChange={setIsCallAlertOpen}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold italic uppercase tracking-tighter">Llamar mesero</AlertDialogTitle>
            <AlertDialogDescription>
              Confirma tu número de mesa para enviarte asistencia inmediata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input 
              type="number"
              placeholder="Ej: 05"
              className="text-center text-3xl h-20 font-bold rounded-2xl border-2 focus:border-primary"
              value={tableNumberInput}
              onChange={(e) => setTableNumberInput(e.target.value)}
            />
          </div>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl font-bold uppercase tracking-widest text-xs">Cerrar</AlertDialogCancel>
            <AlertDialogAction onClick={submitCallFromAlert} className="bg-primary rounded-xl font-bold uppercase tracking-widest text-xs">Enviar aviso</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <footer className="bg-slate-900 text-white/40 py-12 mt-20">
        <div className="container mx-auto px-4 text-center">
            <Logo className="h-8 w-8 text-primary mx-auto mb-4 opacity-50" />
            <p className="text-xs uppercase tracking-[0.3em] font-bold">&copy; {new Date().getFullYear()} Costa Del Sur</p>
            <p className="mt-4 text-[10px] opacity-50 leading-relaxed italic">Pasión por el mar, respeto por el sabor.</p>
        </div>
      </footer>
    </div>
  );
}

export default function CustomerMenuPage() {
    return (
        <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-white font-black italic animate-pulse uppercase tracking-[0.5em]">Cargando Experiencia...</div>}>
            <CustomerMenuPageContent />
        </Suspense>
    )
}