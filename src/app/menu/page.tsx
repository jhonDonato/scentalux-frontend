
"use client";

import React, { Suspense, useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Phone, Clock, AlertTriangle, Home, Utensils, User, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/icons';
import type { MenuItem, Offer } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
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

function MenuItemCard({ item }: { item: MenuItem }) {
  const placeholder = PlaceHolderImages.find(p => p.imageUrl === item.image);
  return (
    <Card className="overflow-hidden transition-all duration-300 group hover:shadow-lg hover:shadow-primary/20 bg-card border flex flex-col">
      <div className="relative h-48 w-full">
        <Image
          src={item.image || 'https://picsum.photos/seed/menu-item/600/400'}
          alt={item.name}
          fill
          className="object-cover rounded-t-md transition-transform duration-500 group-hover:scale-110"
          data-ai-hint={placeholder?.imageHint}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
       <div className="p-4 flex flex-col flex-grow">
          <h3 className="font-headline text-lg font-bold">{item.name}</h3>
          <p className="text-sm text-muted-foreground flex-grow mt-1">{item.description}</p>
          <p className="text-lg font-bold text-primary mt-3">S/.{item.price.toFixed(2)}</p>
      </div>
    </Card>
  );
}

function CustomerMenuPageContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const tableQuery = searchParams.get('table');

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isCallAlertOpen, setIsCallAlertOpen] = useState(false);
  const [tableNumberInput, setTableNumberInput] = useState(tableQuery || '');
  const [activeTab, setActiveTab] = useState('Entradas');

  useEffect(() => {
    api.getMenuItems().then(items => setMenuItems(items.filter(item => item.published)));
    api.getOffers().then(offerItems => setOffers(offerItems.filter(offer => offer.published)));
  }, []);

  const categories: MenuItem['category'][] = ['Entradas', 'Platos Fuertes', 'Platos a la Carta', 'Bebidas', 'Postres'];
  
  const menuByCategory = useMemo(() => {
    return categories.reduce((acc, category) => {
      const items = menuItems.filter(item => item.category === category && item.stock > 0);
      if (items.length > 0) {
        acc[category] = items;
      }
      return acc;
    }, {} as Record<MenuItem['category'], MenuItem[]>);
  }, [menuItems]);

  const displayCategories: (MenuItem['category'])[] = ['Entradas', 'Platos Fuertes', 'Platos a la Carta'];

  const defaultTab = useMemo(() => 
    Object.keys(menuByCategory).find(cat => displayCategories.includes(cat as any)) || 'Entradas', 
  [menuByCategory, displayCategories]);

  const handleCallWaiter = () => {
    const tableId = tableNumberInput;
    
    if(!tableId) {
        setIsCallAlertOpen(true);
        return;
    }
    
    api.callWaiter(tableId);
    toast({
        title: "Llamada Enviada",
        description: `Un mesero atenderá la mesa ${tableId} pronto.`,
    });
    setIsCallAlertOpen(false);
  };
  
  const submitCallFromAlert = () => {
      const tableId = tableNumberInput;
      if (!tableId || isNaN(parseInt(tableId, 10)) || parseInt(tableId, 10) <= 0) {
        toast({
            title: "Número de Mesa Inválido",
            description: "Por favor, ingrese un número de mesa válido.",
            variant: "destructive"
        });
        return;
      }
      handleCallWaiter();
  }
  
  const offersExist = offers.length > 0;
  const offersLink = offersExist ? "/#ofertas" : "/";


  return (
    <div className="min-h-screen bg-white text-foreground">
       <div className="dark">
        <header className="sticky top-0 z-50 w-full bg-background/90 backdrop-blur-sm">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 text-white">
                <div className="flex items-center gap-4 text-sm">
                    <Phone className="h-4 w-4" />
                    <span>(+51) 927325659</span>
                </div>
                <Link href="/" className="flex flex-col items-center">
                    <Logo className="h-10 w-10 text-primary" />
                    <span className="text-xl font-bold tracking-tighter">Costa Del Sur</span>
                </Link>
                <div className="flex items-center gap-4">
                    {tableQuery && (
                      <div className="font-semibold rounded-md bg-secondary text-secondary-foreground px-3 py-1 text-sm">Mesa {tableQuery}</div>
                    )}
                     <Link href="/login" passHref>
                        <Button variant="outline" size="sm" className="bg-transparent border-white/50 text-white hover:bg-white/10 hover:text-white">Acceso Personal</Button>
                    </Link>
                </div>
            </div>
            <nav className="container mx-auto flex h-14 items-center justify-center px-4">
                <div className="flex items-center gap-8 text-sm font-medium">
                    <Link href="/" className="text-white/80 hover:text-primary transition-colors">Inicio</Link>
                    <Link href="/menu" className="text-primary font-semibold border-b-2 border-primary pb-1">Menú</Link>
                    <Link href={offersLink} className="text-white/80 hover:text-primary transition-colors">Ofertas</Link>
                    <Link href="/#reservas" className="text-white/80 hover:text-primary transition-colors">Reservas</Link>
                </div>
            </nav>
        </header>

        <div className="relative">
            <div 
              className="absolute inset-x-0 top-0 h-16 bg-background"
              style={{
                maskImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1440 320\'%3E%3Cpath fill=\'black\' fill-opacity=\'1\' d=\'M0,128L120,133.3C240,139,480,149,720,149.3C960,149,1200,139,1320,133.3L1440,128L1440,0L1320,0C1200,0,960,0,720,0C480,0,240,0,120,0L0,0Z\'%3E%3C/path%3E%3C/svg%3E")',
                maskRepeat: 'no-repeat',
                maskPosition: 'center top',
                WebkitMaskImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1440 320\'%3E%3Cpath fill=\'black\' fill-opacity=\'1\' d=\'M0,128L120,133.3C240,139,480,149,720,149.3C960,149,1200,139,1320,133.3L1440,128L1440,0L1320,0C1200,0,960,0,720,0C480,0,240,0,120,0L0,0Z\'%3E%3C/path%3E%3C/svg%3E")',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center top',
              }}
            />
        </div>
      </div>
      
      <main className="container mx-auto p-4 md:p-8 mt-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold font-headline tracking-tight">Nuestro Menú</h2>
          <p className="text-muted-foreground mt-2">Sabores frescos del mar, directo a tu mesa.</p>
        </div>
        
        {activeTab === 'Platos a la Carta' && (
          <Alert className="mb-8 bg-blue-50 border-blue-200 text-blue-800">
              <Clock className="h-4 w-4 !text-blue-800" />
              <AlertTitle>Tiempo de Preparación</AlertTitle>
              <AlertDescription>
                  El tiempo de espera estimado para los platos a la carta es de 30 minutos. Agradecemos su paciencia.
              </AlertDescription>
          </Alert>
        )}

        {Object.keys(menuByCategory).length > 0 ? (
          <Tabs defaultValue={defaultTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-secondary/80">
              {displayCategories.map((category) => (
                menuByCategory[category] && <TabsTrigger key={category} value={category} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{category}</TabsTrigger>
              ))}
            </TabsList>
            
            {Object.entries(menuByCategory).map(([category, items]) => (
              <TabsContent key={category} value={category}>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {items.map((item) => (
                    <MenuItemCard key={item.id} item={item} />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground">El menú no está disponible en este momento. Por favor, consulte a nuestro personal.</p>
          </div>
        )}
      </main>

      <Button
        onClick={handleCallWaiter}
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground"
        size="icon"
      >
        <Phone className="h-8 w-8" />
        <span className="sr-only">Llamar al Mesero</span>
      </Button>

      <AlertDialog open={isCallAlertOpen} onOpenChange={setIsCallAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Llamar a un mesero</AlertDialogTitle>
            <AlertDialogDescription>
              Por favor, ingrese su número de mesa para que podamos atenderle.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Input 
              type="number"
              placeholder="Número de Mesa"
              value={tableNumberInput}
              onChange={(e) => setTableNumberInput(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={submitCallFromAlert}>Llamar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <footer className="bg-card py-8 mt-16 border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Costa Del Sur. Todos los derechos reservados.</p>
            <p className="mt-2 text-sm">Av. del Mar 123, Playa Hermosa | Tel: (+51) 927325659</p>
        </div>
      </footer>
    </div>
  );
}

export default function CustomerMenuPage() {
    return (
        <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center">Cargando...</div>}>
            <CustomerMenuPageContent />
        </Suspense>
    )
}
