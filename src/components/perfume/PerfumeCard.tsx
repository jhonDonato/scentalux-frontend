'use client';

import Image from 'next/image';
import Link from 'next/link';

import type { Perfume } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

interface PerfumeCardProps {
  perfume: Perfume;
  layout?: 'grid' | 'list';
}

export default function PerfumeCard({ perfume, layout = 'grid' }: PerfumeCardProps) {
  const { addToCart } = useCart();

  if (layout === 'list') {
    return (
      <Card className="group flex flex-col overflow-hidden rounded-lg border-2 border-transparent transition-all hover:border-primary hover:shadow-2xl md:flex-row">
        <CardHeader className="p-0">
          <Link href={`/perfume/${perfume.id}`}>
            <div className="relative h-64 w-full md:h-full md:w-48">
              <Image
                src={perfume.imageUrl}
                alt={perfume.name}
                data-ai-hint="botella de perfume"
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </div>
          </Link>
        </CardHeader>
        <div className="flex flex-1 flex-col">
          <CardContent className="flex-1 p-4">
             <CardTitle className="font-headline text-xl">
               <Link href={`/perfume/${perfume.id}`}>{perfume.name}</Link>
            </CardTitle>
            <p className="text-sm text-muted-foreground">{perfume.brand}</p>
            <p className="mt-2 text-sm text-foreground/80 line-clamp-2">{perfume.description}</p>
             <div className="mt-2 flex flex-wrap gap-1">
              {perfume.notes.slice(0, 3).map((note) => (
                <Badge key={note} variant="outline" className="text-xs">{note}</Badge>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between p-4 pt-0">
            <p className="text-lg font-bold text-primary">${perfume.price.toFixed(2)}</p>
            <Button onClick={() => addToCart(perfume.id)}>Añadir al Carrito</Button>
          </CardFooter>
        </div>
      </Card>
    );
  }

  return (
    <Card className="group flex flex-col overflow-hidden rounded-lg border-2 border-transparent transition-all hover:border-primary hover:shadow-2xl">
      <CardHeader className="p-0">
        <Link href={`/perfume/${perfume.id}`}>
          <div className="relative h-64 w-full">
            <Image
              src={perfume.imageUrl}
              alt={perfume.name}
              data-ai-hint="botella de perfume"
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
          </div>
        </Link>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <CardTitle className="font-headline text-xl">
          <Link href={`/perfume/${perfume.id}`}>{perfume.name}</Link>
        </CardTitle>
        <p className="text-sm text-muted-foreground">{perfume.brand}</p>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 pt-0">
        <p className="text-lg font-bold text-primary">${perfume.price.toFixed(2)}</p>
        <Button onClick={() => addToCart(perfume.id)}>Añadir al Carrito</Button>
      </CardFooter>
    </Card>
  );
}
