'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, Zap, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { usePerfumes } from '@/context/PerfumeContext';
import Link from 'next/link';

type ScentPreference = 'floral' | 'citrico' | 'amaderado' | 'oriental' | 'fresco';
type Intensity = 'suave' | 'moderado' | 'intenso';
type Duration = 'corto' | 'medio' | 'largo';

interface PerfumeProfile {
  scentPreferences: ScentPreference[];
  intensity: Intensity;
  duration: Duration;
  budget: number;
  occasion: string;
  season: 'primavera' | 'verano' | 'otoño' | 'invierno';
}

interface Recommendation {
  perfumeId: string;
  matchScore: number;
  reasoning: string;
  bestFor: string[];
  notes: string[];
}

// Mapeo de notas de perfumes a categorías
const NOTE_CATEGORIES: Record<ScentPreference, string[]> = {
  floral: ['rosa', 'jazmín', 'lavanda', 'floral', 'flor', 'flores', 'lirio', 'violeta', 'gardenia'],
  citrico: ['limón', 'naranja', 'bergamota', 'cítrico', 'cítricos', 'mandarina', 'pomelo', 'lima'],
  amaderado: ['sándalo', 'cedro', 'pachulí', 'madera', 'amaderado', 'roble', 'vetiver', 'musgo'],
  oriental: ['vainilla', 'ámbar', 'especias', 'oriental', 'canela', 'clavo', 'incienso', 'almizcle'],
  fresco: ['marino', 'verde', 'acuático', 'fresco', 'ozono', 'menta', 'hierbas', 'aloe']
};


const SCENT_DESCRIPTIONS = {
  floral: { emoji: '🌺', name: 'Floral', description: 'Rosas, jazmín, lavanda' },
  citrico: { emoji: '🍊', name: 'Cítrico', description: 'Limón, naranja, bergamota' },
  amaderado: { emoji: '🌲', name: 'Amaderado', description: 'Sándalo, cedro, pachulí' },
  oriental: { emoji: '🌙', name: 'Oriental', description: 'Vainilla, ámbar, especias' },
  fresco: { emoji: '🌊', name: 'Fresco', description: 'Marino, verde, acuático' }
};

const OCCASIONS = [
  { id: 'diario', name: 'Uso Diario', emoji: '🏢' },
  { id: 'noches', name: 'Noches', emoji: '🌙' },
  { id: 'especial', name: 'Ocasiones Especiales', emoji: '🎉' },
  { id: 'romantico', name: 'Citas Románticas', emoji: '💕' },
  { id: 'profesional', name: 'Entorno Profesional', emoji: '💼' }
];

const SEASONS = [
  { id: 'primavera', name: 'Primavera', emoji: '🌸' },
  { id: 'verano', name: 'Verano', emoji: '☀️' },
  { id: 'otoño', name: 'Otoño', emoji: '🍂' },
  { id: 'invierno', name: 'Invierno', emoji: '❄️' }
];

// Función para categorizar las notas del perfume
const categorizeNotes = (notes: string[]): ScentPreference[] => {
  const categories: ScentPreference[] = [];
  
  notes.forEach(note => {
    const lowerNote = note.toLowerCase().trim();
    
    for (const [category, keywords] of Object.entries(NOTE_CATEGORIES)) {
      if (keywords.some(keyword => lowerNote.includes(keyword))) {
        if (!categories.includes(category as ScentPreference)) {
          categories.push(category as ScentPreference);
        }
      }
    }
  });
  
  return categories;
};

// Función para calcular compatibilidad de intensidad
const getIntensityScore = (perfumePrice: number, preferredIntensity: Intensity): number => {
  // Asumimos que perfumes más caros son más intensos/complejos
  const priceIntensity = perfumePrice > 150 ? 'intenso' : perfumePrice > 80 ? 'moderado' : 'suave';
  
  if (priceIntensity === preferredIntensity) return 20;
  if (
    (preferredIntensity === 'moderado' && (priceIntensity === 'suave' || priceIntensity === 'intenso')) ||
    (preferredIntensity === 'suave' && priceIntensity === 'moderado') ||
    (preferredIntensity === 'intenso' && priceIntensity === 'moderado')
  ) return 10;
  
  return 0;
};

