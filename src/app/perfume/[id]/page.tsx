'use client';

import { notFound } from 'next/navigation';
import Image from 'next/image';
import { usePerfumes } from '@/context/PerfumeContext';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import type { PerfumeWithStatus } from '@/context/PerfumeContext';
import { Skeleton } from '@/components/ui/skeleton';

export default function PerfumePage({ params }: { params: { id: string } }) {
  const { addToCart } = useCart();
  const { getPerfumeById } = usePerfumes();
  
  const [perfume, setPerfume] = useState<PerfumeWithStatus | null | undefined>(undefined);

  useEffect(() => {
    const foundPerfume = getPerfumeById(params.id);
    if (foundPerfume && foundPerfume.published) {
        setPerfume(foundPerfume);
    } else {
        setPerfume(null); // Explicitly set to null if not found or not published
    }
  }, [params.id, getPerfumeById]);


  if (perfume === undefined) {
    return (
        <div className="container mx-auto max-w-5xl py-12">
            <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
                <Skeleton className="h-96 w-full rounded-lg md:h-[500px]" />
                <div className="flex flex-col justify-center space-y-4">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-12 w-3/4" />
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-10 w-1/3" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-10 w-48" />
                </div>
            </div>
        </div>
    );
  }
  
  if (perfume === null) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-5xl py-12">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
        <div className="relative h-96 w-full overflow-hidden rounded-lg shadow-xl md:h-[500px]">
          <Image
            src={perfume.imageUrl}
            alt={perfume.name}
            data-ai-hint="botella de perfume"
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-col justify-center">
          <Badge variant="secondary" className="w-fit">{perfume.category}</Badge>
          <h1 className="mt-2 font-headline text-4xl md:text-5xl">{perfume.name}</h1>
          <p className="mt-2 text-xl text-muted-foreground">{perfume.brand}</p>
          <p className="mt-6 text-3xl font-bold text-primary">${perfume.price.toFixed(2)}</p>
          <p className="mt-6 font-body text-base leading-relaxed text-foreground/80">
            {perfume.description}
          </p>
           <div className="mt-6">
            <h3 className="font-headline text-lg">Notas Clave</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {perfume.notes.map((note) => (
                <Badge key={note} variant="outline" className="capitalize">{note}</Badge>
              ))}
            </div>
          </div>
          <div className="mt-8">
            <Button size="lg" onClick={() => addToCart(perfume.id)}>Añadir al Carrito</Button>
            <p className="mt-2 text-sm text-muted-foreground">
              {perfume.stock > 0 ? `${perfume.stock} unidades en stock` : 'Agotado'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
