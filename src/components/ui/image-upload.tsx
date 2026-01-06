'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, Loader2, Image as ImageIcon, Info } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  onImageChange: (imageUrl: string) => void;
  onUploadStart?: () => void;
  currentImage?: string;
  endpoint?: string;
}

export function ImageUpload({ 
  onImageChange, 
  onUploadStart,
  currentImage, 
  endpoint = '/api/upload/image' 
}: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string>(currentImage || '');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setPreviewUrl(currentImage || '');
  }, [currentImage]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Formato incorrecto', description: 'Por favor selecciona un archivo de imagen (JPG, PNG, WEBP).', variant: 'destructive' });
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Imagen muy pesada', description: 'La imagen debe pesar menos de 5MB.', variant: 'destructive' });
      return;
    }

    try {
      setUploading(true);
      if (onUploadStart) onUploadStart();

      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target?.result as string);
      reader.readAsDataURL(file);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`http://localhost:9090${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Error al subir imagen');

      const result = await response.json();
      const cloudUrl = result.url; 
      
      setPreviewUrl(cloudUrl);
      onImageChange(cloudUrl);

      toast({ title: '¡Imagen guardada!', description: 'Subida correctamente a la nube.' });

    } catch (error: any) {
      console.error(error);
      toast({ title: 'Error', description: 'No se pudo subir la imagen.', variant: 'destructive' });
      setPreviewUrl(currentImage || '');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl('');
    onImageChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-3">

      {previewUrl ? (
        <div className="relative w-full">
          <div className="relative w-full aspect-[4/3] rounded-lg border-2 border-dashed overflow-hidden bg-gray-50 flex items-center justify-center group">
            <Image 
              src={previewUrl} 
              alt="Vista previa" 
              fill 
              className="object-cover transition-transform duration-500 group-hover:scale-105" 
              unoptimized={true} 
            /> 
            
            {uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                    <Loader2 className="animate-spin text-white h-8 w-8"/>
                </div>
            )}
          </div>
          
          <Button 
            type="button" 
            variant="destructive" 
            size="icon" 
            className="absolute -top-2 -right-2 h-7 w-7 rounded-full shadow-md hover:scale-110 transition-transform" 
            onClick={handleRemoveImage}
            disabled={uploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div 
            onClick={() => !uploading && fileInputRef.current?.click()} 
            className="cursor-pointer border-2 border-dashed border-gray-300 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 rounded-lg w-full aspect-[4/3] flex flex-col items-center justify-center bg-gray-50/50"
        >
           {uploading ? (
               <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary"/>
           ) : (
               <>
                <div className="p-3 bg-white rounded-full shadow-sm mb-3">
                    <Upload className="h-6 w-6 text-primary" />
                </div>
                <span className="text-sm font-semibold text-gray-700">Subir imagen</span>
                <span className="text-xs text-muted-foreground mt-1">Click para explorar</span>
               </>
           )}
        </div>
      )}

      {/* ZONA DE RECOMENDACIONES */}
      <div className="bg-blue-50 border border-blue-100 rounded-md p-3 space-y-2">
        <div className="flex gap-2 items-start text-xs text-blue-700">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <ul className="list-disc pl-3 space-y-1">
                <li><strong>Formato:</strong> Horizontal (Paisaje).</li>
                <li><strong>Proporción:</strong> 4:3 (Ej: 800x600 px).</li>
                <li><strong>Peso Máximo:</strong> 5MB.</li>
            </ul>
        </div>
        <p className="text-[10px] text-muted-foreground pl-6">
            * Las imágenes verticales serán recortadas al centro automáticamente.
        </p>
      </div>

      <Input 
        ref={fileInputRef} 
        type="file" 
        accept="image/png, image/jpeg, image/webp" 
        onChange={handleFileSelect} 
        className="hidden" 
        disabled={uploading} 
      />
    </div>
  );
}