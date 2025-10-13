'use client';

import { useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  List, 
  Grid, 
  Rows3, 
  Loader2, 
  Search, 
  X, 
  Filter, 
  DollarSign,
  SlidersHorizontal,
  Sparkles,
  Tag
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { usePerfumes } from '@/context/PerfumeContext';
import PerfumeCard from '@/components/perfume/PerfumeCard';
import Recommendations from '@/components/perfume/Recommendations';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

// Definir tipos para los filtros avanzados
type ScentCategory = 'floral' | 'citrico' | 'amaderado' | 'oriental' | 'fresco' | 'todas';
type Intensity = 'suave' | 'moderado' | 'intenso' | 'todas';
type Season = 'primavera' | 'verano' | 'otoño' | 'invierno' | 'todas';

interface AdvancedFilters {
  scentCategory: ScentCategory;
  intensity: Intensity;
  season: Season;
  priceRange: [number, number];
  inStock: boolean;
}

export default function Home() {
  const { publishedPerfumes, loading } = usePerfumes();
  const [searchTerm, setSearchTerm] = useState('');
  const [gridSize, setGridSize] = useState(4);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Estado para filtros avanzados
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    scentCategory: 'todas',
    intensity: 'todas',
    season: 'todas',
    priceRange: [0, 300],
    inStock: false
  });

  // Categorías de aroma para filtros
  const scentCategories = [
    { id: 'todas', name: 'Todas las notas', emoji: '🌈' },
    { id: 'floral', name: 'Floral', emoji: '🌸' },
    { id: 'citrico', name: 'Cítrico', emoji: '🍊' },
    { id: 'amaderado', name: 'Amaderado', emoji: '🌲' },
    { id: 'oriental', name: 'Oriental', emoji: '🌙' },
    { id: 'fresco', name: 'Fresco', emoji: '🌊' }
  ];

  const intensities = [
    { id: 'todas', name: 'Todas' },
    { id: 'suave', name: 'Suave' },
    { id: 'moderado', name: 'Moderado' },
    { id: 'intenso', name: 'Intenso' }
  ];

  const seasons = [
    { id: 'todas', name: 'Todas', emoji: '🌎' },
    { id: 'primavera', name: 'Primavera', emoji: '🌸' },
    { id: 'verano', name: 'Verano', emoji: '☀️' },
    { id: 'otoño', name: 'Otoño', emoji: '🍂' },
    { id: 'invierno', name: 'Invierno', emoji: '❄️' }
  ];

  // Función para aplicar filtros avanzados
  const filteredPerfumes = useMemo(() => {
    return publishedPerfumes.filter(perfume => {
      // Filtro de búsqueda básica
      const matchesSearch = searchTerm === '' ||
        perfume.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        perfume.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        perfume.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        perfume.notes.some(note => note.toLowerCase().includes(searchTerm.toLowerCase()));

      // Filtro de precio
      const matchesPrice = 
        perfume.price >= advancedFilters.priceRange[0] && 
        perfume.price <= advancedFilters.priceRange[1];

      // Filtro de categoría de aroma
      const matchesScent = advancedFilters.scentCategory === 'todas' ||
        perfume.notes.some(note => 
          note.toLowerCase().includes(advancedFilters.scentCategory.toLowerCase())
        );

      // Filtro de stock
      const matchesStock = !advancedFilters.inStock || perfume.stock > 0;

      return matchesSearch && matchesPrice && matchesScent && matchesStock;
    });
  }, [publishedPerfumes, searchTerm, advancedFilters]);

  // Contador de filtros activos
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (advancedFilters.priceRange[0] > 0 || advancedFilters.priceRange[1] < 300) count++;
    if (advancedFilters.scentCategory !== 'todas') count++;
    if (advancedFilters.intensity !== 'todas') count++;
    if (advancedFilters.season !== 'todas') count++;
    if (advancedFilters.inStock) count++;
    return count;
  }, [advancedFilters]);

  // Limpiar todos los filtros
  const clearAllFilters = useCallback(() => {
    setSearchTerm('');
    setAdvancedFilters({
      scentCategory: 'todas',
      intensity: 'todas',
      season: 'todas',
      priceRange: [0, 300],
      inStock: false
    });
  }, []);

  // Actualizar un filtro específico
  const updateFilter = useCallback((key: keyof AdvancedFilters, value: any) => {
    setAdvancedFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const gridClasses: { [key: number]: string } = {
    1: 'grid-cols-1',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-50/50 to-white">
      {/* Hero Section */}
      <section className="relative h-[70vh] w-full text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-purple-900/80 z-10" />
        <Image
          src="https://images.unsplash.com/photo-1547887537-6158d64c35b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
          alt="Elegante botella de perfume sobre un fondo lujoso"
          fill
          className="object-cover scale-105"
          priority
        />
        <div className="relative z-20 flex h-full flex-col items-center justify-center text-center px-4">
          <div className="max-w-4xl space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-4">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Colección Exclusiva 2025</span>
            </div>
            <h1 className="font-headline text-6xl md:text-8xl font-light tracking-tight">
              Scenta Lux
            </h1>
            <p className="text-xl md:text-2xl text-white/90 font-light max-w-2xl mx-auto leading-relaxed">
              Descubre tu firma olfativa en nuestra curada colección de perfumes de lujo
            </p>
            <div className="flex gap-4 justify-center pt-6">
              <Button asChild size="lg" className="bg-white text-slate-900 hover:bg-white/90 h-14 px-8 font-semibold">
                <Link href="#perfumes">
                  Explorar Colección
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-black text-white border border-white hover:bg-transparent font-bold h-14 px-8 transition-all duration-300">
                <Link href="#recommendations" className="flex items-center justify-center">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Descubrir Mi Fragancia
                </Link>
              </Button>

            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section id="perfumes" className="w-full py-16 md:py-24">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h2 className="font-headline text-5xl font-light text-slate-900 mb-6">
              Nuestra Colección
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Explora nuestra exclusiva selección de fragancias cuidadosamente curadas
            </p>
          </div>

          {/* Advanced Search & Filters */}
          <div className="mb-12 space-y-6">
            {/* Main Search Bar */}
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 transition-colors group-focus-within:text-primary" />
              <Input
                type="search"
                placeholder="Buscar por nombre, marca, descripción, notas olfativas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-16 text-lg pl-12 pr-12 border-2 border-slate-200 focus:border-primary transition-all duration-300 rounded-2xl shadow-sm hover:shadow-md"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-10 w-10 rounded-full"
                  onClick={() => setSearchTerm('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Filters Panel */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                  {/* Filters Left Section */}
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <div className="flex items-center gap-3">
                      <SlidersHorizontal className="h-5 w-5 text-slate-600" />
                      <span className="font-semibold text-lg text-slate-900">Filtros</span>
                      {activeFilterCount > 0 && (
                        <Badge variant="default" className="animate-pulse">
                          {activeFilterCount} activo{activeFilterCount !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>

                    {/* Quick Filter Tabs */}
                    <Tabs 
                      value={advancedFilters.scentCategory} 
                      onValueChange={(value) => updateFilter('scentCategory', value)}
                      className="w-full sm:w-auto"
                    >
                      <TabsList className="bg-slate-100 p-1 rounded-lg">
                        {scentCategories.map(category => (
                          <TabsTrigger 
                            key={category.id} 
                            value={category.id}
                            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-3"
                          >
                            <span className="mr-2">{category.emoji}</span>
                            {category.name}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </Tabs>
                  </div>

                  {/* Filters Right Section */}
                  <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                    {/* Price Filter Popover */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="h-12 px-4 justify-between min-w-[200px]">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-slate-600" />
                            <span className="text-sm font-medium">
                              ${advancedFilters.priceRange[0]} - ${advancedFilters.priceRange[1]}
                            </span>
                          </div>
                          <Tag className="h-4 w-4 text-slate-400" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-96 p-6" align="end">
                        <div className="space-y-6">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-semibold text-slate-900">Rango de Precio</span>
                              <span className="text-lg font-bold text-primary">
                                ${advancedFilters.priceRange[0]} - ${advancedFilters.priceRange[1]}
                              </span>
                            </div>
                            <Slider
                              value={advancedFilters.priceRange}
                              onValueChange={(value) => updateFilter('priceRange', value)}
                              max={300}
                              step={10}
                              className="w-full"
                            />
                            <div className="flex justify-between text-sm text-slate-500">
                              <span>$0</span>
                              <span>$150</span>
                              <span>$300</span>
                            </div>
                          </div>
                          
                          <Separator />
                          
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { range: [0, 50], label: 'Económico' },
                              { range: [50, 150], label: 'Accesible' },
                              { range: [150, 250], label: 'Premium' },
                              { range: [250, 300], label: 'Lujo' }
                            ].map(({ range, label }) => (
                              <Button 
                                key={label}
                                variant="outline" 
                                size="sm"
                                onClick={() => updateFilter('priceRange', range)}
                                className={cn(
                                  "justify-start",
                                  advancedFilters.priceRange[0] === range[0] && "border-primary bg-primary/5"
                                )}
                              >
                                {label}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>

                    {/* Advanced Filters Toggle */}
                    <Button
                      variant={showAdvancedFilters ? "default" : "outline"}
                      onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                      className="h-12 px-4"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Avanzado
                    </Button>

                    {/* Clear Filters */}
                    {activeFilterCount > 0 && (
                      <Button
                        variant="ghost"
                        onClick={clearAllFilters}
                        className="h-12 px-4 text-slate-600 hover:text-slate-900"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Limpiar
                      </Button>
                    )}
                  </div>
                </div>

                {/* Advanced Filters Expanded */}
                {showAdvancedFilters && (
                  <div className="mt-6 pt-6 border-t border-slate-200 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Intensity Filter */}
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-700">Intensidad</label>
                        <div className="flex flex-wrap gap-2">
                          {intensities.map(intensity => (
                            <Button
                              key={intensity.id}
                              variant={advancedFilters.intensity === intensity.id ? "default" : "outline"}
                              size="sm"
                              onClick={() => updateFilter('intensity', intensity.id)}
                              className="text-xs"
                            >
                              {intensity.name}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Season Filter */}
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-700">Temporada</label>
                        <div className="flex flex-wrap gap-2">
                          {seasons.map(season => (
                            <Button
                              key={season.id}
                              variant={advancedFilters.season === season.id ? "default" : "outline"}
                              size="sm"
                              onClick={() => updateFilter('season', season.id)}
                              className="text-xs"
                            >
                              <span className="mr-1">{season.emoji}</span>
                              {season.name}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Stock Filter */}
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-700">Disponibilidad</label>
                        <div className="flex gap-2">
                          <Button
                            variant={advancedFilters.inStock ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateFilter('inStock', !advancedFilters.inStock)}
                            className="text-xs"
                          >
                            Solo en stock
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results Summary */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="text-sm text-slate-600">
                <span className="font-semibold text-slate-900">{filteredPerfumes.length}</span> de{' '}
                <span className="font-semibold text-slate-900">{publishedPerfumes.length}</span> productos encontrados
                {searchTerm && (
                  <span> para "<span className="font-semibold">{searchTerm}</span>"</span>
                )}
              </div>

              {/* View Controls */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-600">Vista:</span>
                <TooltipProvider>
                  <div className="flex bg-slate-100 rounded-lg p-1">
                    {[
                      { size: 1, label: 'Lista', icon: List },
                      { size: 4, label: 'Grid', icon: Grid },
                      { size: 6, label: 'Compacto', icon: Rows3 },
                    ].map(({ size, label, icon: Icon }) => (
                      <Tooltip key={size}>
                        <TooltipTrigger asChild>
                          <Button
                            variant={gridSize === size ? "default" : "ghost"}
                            size="icon"
                            onClick={() => setGridSize(size)}
                            className="h-8 w-8"
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{label}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </TooltipProvider>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className={cn('grid gap-8', gridClasses[gridSize])}>
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="border-0 shadow-lg rounded-2xl overflow-hidden">
                  <Skeleton className="h-64 w-full rounded-none" />
                  <CardContent className="p-6 space-y-3">
                    <Skeleton className="h-6 w-3/4 rounded" />
                    <Skeleton className="h-4 w-1/2 rounded" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between p-6 pt-0">
                    <Skeleton className="h-6 w-20 rounded" />
                    <Skeleton className="h-10 w-24 rounded-lg" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : filteredPerfumes.length > 0 ? (
            <div className={cn('grid gap-8', gridClasses[gridSize])}>
              {filteredPerfumes.map((perfume) => (
                <PerfumeCard 
                  key={perfume.id} 
                  perfume={perfume} 
                  layout={gridSize === 1 ? 'list' : 'grid'} 
                />
              ))}
            </div>
          ) : (
            <Card className="text-center py-20 border-0 shadow-lg rounded-2xl bg-slate-50/50">
              <CardContent className="space-y-4">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-white shadow-lg flex items-center justify-center">
                  <Search className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="font-headline text-2xl text-slate-900">No se encontraron productos</h3>
                <p className="text-slate-600 max-w-md mx-auto">
                  No hay perfumes que coincidan con tus criterios de búsqueda.
                  Intenta ajustar los filtros o los términos de búsqueda.
                </p>
                {activeFilterCount > 0 && (
                  <Button onClick={clearAllFilters} className="mt-4">
                    <X className="h-4 w-4 mr-2" />
                    Limpiar todos los filtros
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <Recommendations />
    </div>
  );
}