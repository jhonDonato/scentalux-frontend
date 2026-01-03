
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Autoplay from "embla-carousel-autoplay";
import { Phone, Calendar, Clock, Users, User as UserIcon, MessageSquare, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Logo } from '@/components/icons';
import type { MenuItem, Offer } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import * as api from '@/lib/api';


function ReservationForm() {
    const { toast } = useToast();
    const [name, setName] = useState('');
    const [people, setPeople] = useState('');
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [time, setTime] = useState('13:00');

    const handleReservation = () => {
        if (!name || !people || !date || !time) {
            toast({
                title: "Campos Incompletos",
                description: "Por favor, complete todos los campos para la reserva.",
                variant: "destructive"
            });
            return;
        }

        const formattedDate = format(date, "PPP", { locale: es });
        const message = `¡Hola! Quiero hacer una reserva a nombre de *${name}* para *${people} personas* el día *${formattedDate}* a las *${time}*.`;
        const whatsappUrl = `https://wa.me/51927325659?text=${encodeURIComponent(message)}`;
        
        window.open(whatsappUrl, '_blank');

        toast({
            title: "Redirigiendo a WhatsApp",
            description: "Completa tu reserva enviando el mensaje."
        });
    };

    return (
        <Card className="w-full max-w-lg mx-auto bg-card shadow-lg">
            <CardContent className="p-6 space-y-4">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label htmlFor="name" className="text-sm font-medium text-card-foreground/80 flex items-center gap-2"><UserIcon className="h-4 w-4"/> Nombre</label>
                        <Input id="name" placeholder="Ej: Jhon Doe" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                       <label htmlFor="people" className="text-sm font-medium text-card-foreground/80 flex items-center gap-2"><Users className="h-4 w-4"/> Personas</label>
                        <Input id="people" type="number" placeholder="Ej: 4" value={people} onChange={e => setPeople(e.target.value)} />
                    </div>
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label htmlFor="date" className="text-sm font-medium text-card-foreground/80 flex items-center gap-2"><Calendar className="h-4 w-4"/> Fecha</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                                >
                                <Calendar className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP", { locale: es }) : <span>Elige una fecha</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <CalendarComponent
                                    locale={es}
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                    disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                                    className="reservation-calendar"
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="space-y-2">
                       <label htmlFor="time" className="text-sm font-medium text-card-foreground/80 flex items-center gap-2"><Clock className="h-4 w-4"/> Hora</label>
                        <Input id="time" type="time" value={time} onChange={e => setTime(e.target.value)} />
                    </div>
                </div>
                <Button onClick={handleReservation} className="w-full bg-green-600 hover:bg-green-700 text-white">
                    <MessageSquare className="mr-2 h-4 w-4"/> Reservar vía WhatsApp
                </Button>
            </CardContent>
        </Card>
    );
}


