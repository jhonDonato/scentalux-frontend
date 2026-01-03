'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  onImageChange: (imageUrl: string) => void; // Solo recibe URL, no File
  currentImage?: string;
  endpoint?: string; // Endpoint de upload: '/api/upload/image' o '/api/upload/receipt'
}

export function ImageUpload({ 
  onImageChange, 
  currentImage, 
  endpoint = '/api/upload/image' 
}: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string>(currentImage || '');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Por favor, selecciona un archivo de imagen válido',
        variant: 'destructive'
      });
      return;
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'La imagen debe ser menor a 5MB',
        variant: 'destructive'
      });
      return;
    }

    try {
      setUploading(true);

      // 1. Crear preview temporal (base64)
      const reader = new FileReader();
      reader.onload = (e) => {
        const tempUrl = e.target?.result as string;
        setPreviewUrl(tempUrl);
      };
      reader.readAsDataURL(file);

      // 2. Subir al servidor
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`http://localhost:9090${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      // 3. Actualizar con la URL del servidor
      const serverUrl = result.url; // Ej: "/uploads/abc123.jpg"
      setPreviewUrl(`http://localhost:9090${serverUrl}`);
      
      // 4. Notificar al padre con la URL del servidor
      onImageChange(serverUrl); // Solo la ruta: "/uploads/abc123.jpg"

      toast({
        title: '¡Imagen subida!',
        description: 'La imagen se ha guardado en el servidor',
      });

    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error al subir imagen',
        description: error.message || 'Intenta con otra imagen',
        variant: 'destructive'
      });
      setPreviewUrl('');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl('');
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!uploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="picture">Imagen</Label>
      
      {previewUrl ? (
        <div className="relative w-full max-w-xs">
          <div className="relative h-48 w-full rounded-lg border-2 border-dashed border-gray-300 overflow-hidden">
            <Image
              src={previewUrl}
              alt="Vista previa"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 300px"
              unoptimized={previewUrl.startsWith('data:')} // Desoptimizar para data URLs
            />
            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={handleRemoveImage}
            disabled={uploading}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div
          className="relative w-full max-w-xs border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
          onClick={handleClick}
        >
          {uploading ? (
            <Loader2 className="mx-auto h-8 w-8 text-gray-400 animate-spin" />
          ) : (
            <Upload className="mx-auto h-8 w-8 text-gray-400" />
          )}
          <div className="mt-2">
            <span className="text-sm font-medium text-gray-900">
              {uploading ? 'Subiendo...' : 'Subir imagen'}
            </span>
            <p className="text-xs text-gray-500">
              PNG, JPG, JPEG hasta 5MB
            </p>
          </div>
        </div>
      )}

      <Input
        id="picture"
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />
      
      {previewUrl && (
        <p className="text-xs text-gray-500">
          {previewUrl.startsWith('data:') 
            ? '⏳ Procesando imagen...' 
            : '✓ Imagen guardada en el servidor'}
        </p>
      )}
    </div>
  );
}