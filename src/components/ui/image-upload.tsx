'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  onImageChange: (file: File | null, previewUrl: string) => void;
  currentImage?: string;
}

export function ImageUpload({ onImageChange, currentImage }: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string>(currentImage || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecciona un archivo de imagen válido');
        return;
      }

      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen debe ser menor a 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        setPreviewUrl(url);
        onImageChange(file, url);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl('');
    onImageChange(null, '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="picture">Imagen del Perfume</Label>
      
      {previewUrl ? (
        <div className="relative w-full max-w-xs">
          <div className="relative h-48 w-full rounded-lg border-2 border-dashed border-gray-300 overflow-hidden">
            <Image
              src={previewUrl}
              alt="Vista previa"
              fill
              className="object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={handleRemoveImage}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div
          className="relative w-full max-w-xs border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
          onClick={handleClick}
        >
          <Upload className="mx-auto h-8 w-8 text-gray-400" />
          <div className="mt-2">
            <span className="text-sm font-medium text-gray-900">
              Subir imagen
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
      />
      
      {previewUrl && previewUrl.startsWith('data:') && (
        <p className="text-xs text-green-600">
          ✓ Imagen seleccionada. Se subirá al guardar el perfume.
        </p>
      )}
    </div>
  );
}