'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import type { Perfume } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:9090';

export type PerfumeWithStatus = Perfume & { published: boolean; createdAt: string };

export interface SalesData {
  id: string;
  perfumeId: string;
  perfumeName: string;
  quantity: number;
  total: number;
  date: string;
  customerEmail?: string;
}

export interface Statistics {
  totalRevenue: number;
  totalProducts: number;
  publishedProducts: number;
  lowStockProducts: number;
  categoryDistribution: { category: string; count: number }[];
  priceRangeDistribution: { range: string; count: number }[];
  recentSales: SalesData[];
}

interface PerfumeContextType {
  perfumes: PerfumeWithStatus[];
  publishedPerfumes: PerfumeWithStatus[];
  statistics: Statistics;
  addPerfume: (newPerfume: Omit<Perfume, 'id' | 'imageUrl'> & { imageUrl?: string }) => Promise<void>;
  deletePerfume: (id: string) => Promise<void>;
  togglePublishStatus: (id: string) => Promise<void>;
  updateStock: (id: string, quantitySold: number) => Promise<void>;
  getPerfumeById: (id: string) => PerfumeWithStatus | undefined;
  recordSale: (saleData: Omit<SalesData, 'id' | 'date'>) => Promise<void>;
  loading: boolean;
  refreshPerfumes: () => Promise<void>;
}

const PerfumeContext = createContext<PerfumeContextType | undefined>(undefined);

