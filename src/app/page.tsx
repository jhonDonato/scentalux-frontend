'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  List, 
  Grid, 
  Rows3, 
  Search, 
  X, 
  Filter, 
  DollarSign,
  SlidersHorizontal,
  Sparkles,
  Tag,
  Star,
  ChevronDown,
  Play,
  Pause,
  Shield,
  Truck,
  Leaf,
  Award,
  Globe,
  Clock,
  Users,
  Heart
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
import { Switch } from '@/components/ui/switch';

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
  onSale: boolean;
  featured: boolean;
}

// Componente para animación de conteo
const Counter = ({ end, duration = 2000 }: { end: number; duration?: number }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const increment = end / (duration / 16);
          const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
        }
      },
      { threshold: 0.1 }
    );

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => {
      if (countRef.current) {
        observer.unobserve(countRef.current);
      }
    };
  }, [end, duration]);

  return <span ref={countRef}>{count}+</span>;
};

export default function Home() {
  const { publishedPerfumes, loading } = usePerfumes();
  const [searchTerm, setSearchTerm] = useState('');
  const [gridSize, setGridSize] = useState(4);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [currentHeroImage, setCurrentHeroImage] = useState(0);
  
  // Estado para filtros avanzados
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    scentCategory: 'todas',
    intensity: 'todas',
    season: 'todas',
    priceRange: [0, 300],
    inStock: false,
    onSale: false,
    featured: false
  });

  // Imágenes para el carrusel hero
  const heroImages = [
    {
      url: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      title: "Colección Exclusiva",
      subtitle: "Fragancias únicas para momentos inolvidables"
    },
    {
      url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80",
      title: "Arte en Cada Esencia",
      subtitle: "Perfumes creados con los mejores ingredientes"
    },
    {
      url: "https://images.unsplash.com/photo-1615634260167-046c5c6d6e4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      title: "Lujo y Elegancia",
      subtitle: "Descubre tu firma olfativa perfecta"
    }
  ];

  // Efecto para carrusel automático
  useEffect(() => {
    if (!autoRotate) return;

    const interval = setInterval(() => {
      setCurrentHeroImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRotate, heroImages.length]);

  // Categorías de aroma para filtros
  const scentCategories = [
    { id: 'todas', name: 'Todas las notas', emoji: '🌈', color: 'from-gray-400 to-gray-600' },
    { id: 'floral', name: 'Floral', emoji: '🌸', color: 'from-pink-400 to-pink-600' },
    { id: 'citrico', name: 'Cítrico', emoji: '🍊', color: 'from-orange-400 to-orange-600' },
    { id: 'amaderado', name: 'Amaderado', emoji: '🌲', color: 'from-amber-600 to-amber-800' },
    { id: 'oriental', name: 'Oriental', emoji: '🌙', color: 'from-purple-500 to-purple-700' },
    { id: 'fresco', name: 'Fresco', emoji: '🌊', color: 'from-cyan-400 to-cyan-600' }
  ];

  const intensities = [
    { id: 'todas', name: 'Todas', icon: '●' },
    { id: 'suave', name: 'Suave', icon: '○' },
    { id: 'moderado', name: 'Moderado', icon: '◎' },
    { id: 'intenso', name: 'Intenso', icon: '●' }
  ];

  const seasons = [
    { id: 'todas', name: 'Todas', emoji: '🌎', color: 'from-blue-400 to-blue-600' },
    { id: 'primavera', name: 'Primavera', emoji: '🌸', color: 'from-green-400 to-green-600' },
    { id: 'verano', name: 'Verano', emoji: '☀️', color: 'from-yellow-400 to-yellow-600' },
    { id: 'otoño', name: 'Otoño', emoji: '🍂', color: 'from-orange-500 to-orange-700' },
    { id: 'invierno', name: 'Invierno', emoji: '❄️', color: 'from-blue-300 to-blue-500' }
  ];

  // Estadísticas reales para tu negocio
  const stats = [
    { 
      icon: Award, 
      number: 50, 
      label: 'Perfumes Premium',
      description: 'Selección de alta calidad'
    },
    { 
      icon: Globe, 
      number: 20, 
      label: 'Marcas Importadas',
      description: 'De todo el mundo'
    },
    { 
      icon: Clock, 
      number: 24, 
      label: 'Respuesta Rápida',
      description: 'Horas de atención'
    },
    { 
      icon: Users, 
      number: 500, 
      label: 'Clientes Satisfechos',
      description: 'Confían en nosotros'
    }
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

      // Filtro de ofertas
      const matchesSale = !advancedFilters.onSale || 
        perfume.price < 100 ||
        ['Zara', 'Bershka', 'Pull&Bear'].includes(perfume.brand);

      // Filtro de destacados
      const matchesFeatured = !advancedFilters.featured || 
        perfume.price > 150 ||
        ['Chanel', 'Dior', 'Tom Ford', 'Creed'].includes(perfume.brand) ||
        perfume.stock < 20;

      return matchesSearch && matchesPrice && matchesScent && matchesStock && matchesSale && matchesFeatured;
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
    if (advancedFilters.onSale) count++;
    if (advancedFilters.featured) count++;
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
      inStock: false,
      onSale: false,
      featured: false
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
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 overflow-x-hidden">
      {/* Hero Section con Carrusel */}
      <section className="relative h-screen w-full text-white overflow-hidden">
        {/* Imágenes del carrusel */}
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000 ease-in-out",
              index === currentHeroImage ? "opacity-100" : "opacity-0"
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-purple-900/80 z-10" />
            <Image
              src={image.url}
              alt={image.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        ))}
        
        {/* Controles del carrusel */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setAutoRotate(!autoRotate)}
            className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30"
          >
            {autoRotate ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          
          <div className="flex gap-2">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentHeroImage(index)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  index === currentHeroImage ? "w-8 bg-white" : "w-2 bg-white/50"
                )}
              />
            ))}
          </div>
        </div>

        {/* Contenido principal del hero */}
        <div className="relative z-20 flex h-full flex-col items-center justify-center text-center px-4">
          <div className="max-w-6xl space-y-8">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 mb-6">
              <Sparkles className="h-5 w-5" />
              <span className="text-lg font-semibold">Lanzamiento Oficial 2024</span>
              <div className="w-2 h-2 rounded-full bg-green-400" />
            </div>
            
            <h1 className="font-headline text-7xl md:text-9xl font-light tracking-tighter bg-gradient-to-b from-white to-white/80 bg-clip-text text-transparent">
              Scenta Lux
            </h1>
            
            <p className="text-2xl md:text-3xl text-white/90 font-light max-w-4xl mx-auto leading-relaxed">
              {heroImages[currentHeroImage].subtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 justify-center pt-8">
              <Button asChild size="lg" className="h-16 px-12 text-lg font-semibold bg-gradient-to-r from-white to-slate-100 text-slate-900 hover:from-slate-100 hover:to-white shadow-2xl rounded-2xl">
                <Link href="#perfumes">
                  Explorar Colección
                </Link>
              </Button>
              <Button asChild size="lg" className="h-16 px-12 text-lg font-semibold bg-gradient-to-r from-transparent to-white/10 border-2 border-white text-white hover:bg-white/20 backdrop-blur-sm rounded-2xl">
                <Link href="#recommendations" className="flex items-center justify-center">
                  <Sparkles className="w-5 h-5 mr-3" />
                  Descubrir Mi Fragancia
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 right-8 z-30">
          <div className="flex flex-col items-center gap-2 text-white/70">
            <span className="text-sm font-medium rotate-90 translate-y-10">Scroll</span>
            <ChevronDown className="h-6 w-6 rotate-90" />
          </div>
        </div>
      </section>

      {/* Stats Section con animación */}
      <section className="relative py-20 bg-white/80 backdrop-blur-sm border-y border-slate-200/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="font-headline text-4xl font-light text-slate-900 mb-4">
              Por Qué Elegirnos
            </h3>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Comprometidos con la excelencia en cada detalle
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={stat.label} 
                className="text-center group hover:transform hover:scale-105 transition-all duration-300"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <stat.icon className="h-10 w-10 text-white" />
                </div>
                <div className="text-4xl font-bold text-slate-900 mb-2 font-mono">
                  <Counter end={stat.number} duration={2500} />
                </div>
                <div className="text-lg font-semibold text-slate-800 mb-2">{stat.label}</div>
                <div className="text-slate-600 text-sm leading-relaxed">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section id="perfumes" className="w-full py-20 md:py-28 relative">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-100/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Header Section */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg mb-8">
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
              <span className="text-lg font-semibold text-slate-900">Colección Premium</span>
            </div>
            <h2 className="font-headline text-6xl font-light text-slate-900 mb-8 bg-gradient-to-b from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Nuestra Colección
            </h2>
            <p className="text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-light">
              Descubre fragancias exclusivas creadas con los más altos estándares de calidad y elegancia
            </p>
          </div>

          {/* Advanced Search & Filters */}
          <div className="mb-16 space-y-8">
            {/* Main Search Bar */}
            <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-gradient-to-r from-white to-slate-50/50 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="relative group">
                  <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-slate-400 h-6 w-6 transition-colors group-focus-within:text-primary" />
                  <Input
                    type="search"
                    placeholder="Buscar por nombre, marca, descripción, notas olfativas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-20 text-xl pl-16 pr-16 border-2 border-slate-100 focus:border-primary/30 focus:ring-4 focus:ring-primary/10 transition-all duration-300 rounded-2xl shadow-lg"
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 h-12 w-12 rounded-xl bg-slate-100 hover:bg-slate-200"
                      onClick={() => setSearchTerm('')}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Filters Panel */}
            <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
                  {/* Filters Left Section */}
                  <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-purple-600 shadow-lg">
                        <SlidersHorizontal className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <span className="font-bold text-2xl text-slate-900 block">Filtros Avanzados</span>
                        <span className="text-slate-500 text-sm">Encuentra tu fragancia perfecta</span>
                      </div>
                      {activeFilterCount > 0 && (
                        <Badge className="ml-4 px-3 py-1 text-sm bg-gradient-to-r from-green-500 to-emerald-600">
                          {activeFilterCount} filtro{activeFilterCount !== 1 ? 's' : ''} activo{activeFilterCount !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Filters Right Section */}
                  <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                    {/* Price Filter Popover */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="h-14 px-6 justify-between min-w-[220px] rounded-xl border-2 border-slate-200 hover:border-primary/30 bg-white shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-100">
                              <DollarSign className="h-4 w-4 text-green-600" />
                            </div>
                            <span className="text-base font-semibold">
                              ${advancedFilters.priceRange[0]} - ${advancedFilters.priceRange[1]}
                            </span>
                          </div>
                          <Tag className="h-4 w-4 text-slate-400" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-96 p-6 rounded-2xl shadow-2xl border-0 bg-white/95 backdrop-blur-sm" align="end">
                        <div className="space-y-6">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-semibold text-slate-900">Rango de Precio</span>
                              <span className="text-lg font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
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
                              { range: [0, 50], label: 'Económico', color: 'from-green-400 to-green-600' },
                              { range: [50, 150], label: 'Accesible', color: 'from-blue-400 to-blue-600' },
                              { range: [150, 250], label: 'Premium', color: 'from-purple-500 to-purple-700' },
                              { range: [250, 300], label: 'Lujo', color: 'from-amber-500 to-amber-700' }
                            ].map(({ range, label, color }) => (
                              <Button 
                                key={label}
                                variant="outline" 
                                size="sm"
                                onClick={() => updateFilter('priceRange', range)}
                                className={cn(
                                  "justify-start rounded-lg border-2 transition-all duration-300",
                                  advancedFilters.priceRange[0] === range[0] 
                                    ? `border-transparent bg-gradient-to-r ${color} text-white shadow-lg`
                                    : "border-slate-200 hover:border-slate-300"
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
                      className="h-14 px-6 rounded-xl border-2 shadow-sm"
                    >
                      <Filter className="h-5 w-5 mr-3" />
                      <span className="font-semibold">Filtros Avanzados</span>
                    </Button>

                    {/* Clear Filters */}
                    {activeFilterCount > 0 && (
                      <Button
                        variant="ghost"
                        onClick={clearAllFilters}
                        className="h-14 px-6 text-slate-600 hover:text-slate-900 rounded-xl font-semibold"
                      >
                        <X className="h-5 w-5 mr-2" />
                        Limpiar Filtros
                      </Button>
                    )}
                  </div>
                </div>

                {/* Advanced Filters Expanded */}
                {showAdvancedFilters && (
                  <div className="mt-8 pt-8 border-t border-slate-200/50 space-y-8">
                    {/* Scent Categories */}
                    <div className="space-y-4">
                      <label className="text-lg font-bold text-slate-900">Categorías de Aroma</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {scentCategories.map(category => (
                          <Button
                            key={category.id}
                            variant={advancedFilters.scentCategory === category.id ? "default" : "outline"}
                            size="lg"
                            onClick={() => updateFilter('scentCategory', category.id)}
                            className={cn(
                              "h-16 rounded-xl border-2 transition-all duration-300 font-semibold",
                              advancedFilters.scentCategory === category.id 
                                ? `border-transparent bg-gradient-to-r ${category.color} text-white shadow-lg`
                                : "border-slate-200 hover:border-slate-300 bg-white"
                            )}
                          >
                            <span className="text-lg mr-2">{category.emoji}</span>
                            {category.name}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {/* Intensity Filter */}
                      <div className="space-y-4">
                        <label className="text-lg font-bold text-slate-900">Intensidad</label>
                        <div className="flex flex-col gap-3">
                          {intensities.map(intensity => (
                            <Button
                              key={intensity.id}
                              variant={advancedFilters.intensity === intensity.id ? "default" : "outline"}
                              size="lg"
                              onClick={() => updateFilter('intensity', intensity.id)}
                              className="justify-start h-14 rounded-xl border-2 font-semibold"
                            >
                              <span className="text-lg mr-3">{intensity.icon}</span>
                              {intensity.name}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Season Filter */}
                      <div className="space-y-4">
                        <label className="text-lg font-bold text-slate-900">Temporada</label>
                        <div className="grid grid-cols-2 gap-3">
                          {seasons.map(season => (
                            <Button
                              key={season.id}
                              variant={advancedFilters.season === season.id ? "default" : "outline"}
                              size="lg"
                              onClick={() => updateFilter('season', season.id)}
                              className={cn(
                                "h-14 rounded-xl border-2 transition-all duration-300 font-semibold",
                                advancedFilters.season === season.id 
                                  ? `border-transparent bg-gradient-to-r ${season.color} text-white shadow-lg`
                                  : "border-slate-200 hover:border-slate-300"
                              )}
                            >
                              <span className="text-lg mr-2">{season.emoji}</span>
                              {season.name}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Additional Filters */}
                      <div className="space-y-6">
                        <label className="text-lg font-bold text-slate-900">Opciones Adicionales</label>
                        <div className="space-y-4">
                          {[
                            { key: 'inStock' as const, label: 'Solo en stock', icon: Shield },
                            { key: 'onSale' as const, label: 'En oferta', icon: Tag },
                            { key: 'featured' as const, label: 'Destacados', icon: Star }
                          ].map(({ key, label, icon: Icon }) => (
                            <div key={key} className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-200 bg-white">
                              <div className="flex items-center gap-3">
                                <Icon className="h-5 w-5 text-slate-600" />
                                <span className="font-semibold text-slate-700">{label}</span>
                              </div>
                              <Switch
                                checked={advancedFilters[key]}
                                onCheckedChange={(checked) => updateFilter(key, checked)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results Summary */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div className="text-lg text-slate-600">
                Mostrando <span className="font-bold text-slate-900">{filteredPerfumes.length}</span> de{' '}
                <span className="font-bold text-slate-900">{publishedPerfumes.length}</span> productos
                {searchTerm && (
                  <span> para "<span className="font-bold text-primary">{searchTerm}</span>"</span>
                )}
              </div>

              {/* View Controls */}
              <div className="flex items-center gap-4">
                <span className="text-lg font-semibold text-slate-600">Vista:</span>
                <TooltipProvider>
                  <div className="flex bg-slate-100 rounded-xl p-2 shadow-inner">
                    {[
                      { size: 1, label: 'Vista Lista', icon: List },
                      { size: 4, label: 'Vista Grid', icon: Grid },
                      { size: 6, label: 'Vista Compacta', icon: Rows3 },
                    ].map(({ size, label, icon: Icon }) => (
                      <Tooltip key={size}>
                        <TooltipTrigger asChild>
                          <Button
                            variant={gridSize === size ? "default" : "ghost"}
                            size="icon"
                            onClick={() => setGridSize(size)}
                            className={cn(
                              "h-10 w-10 rounded-lg transition-all duration-300",
                              gridSize === size && "bg-white shadow-lg"
                            )}
                          >
                            <Icon className="h-4 w-4" />
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
                <Card key={i} className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-white/80 backdrop-blur-sm">
                  <Skeleton className="h-80 w-full rounded-none bg-gradient-to-r from-slate-200 to-slate-300" />
                  <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-7 w-3/4 rounded-lg bg-slate-300" />
                    <Skeleton className="h-5 w-1/2 rounded-lg bg-slate-300" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-20 rounded-full bg-slate-300" />
                      <Skeleton className="h-6 w-16 rounded-full bg-slate-300" />
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between p-6 pt-0">
                    <Skeleton className="h-7 w-24 rounded-lg bg-slate-300" />
                    <Skeleton className="h-11 w-28 rounded-xl bg-slate-300" />
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
            <Card className="text-center py-24 border-0 shadow-2xl rounded-3xl bg-gradient-to-br from-white to-slate-50/50 backdrop-blur-sm">
              <CardContent className="space-y-6">
                <div className="w-24 h-24 mx-auto rounded-3xl bg-white shadow-2xl flex items-center justify-center">
                  <Search className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="font-headline text-3xl text-slate-900">No se encontraron productos</h3>
                <p className="text-slate-600 text-lg max-w-md mx-auto leading-relaxed">
                  No hay perfumes que coincidan con tus criterios de búsqueda.
                  Intenta ajustar los filtros o los términos de búsqueda.
                </p>
                {activeFilterCount > 0 && (
                  <Button 
                    onClick={clearAllFilters} 
                    size="lg"
                    className="mt-6 h-12 px-8 rounded-xl bg-gradient-to-r from-primary to-purple-600 shadow-lg"
                  >
                    <X className="h-5 w-5 mr-3" />
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