export default function HomePage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);

  useEffect(() => {
    api.getMenuItems().then(items => setMenuItems(items.filter(item => item.published && item.stock > 0)));
    api.getOffers().then(offers => setOffers(offers.filter(offer => offer.published)));
  }, []);

  const allAvailableItems = menuItems;
  const publishedOffers = offers;

  const categoriesInOrder: MenuItem['category'][] = ['Platos Fuertes', 'Platos a la Carta', 'Entradas', 'Bebidas', 'Postres'];
  
  const menuByCategory = categoriesInOrder.reduce((acc, category) => {
    const items = allAvailableItems.filter(item => item.category === category);
    if (items.length > 0) {
      acc[category] = items;
    }
    return acc;
  }, {} as Record<MenuItem['category'], MenuItem[]>);

  const handleInfoClick = () => {
    const message = "¡Hola! Quisiera más información sobre Costa Del Sur.";
    const whatsappUrl = `https://wa.me/51927325659?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="dark">
        <header className="absolute top-0 z-50 w-full bg-gradient-to-b from-black/80 to-transparent">
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
                     <Link href="/login" passHref>
                        <Button variant="outline" size="sm" className="bg-transparent border-white/50 text-white hover:bg-white/10 hover:text-white">Acceso Personal</Button>
                    </Link>
                </div>
            </div>
            <nav className="container mx-auto flex h-14 items-center justify-center px-4">
                <div className="flex items-center gap-8 text-sm font-medium">
                    <Link href="/" className="text-primary font-semibold border-b-2 border-primary pb-1">Inicio</Link>
                    <Link href="/menu" className="text-white/80 hover:text-primary transition-colors">Menú</Link>
                    <Link href="#ofertas" className="text-white/80 hover:text-primary transition-colors">Ofertas</Link>
                    <Link href="#reservas" className="text-white/80 hover:text-primary transition-colors">Reservas</Link>
                </div>
            </nav>
        </header>

        <main>
            <section className="relative h-screen w-full">
                <div className="absolute inset-0 z-0">
                    <Image 
                        src="https://images.unsplash.com/photo-1509315811345-672d83ef2fbc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxzb2xlJTIwYmVhY2glMjBkaW5pbmcsJTIwcmVzdGF1cmFudHxlbnwwfHx8fDE3NjU1NDQ5NzR8MA&ixlib=rb-4.1.0&q=80&w=1920"
                        alt="Restaurante con vista al mar"
                        fill
                        className="object-cover"
                        data-ai-hint="beach restaurant"
                        priority
                    />
                    <div className="absolute inset-0 bg-black/70"></div>
                </div>
                <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white p-4">
                    <h2 
                    className="text-5xl md:text-7xl font-bold font-headline tracking-tight drop-shadow-lg animate-fade-in-down" 
                    style={{animationDelay: '0.2s', animationFillMode: 'backwards'}}
                    >
                    El Sabor Auténtico del Mar
                    </h2>
                    <p 
                    className="mt-4 max-w-2xl text-lg md:text-xl text-white/80 drop-shadow-md animate-fade-in-up" 
                    style={{animationDelay: '0.5s', animationFillMode: 'backwards'}}
                    >
                        Una experiencia culinaria que captura la frescura y la tradición de la costa en cada plato.
                    </p>
                    <div 
                    className="mt-8 animate-fade-in-up"
                    style={{animationDelay: '0.8s', animationFillMode: 'backwards'}}
                    >
                    <Link href="/#platos-destacados" passHref>
                        <Button size="lg" className="text-lg bg-primary hover:bg-primary/90 text-primary-foreground">Ver todos los platos</Button>
                    </Link>
                    </div>
                </div>
                 <div 
                  className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent"
                 />
            </section>
        </main>
      </div>

      <section id="platos-destacados" className="py-16 bg-background text-foreground">
          <div className="container mx-auto px-4 space-y-20">
            {allAvailableItems.length > 0 && (
              <div>
                <div className="text-center mb-10">
                    <h3 className="text-4xl font-bold font-headline tracking-tight">Platos Destacados</h3>
                    <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Una selección de nuestros mejores platos, combinando tradición e innovación en cada bocado.</p>
                </div>
                <Carousel 
                    opts={{ loop: true, align: 'start' }} 
                    plugins={[Autoplay({ delay: 4000, stopOnInteraction: true })]}
                    className="w-full"
                >
                    <CarouselContent className="-ml-4">
                        {allAvailableItems.map(item => (
                            <CarouselItem key={item.id} className="md:basis-1/2 lg:basis-1/3 pl-4 py-2">
                              <div className="p-1">
                                <Card className="overflow-hidden h-full group bg-card border shadow-sm">
                                    <div className="relative h-80 w-full">
                                        <Image
                                            src={item.image || 'https://picsum.photos/seed/menu-item/600/400'}
                                            alt={item.name}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                            data-ai-hint={PlaceHolderImages.find(p => p.imageUrl === item.image)?.imageHint}
                                            sizes="(max-width: 768px) 100vw, 50vw, 33vw"
                                        />
                                    </div>
                                    <CardContent className="p-4 bg-card">
                                        <h3 className="text-lg font-bold font-headline text-card-foreground">{item.name}</h3>
                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                                        <p className="text-xl font-bold text-primary mt-2">S/.{item.price.toFixed(2)}</p>
                                    </CardContent>
                                </Card>
                              </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="absolute left-[-1rem] top-1/2 -translate-y-1/2 z-10 text-foreground bg-background/80 border-primary text-primary hover:bg-primary hover:text-primary-foreground" />
                    <CarouselNext className="absolute right-[-1rem] top-1/2 -translate-y-1/2 z-10 text-foreground bg-background/80 border-primary text-primary hover:bg-primary hover:text-primary-foreground" />
                </Carousel>
              </div>
            )}
          
            {publishedOffers.length > 0 && (
              <div id="ofertas">
                <div className="text-center mb-10">
                    <h3 className="text-4xl font-bold font-headline tracking-tight flex items-center justify-center gap-3"><Tag className="h-8 w-8 text-primary"/> Nuestras Ofertas</h3>
                    <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Aprovecha nuestras promociones especiales por tiempo limitado.</p>
                </div>
                <Carousel 
                    opts={{ loop: publishedOffers.length > 2, align: 'start' }} 
                    plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]}
                    className="w-full"
                >
                    <CarouselContent className="-ml-4">
                        {publishedOffers.map((offer: Offer) => (
                            <CarouselItem key={offer.id} className="md:basis-1/2 lg:basis-1/3 pl-4 py-2">
                                <div className="p-1">
                                    <Card className="overflow-hidden h-full group bg-card border shadow-sm">
                                        <div className="relative h-60 w-full">
                                            <Image
                                                src={offer.image || 'https://picsum.photos/seed/offer/600/400'}
                                                alt={offer.title}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                sizes="(max-width: 768px) 100vw, 50vw, 33vw"
                                            />
                                        </div>
                                        <CardContent className="p-4 bg-card">
                                            <h3 className="text-lg font-bold font-headline text-card-foreground">{offer.title}</h3>
                                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{offer.description}</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="absolute left-[-1rem] top-1/2 -translate-y-1/2 z-10 text-foreground bg-background/80 border-primary text-primary hover:bg-primary hover:text-primary-foreground" />
                    <CarouselNext className="absolute right-[-1rem] top-1/2 -translate-y-1/2 z-10 text-foreground bg-background/80 border-primary text-primary hover:bg-primary hover:text-primary-foreground" />
                </Carousel>
              </div>
            )}

            {Object.entries(menuByCategory).map(([category, items]) => (
              <div key={category}>
                  <div className="text-center mb-10">
                      <h3 className="text-4xl font-bold font-headline tracking-tight">{category}</h3>
                  </div>
                  <Carousel 
                      opts={{ loop: items.length > 4, align: 'start' }} 
                      plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]}
                      className="w-full"
                  >
                      <CarouselContent className="-ml-4">
                          {items.map(item => (
                              <CarouselItem key={item.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4 pl-4 py-2">
                                   <div className="p-1">
                                      <Card className="overflow-hidden h-full group bg-card border shadow-sm">
                                          <div className="relative h-60 w-full">
                                              <Image
                                                  src={item.image || 'https://picsum.photos/seed/menu-item/600/400'}
                                                  alt={item.name}
                                                  fill
                                                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                  data-ai-hint={PlaceHolderImages.find(p => p.imageUrl === item.image)?.imageHint}
                                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                              />
                                          </div>
                                          <CardContent className="p-4 bg-card">
                                              <h3 className="text-lg font-bold font-headline text-card-foreground">{item.name}</h3>
                                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                                              <p className="text-xl font-bold text-primary mt-2">S/.{item.price.toFixed(2)}</p>
                                          </CardContent>
                                      </Card>
                                    </div>
                              </CarouselItem>
                          ))}
                      </CarouselContent>
                       <CarouselPrevious className="absolute left-[-1rem] top-1/2 -translate-y-1/2 z-10 text-foreground bg-background/80 border-primary text-primary hover:bg-primary hover:text-primary-foreground" />
                       <CarouselNext className="absolute right-[-1rem] top-1/2 -translate-y-1/2 z-10 text-foreground bg-background/80 border-primary text-primary hover:bg-primary hover:text-primary-foreground" />
                  </Carousel>
              </div>
            ))}
             {(allAvailableItems.length === 0 && publishedOffers.length === 0) && (
                <div className="text-center py-20 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">Nuestro menú y ofertas se están actualizando.</p>
                    <p className="text-sm text-muted-foreground">Por favor, vuelva más tarde.</p>
                </div>
            )}
          </div>
      </section>

      <section id="reservas" className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
            <div className="text-center mb-12">
                <h3 className="text-4xl font-bold font-headline tracking-tight">Haz tu Reserva</h3>
                <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Asegura tu mesa y vive una experiencia inolvidable frente al mar.</p>
            </div>
            <ReservationForm />
        </div>
      </section>


       <footer className="bg-card py-8 border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Costa Del Sur. Todos los derechos reservados.</p>
            <p className="mt-2 text-sm">Av. del Mar 123, Playa Hermosa | Tel: (+51) 927325659</p>
        </div>
      </footer>
      
      <Button
        onClick={handleInfoClick}
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg bg-green-500 hover:bg-green-600 text-white"
        size="icon"
      >
        <MessageSquare className="h-8 w-8" />
        <span className="sr-only">Pedir Información</span>
      </Button>

    </div>
  );
}

    

    

    