// Función para calcular compatibilidad de temporada
const getSeasonScore = (perfumeCategories: ScentPreference[], season: string): number => {
  const seasonalPreferences: Record<string, ScentPreference[]> = {
    primavera: ['floral', 'fresco', 'citrico'],
    verano: ['citrico', 'fresco', 'floral'],
    otoño: ['amaderado', 'oriental', 'floral'],
    invierno: ['oriental', 'amaderado', 'floral']
  };

  const preferredScents = seasonalPreferences[season] || [];
  const matchingScents = perfumeCategories.filter(cat => preferredScents.includes(cat));
  
  return matchingScents.length * 15;
};

export default function PerfumeFinderPage() {
  const { perfumes, publishedPerfumes } = usePerfumes();
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const { toast } = useToast();

  const [profile, setProfile] = useState<PerfumeProfile>({
    scentPreferences: [],
    intensity: 'moderado',
    duration: 'medio',
    budget: 100,
    occasion: 'diario',
    season: 'primavera'
  });

  const toggleScentPreference = (scent: ScentPreference) => {
    setProfile(prev => ({
      ...prev,
      scentPreferences: prev.scentPreferences.includes(scent)
        ? prev.scentPreferences.filter(s => s !== scent)
        : [...prev.scentPreferences, scent]
    }));
  };

  const calculateRecommendations = async () => {
    setLoading(true);
    setRecommendations([]);
    
    try {
      // Simular procesamiento
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (publishedPerfumes.length === 0) {
        toast({
          title: 'No hay perfumes disponibles',
          description: 'Agrega algunos perfumes a tu catálogo primero',
          variant: 'destructive'
        });
        setLoading(false);
        return;
      }

      const scoredPerfumes = publishedPerfumes
        .filter(perfume => perfume.price <= profile.budget)
        .map(perfume => {
          let score = 0;
          const reasoningParts: string[] = [];
          const bestFor: string[] = [];

          // 1. Categorizar las notas del perfume
          const perfumeCategories = categorizeNotes(perfume.notes);
          
          // 2. Matching de preferencias de aroma (40 puntos máximo)
          const matchingPreferences = profile.scentPreferences.filter(pref => 
            perfumeCategories.includes(pref)
          );
          
          if (matchingPreferences.length > 0) {
            const preferenceScore = matchingPreferences.length * 10;
            score += preferenceScore;
            reasoningParts.push(`Coincide con ${matchingPreferences.length} de tus preferencias de aroma`);
          }

          // 3. Matching de intensidad (20 puntos)
          const intensityScore = getIntensityScore(perfume.price, profile.intensity);
          score += intensityScore;
          if (intensityScore > 0) {
            reasoningParts.push(`Intensidad adecuada para tu preferencia`);
          }

          // 4. Matching de temporada (15 puntos)
          const seasonScore = getSeasonScore(perfumeCategories, profile.season);
          score += seasonScore;
          if (seasonScore > 0) {
            reasoningParts.push(`Ideal para la temporada de ${profile.season}`);
          }

          // 5. Matching por ocasión (25 puntos)
          let occasionScore = 0;
          switch (profile.occasion) {
            case 'diario':
              if (perfume.price <= 80) {
                occasionScore = 20;
                bestFor.push('Uso diario');
                reasoningParts.push('Perfecto para uso cotidiano');
              }
              break;
            case 'especial':
              if (perfume.price >= 100) {
                occasionScore = 20;
                bestFor.push('Ocasiones especiales');
                reasoningParts.push('Ideal para eventos especiales');
              }
              break;
            case 'profesional':
              occasionScore = 15;
              bestFor.push('Entorno profesional');
              reasoningParts.push('Adecuado para el ámbito laboral');
              break;
            case 'romantico':
              if (perfumeCategories.includes('floral') || perfumeCategories.includes('oriental')) {
                occasionScore = 20;
                bestFor.push('Citas románticas');
                reasoningParts.push('Perfecto para momentos románticos');
              }
              break;
            case 'noches':
              if (perfumeCategories.includes('oriental') || perfumeCategories.includes('amaderado')) {
                occasionScore = 15;
                bestFor.push('Salidas nocturnas');
                reasoningParts.push('Ideal para la noche');
              }
              break;
          }
          score += occasionScore;

          // 6. Bonus por duración (basado en categorías complejas)
          if (profile.duration === 'largo' && 
              (perfumeCategories.includes('oriental') || perfumeCategories.includes('amaderado'))) {
            score += 10;
            reasoningParts.push('Duración prolongada como buscabas');
          }

          // Convertir reasoning a string
          const reasoning = reasoningParts.length > 0 
            ? reasoningParts.join('. ') + '.'
            : 'Buena opción basada en tus preferencias generales.';

          return {
            perfumeId: perfume.id,
            matchScore: Math.min(Math.max(score, 0), 100), // Asegurar entre 0-100
            reasoning,
            bestFor: bestFor.length > 0 ? bestFor : ['Múltiples usos'],
            notes: perfume.notes
          };
        })
        .filter(rec => rec.matchScore >= 40) // Solo mostrar matches significativos
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 6); // Máximo 6 recomendaciones

      setRecommendations(scoredPerfumes);
      
      if (scoredPerfumes.length === 0) {
        toast({
          title: 'No encontramos coincidencias perfectas',
          description: 'Intenta ajustar tus preferencias o aumentar tu presupuesto',
          variant: 'destructive'
        });
      } else {
        toast({
          title: '¡Recomendaciones encontradas!',
          description: `Encontramos ${scoredPerfumes.length} perfumes que se adaptan a tu estilo`
        });
      }
    } catch (error) {
      console.error('Error calculating recommendations:', error);
      toast({
        title: 'Error',
        description: 'Ocurrió un error al calcular las recomendaciones',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getPerfumeById = (id: string) => {
    return perfumes.find(p => p.id === id);
  };

  const getIntensityIcon = (intensity: Intensity) => {
    switch (intensity) {
      case 'suave': return '🌸';
      case 'moderado': return '💫';
      case 'intenso': return '🔥';
    }
  };

  const getDurationIcon = (duration: Duration) => {
    switch (duration) {
      case 'corto': return '⏱️';
      case 'medio': return '🕒';
      case 'largo': return '🕰️';
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
         
          <h1 className="font-headline text-5xl text-gray-800">
            Perfume Finder
          </h1>
         
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Descubre tu fragancia perfecta mediante nuestro sistema de matching inteligente
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Panel de Configuración */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Preferencias de Aroma
              </CardTitle>
              <CardDescription>
                Selecciona los tipos de aromas que más te gustan (puedes elegir varios)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(Object.entries(SCENT_DESCRIPTIONS) as [ScentPreference, any][]).map(([key, scent]) => (
                  <Button
                    key={key}
                    variant={profile.scentPreferences.includes(key) ? "default" : "outline"}
                    onClick={() => toggleScentPreference(key)}
                    className="h-20 flex flex-col gap-2 relative"
                  >
                    <span className="text-2xl">{scent.emoji}</span>
                    <span className="text-xs font-medium">{scent.name}</span>
                    {profile.scentPreferences.includes(key) && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Intensidad</CardTitle>
                <CardDescription>¿Qué tan pronunciado prefieres el aroma?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  {(['suave', 'moderado', 'intenso'] as Intensity[]).map(intensity => (
                    <Button
                      key={intensity}
                      variant={profile.intensity === intensity ? "default" : "outline"}
                      onClick={() => setProfile(prev => ({ ...prev, intensity }))}
                      className="flex-1 flex-col h-16"
                    >
                      <span className="text-lg">{getIntensityIcon(intensity)}</span>
                      <span className="text-xs">{intensity}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Duración</CardTitle>
                <CardDescription>¿Cuánto tiempo quieres que dure el aroma?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  {(['corto', 'medio', 'largo'] as Duration[]).map(duration => (
                    <Button
                      key={duration}
                      variant={profile.duration === duration ? "default" : "outline"}
                      onClick={() => setProfile(prev => ({ ...prev, duration }))}
                      className="flex-1 flex-col h-16"
                    >
                      <span className="text-lg">{getDurationIcon(duration)}</span>
                      <span className="text-xs">{duration}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Presupuesto</CardTitle>
              <CardDescription>
                Establece tu rango de precio preferido (${profile.budget})
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Slider
                  value={[profile.budget]}
                  onValueChange={([value]) => setProfile(prev => ({ ...prev, budget: value }))}
                  max={300}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>$0</span>
                  <span className="text-lg font-bold text-primary">${profile.budget}</span>
                  <span>$300</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Ocasión Principal</CardTitle>
                <CardDescription>¿Para qué momento buscas el perfume?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {OCCASIONS.map(occasion => (
                    <Button
                      key={occasion.id}
                      variant={profile.occasion === occasion.id ? "default" : "outline"}
                      onClick={() => setProfile(prev => ({ ...prev, occasion: occasion.id }))}
                      className="h-14 flex flex-col gap-1"
                    >
                      <span className="text-lg">{occasion.emoji}</span>
                      <span className="text-xs">{occasion.name}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Temporada</CardTitle>
                <CardDescription>¿Para qué temporada buscas el perfume?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {SEASONS.map(season => (
                    <Button
                      key={season.id}
                      variant={profile.season === season.id ? "default" : "outline"}
                      onClick={() => setProfile(prev => ({ ...prev, season: season.id as any }))}
                      className="h-14 flex flex-col gap-1"
                    >
                      <span className="text-lg">{season.emoji}</span>
                      <span className="text-xs">{season.name}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Button 
            size="lg" 
            onClick={calculateRecommendations} 
            disabled={loading || profile.scentPreferences.length === 0}
            className="w-full h-14 text-lg bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
          >
            {loading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-5 w-5" />
            )}
            {loading ? 'Analizando tu estilo...' : 'Encontrar Mi Fragancia'}
          </Button>
        </div>

        {/* Panel de Resultados */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Tu Perfil de Fragancia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Preferencias seleccionadas:</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.scentPreferences.map(pref => (
                    <Badge key={pref} variant="secondary" className="text-xs">
                      {SCENT_DESCRIPTIONS[pref].emoji} {SCENT_DESCRIPTIONS[pref].name}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-xs">Intensidad:</Label>
                  <div className="font-medium text-sm">{getIntensityIcon(profile.intensity)} {profile.intensity}</div>
                </div>
                <div>
                  <Label className="text-xs">Duración:</Label>
                  <div className="font-medium text-sm">{getDurationIcon(profile.duration)} {profile.duration}</div>
                </div>
                <div>
                  <Label className="text-xs">Presupuesto:</Label>
                  <div className="font-medium text-sm">${profile.budget}</div>
                </div>
                <div>
                  <Label className="text-xs">Ocasión:</Label>
                  <div className="font-medium text-sm">
                    {OCCASIONS.find(o => o.id === profile.occasion)?.emoji} {OCCASIONS.find(o => o.id === profile.occasion)?.name}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  Recomendaciones ({recommendations.length})
                </CardTitle>
                <CardDescription>
                  Ordenadas por compatibilidad con tu perfil
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recommendations.map((rec) => {
                  const perfume = getPerfumeById(rec.perfumeId);
                  if (!perfume) return null;

                  return (
                    <div key={rec.perfumeId} className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow bg-white">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden border">
                            <img 
                              src={perfume.imageUrl} 
                              alt={perfume.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <Link href={`/perfume/${perfume.id}`}>
                              <h4 className="font-semibold hover:text-primary transition-colors cursor-pointer">
                                {perfume.name}
                              </h4>
                            </Link>
                            <p className="text-sm text-muted-foreground">{perfume.brand}</p>
                          </div>
                        </div>
                        <Badge variant="default" className="text-xs">
                          {rec.matchScore}% match
                        </Badge>
                      </div>
                      
                      <Progress value={rec.matchScore} className="h-2" />
                      
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1">
                          {rec.bestFor.map(use => (
                            <Badge key={use} variant="outline" className="text-xs">
                              {use}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          <strong>Notas:</strong> {perfume.notes.join(', ')}
                        </div>

                        <div className="text-xs text-primary bg-primary/10 p-2 rounded">
                          {rec.reasoning}
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-lg">${perfume.price}</span>
                          <span className={`text-sm ${perfume.stock < 10 ? 'text-orange-600' : 'text-muted-foreground'}`}>
                            {perfume.stock} en stock
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}