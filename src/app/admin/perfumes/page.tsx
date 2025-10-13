'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Trash2, Upload, X, Sparkles, Package, Tag, FileText, Palette } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePerfumes } from '@/context/PerfumeContext';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import type { Perfume } from '@/lib/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:9090';

const isRecent = (dateString: string) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return date > sevenDaysAgo;
};

// Componente de subida de imagen simplificado
function ImageUpload({ onImageChange, currentImage }: { onImageChange: (file: File | null, previewUrl: string) => void; currentImage: string }) {
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecciona un archivo de imagen válido');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen debe ser menor a 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        onImageChange(file, url);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    onImageChange(null, '');
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium flex items-center gap-2">
        <Palette className="h-4 w-4" />
        Imagen del Producto
      </Label>
      
      {currentImage ? (
        <div className="relative group">
          <div className="relative h-48 w-full rounded-xl border-2 border-dashed border-primary/20 overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10">
            <img
              src={currentImage}
              alt="Vista previa"
              className="w-full h-full object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-lg"
            onClick={handleRemoveImage}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <label className="block border-2 border-dashed border-primary/30 rounded-xl p-8 text-center hover:border-primary/50 transition-all duration-300 cursor-pointer bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/15 group">
          <div className="space-y-3">
            <div className="mx-auto h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Subir imagen</p>
              <p className="text-sm text-muted-foreground mt-1">
                PNG, JPG, JPEG hasta 5MB
              </p>
            </div>
          </div>
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}

export default function PerfumesAdminPage() {
  const { perfumes, addPerfume, togglePublishStatus, deletePerfume, loading, refreshPerfumes } = usePerfumes();
  const [newPerfume, setNewPerfume] = useState({
    name: '', 
    brand: '', 
    price: '', 
    stock: '', 
    description: '', 
    category: 'Unisex' as Perfume['category'],
    notes: '',
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE_URL}/api/upload/image`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Error al subir la imagen');
    const data = await response.json();
    return `${API_BASE_URL}${data.url}`;
  };

  const handleAddPerfume = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let imageUrl = 'https://images.unsplash.com/photo-1590736969956-2f91c07faa5f?w=400&h=400&fit=crop';
      
      if (selectedImage) {
        try {
          imageUrl = await uploadImage(selectedImage);
        } catch (error) {
          console.error('Error subiendo imagen:', error);
        }
      }

      const perfumeData: Omit<Perfume, 'id'> & { imageUrl?: string } = {
        name: newPerfume.name,
        brand: newPerfume.brand,
        price: parseFloat(newPerfume.price),
        stock: parseInt(newPerfume.stock, 10),
        description: newPerfume.description,
        category: newPerfume.category,
        notes: newPerfume.notes.split(',').map(n => n.trim()).filter(n => n),
        imageUrl: imageUrl,
        published: true,
        createdAt: new Date().toISOString()
      };

      await addPerfume(perfumeData);
      
      setNewPerfume({ 
        name: '', 
        brand: '', 
        price: '', 
        stock: '', 
        description: '', 
        category: 'Unisex', 
        notes: '',
      });
      setSelectedImage(null);
      setImagePreview('');
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (file: File | null, previewUrl: string) => {
    setSelectedImage(file);
    setImagePreview(previewUrl);
  };

  const handleDeletePerfume = async (id: string) => {
    try {
      await deletePerfume(id);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  const handleTogglePublish = async (id: string) => {
    try {
      await togglePublishStatus(id);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setSelectedImage(null);
      setImagePreview('');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Gestión de Perfumes
          </h2>
        </div>
        <div className="rounded-2xl border border-primary/10 bg-gradient-to-br from-background to-primary/5 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground/70">Cargando perfumes...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Catálogo de Perfumes
          </h2>
          <p className="text-foreground/60 mt-2">Administra tu colección de fragancias exclusivas</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={refreshPerfumes}
            className="border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Sparkles className="mr-2 h-4 w-4" />
                Nueva Fragancia
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-0 bg-transparent shadow-none">
              <div className="bg-background rounded-2xl border border-primary/20 shadow-2xl overflow-hidden">
                {/* Header con gradiente */}
               <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-purple-600 py-4 px-8">
              <DialogHeader className="text-center">
                <DialogTitle className="text-3xl font-bold text-white flex items-center justify-center gap-3">
                  <div className="p-2 bg-white/20 rounded-full">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  Crear Nueva Fragancia
                </DialogTitle>
                <p className="text-white/80 mt-2 text-lg">
                  Da vida a una nueva esencia en tu catálogo
                </p>
              </DialogHeader>
            </div>

                
                <form onSubmit={handleAddPerfume}>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
                    {/* Sección de Imagen */}
                    <div className="space-y-6">
                      <div className="text-center">
                        <h3 className="text-xl font-semibold text-foreground flex items-center justify-center gap-2">
                          <Palette className="h-5 w-5 text-primary" />
                          Imagen de la Fragancia
                        </h3>
                        <p className="text-foreground/60 mt-1">Sube una imagen atractiva del perfume</p>
                      </div>
                      <ImageUpload 
                        onImageChange={handleImageChange}
                        currentImage={imagePreview}
                      />
                    </div>
                    
                    {/* Sección de Formulario */}
                    <div className="space-y-6">
                      {/* Información Básica */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-foreground border-l-4 border-primary pl-3">
                          Información Básica
                        </h3>
                        
                        <div className="grid gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Nombre de la Fragancia *</Label>
                            <Input 
                              value={newPerfume.name} 
                              onChange={e => setNewPerfume({...newPerfume, name: e.target.value})} 
                              placeholder="Ej: Esencia Nocturna"
                              className="w-full border-2 border-primary/20 focus:border-primary transition-all duration-200 rounded-lg"
                              required 
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Marca *</Label>
                            <Input 
                              value={newPerfume.brand} 
                              onChange={e => setNewPerfume({...newPerfume, brand: e.target.value})} 
                              placeholder="Ej: Lujo Fragrances"
                              className="w-full border-2 border-primary/20 focus:border-primary transition-all duration-200 rounded-lg"
                              required 
                            />
                          </div>
                        </div>
                      </div>

                      {/* Precio y Stock */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-foreground border-l-4 border-purple-500 pl-3">
                          Precio e Inventario
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Precio *</Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground font-semibold">
                                $
                              </span>
                              <Input 
                                type="number" 
                                step="0.01"
                                min="0"
                                value={newPerfume.price} 
                                onChange={e => setNewPerfume({...newPerfume, price: e.target.value})} 
                                className="pl-8 border-2 border-primary/20 focus:border-primary transition-all duration-200 rounded-lg"
                                placeholder="0.00"
                                required 
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Stock *</Label>
                            <Input 
                              type="number" 
                              min="0"
                              value={newPerfume.stock} 
                              onChange={e => setNewPerfume({...newPerfume, stock: e.target.value})} 
                              className="border-2 border-primary/20 focus:border-primary transition-all duration-200 rounded-lg"
                              placeholder="0"
                              required 
                            />
                          </div>
                        </div>
                      </div>

                      {/* Categoría */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-foreground border-l-4 border-pink-500 pl-3">
                          Categoría
                        </h3>
                        
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-foreground">Tipo de Fragancia *</Label>
                          <Select 
                            value={newPerfume.category} 
                            onValueChange={(v: Perfume['category']) => setNewPerfume({...newPerfume, category: v})}
                          >
                            <SelectTrigger className="border-2 border-primary/20 focus:border-primary transition-all duration-200 rounded-lg">
                              <SelectValue placeholder="Selecciona una categoría" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Para Ella" className="flex items-center gap-2">
                                <span className="text-lg">👩</span> Para Ella
                              </SelectItem>
                              <SelectItem value="Para Él" className="flex items-center gap-2">
                                <span className="text-lg">👨</span> Para Él
                              </SelectItem>
                              <SelectItem value="Unisex" className="flex items-center gap-2">
                                <span className="text-lg">👥</span> Unisex
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Descripción y Notas */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-foreground border-l-4 border-blue-500 pl-3">
                          Descripción
                        </h3>
                        
                        <div className="grid gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Descripción *</Label>
                            <Textarea 
                              value={newPerfume.description} 
                              onChange={e => setNewPerfume({...newPerfume, description: e.target.value})} 
                              placeholder="Describe el aroma, las sensaciones y la personalidad de esta fragancia..."
                              className="min-h-[100px] resize-vertical border-2 border-primary/20 focus:border-primary transition-all duration-200 rounded-lg"
                              required 
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Notas de Fragancia *</Label>
                            <Input 
                              placeholder="bergamota, jazmín, rosa, sándalo, vainilla..."
                              value={newPerfume.notes} 
                              onChange={e => setNewPerfume({...newPerfume, notes: e.target.value})} 
                              className="border-2 border-primary/20 focus:border-primary transition-all duration-200 rounded-lg"
                              required 
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              💡 Separa cada nota con una coma
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="px-8 pb-8 pt-6 border-t border-primary/10">
                    <div className="flex gap-3 w-full">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsDialogOpen(false)}
                        className="flex-1 border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 rounded-lg py-3"
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="flex-1 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg py-3"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Creando Fragancia...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-5 w-5" />
                            Crear Fragancia
                          </>
                        )}
                      </Button>
                    </div>
                  </DialogFooter>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Tabla de Perfumes */}
      <div className="rounded-2xl border border-primary/20 bg-white/50 backdrop-blur-sm shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-6 border-b border-primary/10">
          <h3 className="text-2xl font-bold text-foreground">Lista de Fragancias</h3>
          <p className="text-foreground/60 mt-1">{perfumes.length} perfumes en catálogo</p>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow className="bg-primary/5 hover:bg-primary/10">
              <TableHead className="font-bold text-foreground text-sm uppercase">Producto</TableHead>
              <TableHead className="font-bold text-foreground text-sm uppercase">Precio</TableHead>
              <TableHead className="font-bold text-foreground text-sm uppercase">Stock</TableHead>
              <TableHead className="font-bold text-foreground text-sm uppercase">Creado</TableHead>
              <TableHead className="font-bold text-foreground text-sm uppercase">Estado</TableHead>
              <TableHead className="font-bold text-foreground text-sm uppercase text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {perfumes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-16">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="h-20 w-20 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <Sparkles className="h-10 w-10 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-semibold text-foreground">No hay fragancias</p>
                      <p className="text-foreground/60 mt-1">Comienza agregando tu primera esencia al catálogo</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              perfumes.map((perfume) => (
                <TableRow key={perfume.id} className={cn(
                  isRecent(perfume.createdAt) && 'bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-l-green-400',
                  'hover:bg-primary/5 transition-all duration-200 group'
                )}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 relative rounded-xl overflow-hidden border-2 border-primary/10 shadow-sm group-hover:shadow-md transition-shadow">
                        <img 
                          src={perfume.imageUrl} 
                          alt={perfume.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{perfume.name}</p>
                        <p className="text-sm text-foreground/60">{perfume.brand}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-foreground text-lg">
                    ${perfume.price.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "px-3 py-2 rounded-full text-sm font-semibold shadow-sm border",
                      perfume.stock > 20 ? "bg-green-100 text-green-700 border-green-200" :
                      perfume.stock > 5 ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
                      perfume.stock > 0 ? "bg-orange-100 text-orange-700 border-orange-200" :
                      "bg-red-100 text-red-700 border-red-200"
                    )}>
                      {perfume.stock} unidades
                    </span>
                  </TableCell>
                  <TableCell className="text-foreground/70">
                    {new Date(perfume.createdAt).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={cn(
                        "px-3 py-2 text-sm font-semibold shadow-sm",
                        perfume.published 
                          ? "bg-green-500 hover:bg-green-600 text-white" 
                          : "bg-gray-500 hover:bg-gray-600 text-white"
                      )}
                    >
                      {perfume.published ? '🌿 Publicado' : '📦 Borrador'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleTogglePublish(perfume.id)}
                      className="border-primary/20 hover:border-primary/40 hover:bg-primary/10 transition-all duration-200 rounded-lg"
                    >
                      {perfume.published ? 'Ocultar' : 'Publicar'}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          className="rounded-lg hover:shadow-md transition-all duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="border-0 shadow-2xl rounded-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-foreground flex items-center gap-2 text-xl">
                            <Trash2 className="h-6 w-6 text-destructive" />
                            Confirmar Eliminación
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-foreground/70 text-base">
                            ¿Estás seguro de eliminar <span className="font-semibold text-foreground">"{perfume.name}"</span>? 
                            Esta acción no se puede deshacer.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="border-primary/20 hover:border-primary/40 rounded-lg">
                            Cancelar
                          </AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeletePerfume(perfume.id)}
                            className="bg-destructive hover:bg-destructive/90 rounded-lg shadow-lg"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}  
          </TableBody>
        </Table>
      </div>
    </div>
  );
}