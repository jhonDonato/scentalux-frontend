'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12">
      <div className="text-center">
        <h1 className="font-headline text-5xl">Sobre Scenta Lux</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Tu destino para descubrir fragancias exquisitas.
        </p>
      </div>

      <div className="mt-12">
        <Card className="overflow-hidden">
          <div className="relative h-64 w-full">
            <Image
              src="https://picsum.photos/1200/400"
              alt="Equipo de Scenta Lux trabajando"
              fill
              data-ai-hint="equipo personas"
              className="object-cover"
            />
          </div>
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Nuestra Historia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 font-body text-base leading-relaxed text-foreground/80">
            <p>
              En Scenta Lux, creemos que una fragancia es más que un simple aroma; es una expresión de identidad, un recuerdo esperando ser creado y una obra de arte invisible. Nuestra jornada comenzó con una simple pasión: conectar a las personas con perfumes excepcionales que resuenan con sus historias únicas.
            </p>
            <p>
              Fundada en 2023, Scenta Lux nació del deseo de curar una colección de las mejores fragancias del mundo, desde casas de nicho icónicas hasta artesanos emergentes. Viajamos por el mundo y colaboramos con maestros perfumistas para traerte una selección que encarna la calidad, la creatividad y la elegancia.
            </p>
            <p>
              Nuestro compromiso va más allá de ofrecer perfumes excepcionales. Nos esforzamos por crear una experiencia. Desde nuestras recomendaciones personalizadas impulsadas por IA hasta nuestro empaque de lujo, cada detalle está diseñado pensando en ti. Te invitamos a explorar nuestra colección y encontrar el aroma que cuenta tu historia.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
