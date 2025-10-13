'use client';

import PerfumeCard from '@/components/perfume/PerfumeCard';
import { usePerfumes } from '@/context/PerfumeContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Heart, Star, ChevronRight } from 'lucide-react';

export default function CategoriesPage() {
  const { publishedPerfumes } = usePerfumes();
  const categories = [
    { 
      id: 'para-ella', 
      name: 'Para Ella', 
      emoji: '🌸',
      description: 'Fragancias femeninas y elegantes',
      gradient: 'from-rose-400 to-pink-500',
      bgGradient: 'bg-gradient-to-br from-rose-50 to-pink-50'
    },
    { 
      id: 'para-el', 
      name: 'Para Él', 
      emoji: '🌊',
      description: 'Aromas masculinos y sofisticados',
      gradient: 'from-blue-500 to-cyan-600',
      bgGradient: 'bg-gradient-to-br from-blue-50 to-cyan-50'
    },
    { 
      id: 'unisex', 
      name: 'Unisex', 
      emoji: '✨',
      description: 'Perfumes para todos los gustos',
      gradient: 'from-purple-500 to-indigo-600',
      bgGradient: 'bg-gradient-to-br from-purple-50 to-indigo-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header Elegante */}
       <div className="text-center mb-16">
          <h1 className="font-headline text-5xl font-light text-slate-900 mb-6 tracking-tight">
            Categorías
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Descubre nuestra cuidadosa selección de fragancias organizadas por categorías
          </p>
        </div>


        {/* Tarjetas de Categorías - Diseño Premium */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          {categories.map((category, index) => {
            const perfumesInCategory = publishedPerfumes.filter(p => p.category === category.name);
            const count = perfumesInCategory.length;
            
            return (
              <Card 
                key={category.id} 
                className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer bg-white"
              >
                <div className={`absolute inset-0 ${category.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <CardContent className="relative p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${category.gradient} flex items-center justify-center text-white text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {category.emoji}
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                  
                  <h3 className="font-headline text-2xl font-semibold text-slate-900 mb-3">
                    {category.name}
                  </h3>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    {category.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <Badge 
                      variant="secondary" 
                      className="bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-700 px-4 py-2"
                    >
                      <Star className="w-3 h-3 mr-2 fill-current text-amber-500" />
                      {count} {count === 1 ? 'fragancia' : 'fragancias'}
                    </Badge>
                    <span className="text-sm text-slate-500 group-hover:text-slate-700 transition-colors">
                      Explorar
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Secciones de Productos - Diseño Refinado */}
        <div className="space-y-20">
          {categories.map((category) => {
            const perfumesInCategory = publishedPerfumes.filter(p => p.category === category.name);
            
            return (
              <section key={category.id} className="scroll-mt-8">
                {/* Header de Sección Elegante */}
                <div className="flex items-end justify-between mb-12 pb-6 border-b border-slate-200">
                  <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${category.gradient} flex items-center justify-center text-white text-2xl shadow-lg`}>
                      {category.emoji}
                    </div>
                    <div>
                      <h2 className="font-headline text-4xl font-light text-slate-900 mb-2">
                        {category.name}
                      </h2>
                      <p className="text-slate-600 text-lg">
                        {category.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100/80 backdrop-blur-sm">
                      <span className="text-sm font-medium text-slate-700">
                        {perfumesInCategory.length}
                      </span>
                      <span className="text-sm text-slate-500">
                        {perfumesInCategory.length === 1 ? 'producto' : 'productos'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Grid de Perfumes */}
                {perfumesInCategory.length > 0 ? (
                  <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {perfumesInCategory.map((perfume) => (
                      <PerfumeCard key={perfume.id} perfume={perfume} />
                    ))}
                  </div>
                ) : (
                  <Card className="text-center py-20 border-dashed border-2 border-slate-200 bg-white/50">
                    <CardContent>
                      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-100 flex items-center justify-center">
                        <Heart className="h-8 w-8 text-slate-400" />
                      </div>
                      <h3 className="text-2xl font-light text-slate-600 mb-3">
                        Colección en Preparación
                      </h3>
                      <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
                        Estamos curando fragancias excepcionales para esta categoría. 
                        Próximamente disponible.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}