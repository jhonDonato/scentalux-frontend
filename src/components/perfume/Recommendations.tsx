'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { Perfume } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import PerfumeCard from './PerfumeCard';
import { useToast } from '@/hooks/use-toast';

const API_BASE_URL = '/api';

// Esta función llamará a tu backend de Spring Boot para obtener recomendaciones.
async function getRecommendationsFromApi(purchaseHistory: string[]): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purchaseHistory }), // Tu backend recibirá el historial de compras
    });

    if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
    }

    const recommendedIds: string[] = await response.json();
    return recommendedIds;
}


export default function Recommendations() {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Perfume[]>([]);
  const { toast } = useToast();
  // El hook usePerfumes ya no es necesario aquí si las recomendaciones vienen con todos los datos.
  // Sin embargo, si el backend solo devuelve IDs, lo necesitaríamos para buscar los detalles del perfume.
  // Por simplicidad, asumiremos que el endpoint `/recommendations` devuelve los objetos Perfume completos.

  const handleGetRecommendations = async () => {
    setLoading(true);
    setRecommendations([]);
    try {
      // En una aplicación real, el historial vendría del perfil del usuario autenticado.
      const mockPurchaseHistory = ['p001', 'p003']; 

      // La llamada a la API ahora debería devolver los objetos de perfume completos.
      const response = await fetch(`${API_BASE_URL}/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purchaseHistory: mockPurchaseHistory }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      
      const recommendedPerfumes: Perfume[] = await response.json();
      
      if (recommendedPerfumes.length === 0) {
        toast({
          title: 'No se encontraron recomendaciones',
          description: 'No pudimos encontrar ninguna nueva recomendación para ti en este momento.',
        });
      } else {
        setRecommendations(recommendedPerfumes);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron obtener las recomendaciones. Por favor, inténtalo de nuevo más tarde.',
        variant: 'destructive',
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full bg-background py-12 md:py-20">
      <div className="container mx-auto">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-headline text-4xl">Solo Para Ti</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Basado en tu historial de compras, aquí tienes algunos perfumes que creemos que te encantarán.
          </p>
          <Button size="lg" onClick={handleGetRecommendations} disabled={loading} className="mt-6">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {loading ? 'Buscando Tu Fragancia...' : 'Obtener Mis Recomendaciones'}
          </Button>
        </div>

        {recommendations.length > 0 && (
          <div className="mt-12">
            <Carousel
              opts={{
                align: 'start',
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent>
                {recommendations.map((perfume) => (
                  <CarouselItem key={perfume.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                    <div className="p-1">
                      <PerfumeCard perfume={perfume} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="ml-12" />
              <CarouselNext className="mr-12" />
            </Carousel>
          </div>
        )}
      </div>
    </section>
  );
}