export const PerfumeProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [perfumes, setPerfumes] = useState<PerfumeWithStatus[]>([]);
  const [sales, setSales] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);

  // Calcular perfumes publicados
  const publishedPerfumes = useMemo(() => 
    perfumes.filter(perfume => perfume.published), 
    [perfumes]
  );

  // Calcular estadísticas en tiempo real
  const statistics = useMemo((): Statistics => {
    const totalProducts = perfumes.length;
    const publishedProducts = publishedPerfumes.length;
    const lowStockProducts = perfumes.filter(p => p.stock < 10).length;
    
    // Distribución por categoría
    const categoryDistribution = ['Para Ella', 'Para Él', 'Unisex'].map(category => ({
      category,
      count: publishedPerfumes.filter(p => p.category === category).length
    }));

    // Distribución por rango de precios
    const priceRanges = [
      { range: '$0 - $50', min: 0, max: 50 },
      { range: '$50 - $100', min: 50, max: 100 },
      { range: '$100 - $200', min: 100, max: 200 },
      { range: '$200+', min: 200, max: Infinity }
    ];

    const priceRangeDistribution = priceRanges.map(range => ({
      range: range.range,
      count: publishedPerfumes.filter(p => p.price >= range.min && p.price < range.max).length
    }));

    // Calcular ingresos totales basados en ventas registradas
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);

    return {
      totalRevenue,
      totalProducts,
      publishedProducts,
      lowStockProducts,
      categoryDistribution,
      priceRangeDistribution,
      recentSales: sales.slice(-5).reverse() // Últimas 5 ventas, más recientes primero
    };
  }, [perfumes, publishedPerfumes, sales]);

  // Función para obtener perfumes
  const fetchPerfumes = useCallback(async () => {
    setLoading(true);
    try {
      console.log('🔄 Fetching perfumes from backend...');
      const response = await fetch(`${API_BASE_URL}/perfumes`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const perfumesList: PerfumeWithStatus[] = await response.json();
      console.log('✅ Perfumes loaded:', perfumesList.length);
      
      // Asegurarse de que todos los perfumes tengan el campo published
      const perfumesWithPublished = perfumesList.map(perfume => ({
        ...perfume,
        published: perfume.published !== undefined ? perfume.published : true
      }));
      
      setPerfumes(perfumesWithPublished);
    } catch (error) {
      console.error("❌ Error fetching perfumes: ", error);
      toast({ 
        title: 'Error de Conexión', 
        description: 'No se pudo conectar con el servidor para cargar los perfumes.', 
        variant: 'destructive' 
      });
      setPerfumes([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPerfumes();
  }, [fetchPerfumes]);

  // Agregar nuevo perfume
  const addPerfume = async (newPerfumeData: Omit<Perfume, 'id' | 'imageUrl'> & { imageUrl?: string }) => {
    try {
      const perfumeToSend = {
        ...newPerfumeData,
        imageUrl: newPerfumeData.imageUrl || 'https://picsum.photos/seed/perfume/600/600'
      };

      console.log('🔄 Adding perfume:', perfumeToSend);
      
      const response = await fetch(`${API_BASE_URL}/perfumes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(perfumeToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add perfume');
      }

      const newPerfume = await response.json();
      console.log('✅ Perfume added:', newPerfume);
      
      // Actualizar estado local inmediatamente
      setPerfumes(prev => {
        const updated = [newPerfume, ...prev];
        console.log('🔄 Updated perfumes state:', updated.length);
        return updated;
      });
      
      toast({ 
        title: 'Perfume Agregado', 
        description: `${newPerfume.name} ha sido añadido correctamente.` 
      });
    } catch (error) {
      console.error("❌ Error adding perfume: ", error);
      toast({ 
        title: 'Error', 
        description: error instanceof Error ? error.message : 'No se pudo agregar el perfume.', 
        variant: 'destructive' 
      });
      throw error;
    }
  };

  // Eliminar perfume
  const deletePerfume = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/perfumes/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete perfume');
      }

      setPerfumes(prev => prev.filter(p => p.id !== id));
      toast({ 
        title: 'Perfume Eliminado', 
        description: 'El perfume ha sido eliminado permanentemente.', 
        variant: 'destructive' 
      });
    } catch (error) {
      console.error("Error deleting perfume: ", error);
      toast({ 
        title: 'Error', 
        description: 'No se pudo eliminar el perfume.', 
        variant: 'destructive' 
      });
      throw error;
    }
  };

  // Cambiar estado de publicación
  const togglePublishStatus = async (id: string) => {
    try {
      console.log('🔄 Toggling publish status for perfume:', id);
      
      const response = await fetch(`${API_BASE_URL}/perfumes/${id}/publish`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      const updatedPerfume = await response.json();
      console.log('✅ Updated perfume:', updatedPerfume);
      
      // Actualizar estado local correctamente
      setPerfumes(prev => {
        const updated = prev.map(p => p.id === id ? updatedPerfume : p);
        console.log('🔄 Updated perfumes after toggle:', updated.length);
        return updated;
      });
      
      toast({ 
        title: `Estado Actualizado`, 
        description: `${updatedPerfume.name} ha sido ${updatedPerfume.published ? 'publicado' : 'ocultado'}.`
      });
    } catch (error) {
      console.error("❌ Error toggling status: ", error);
      toast({ 
        title: 'Error', 
        description: 'No se pudo cambiar el estado del perfume.', 
        variant: 'destructive' 
      });
      throw error;
    }
  };

  // Actualizar stock
  const updateStock = async (id: string, quantitySold: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/perfumes/${id}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantitySold }),
      });

      if (!response.ok) {
        throw new Error('Failed to update stock');
      }

      const updatedPerfume = await response.json();
      setPerfumes(prev => 
        prev.map(p => p.id === id ? updatedPerfume : p)
      );
      
      return updatedPerfume;
    } catch (error) {
      console.error("Error updating stock: ", error);
      toast({ 
        title: 'Error', 
        description: 'No se pudo actualizar el stock del producto.', 
        variant: 'destructive' 
      });
      throw error;
    }
  };

  // Función para registrar una venta
  const recordSale = async (saleData: Omit<SalesData, 'id' | 'date'>) => {
    try {
      const perfume = perfumes.find(p => p.id === saleData.perfumeId);
      if (!perfume) {
        throw new Error('Perfume no encontrado');
      }

      // Verificar stock disponible
      if (perfume.stock < saleData.quantity) {
        throw new Error(`Stock insuficiente. Solo quedan ${perfume.stock} unidades.`);
      }

      const newSale: SalesData = {
        ...saleData,
        id: Date.now().toString(),
        date: new Date().toISOString()
      };

      // Agregar la venta al estado local
      setSales(prev => [...prev, newSale]);
      
      // Actualizar stock del perfume en el backend
      await updateStock(saleData.perfumeId, saleData.quantity);
      
      toast({
        title: 'Venta Registrada',
        description: `Venta de ${saleData.quantity} ${saleData.quantity > 1 ? 'unidades' : 'unidad'} de ${saleData.perfumeName} registrada.`
      });
    } catch (error) {
      console.error('Error recording sale:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo registrar la venta.',
        variant: 'destructive'
      });
      throw error;
    }
  };

  // Obtener perfume por ID
  const getPerfumeById = (id: string) => {
    return perfumes.find(p => p.id === id);
  };

  // Función para refrescar manualmente
  const refreshPerfumes = async () => {
    console.log('🔄 Manual refresh requested');
    await fetchPerfumes();
  };

  return (
    <PerfumeContext.Provider value={{ 
      perfumes, 
      publishedPerfumes,
      statistics,
      addPerfume, 
      deletePerfume, 
      togglePublishStatus, 
      updateStock,
      recordSale,
      getPerfumeById, 
      loading,
      refreshPerfumes 
    }}>
      {children}
    </PerfumeContext.Provider>
  );
};

export const usePerfumes = () => {
  const context = useContext(PerfumeContext);
  if (context === undefined) {
    throw new Error('usePerfumes must be used within a PerfumeProvider');
  }
  return context;
};