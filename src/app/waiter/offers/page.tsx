
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Tag, PlusCircle, Trash2, Save, Upload, GripVertical } from 'lucide-react';
import Image from 'next/image';
import type { Offer } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import * as api from '@/lib/api';

const offerSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(5, "El título debe tener al menos 5 caracteres."),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres."),
  image: z.string().url("Se requiere una URL de imagen válida.").optional().or(z.literal('')),
  published: z.boolean().default(true),
});

function OfferForm({ offer, onSave, onRemove }: { offer: Offer, onSave: (id: string, data: Offer) => void, onRemove: (id: string) => void }) {
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof offerSchema>>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
        ...offer,
        image: offer.image || ''
    },
  });

  const onSubmit = (data: z.infer<typeof offerSchema>) => {
    onSave(offer.id, { ...data, id: offer.id });
    toast({
      title: "Oferta Guardada",
      description: `La oferta "${data.title}" ha sido guardada exitosamente.`,
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if(file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({ title: "Imagen muy grande", description: "Por favor, sube una imagen de menos de 2MB.", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        form.setValue('image', dataUrl, { shouldValidate: true, shouldDirty: true });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className='flex items-center gap-2'>
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                    <CardTitle className="text-lg font-semibold">{form.watch('title') || "Nueva Oferta"}</CardTitle>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => setIsDeleteDialogOpen(true)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4 md:col-span-1">
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Imagen de la Oferta</FormLabel>
                      <FormControl>
                        <div>
                          <Image 
                            src={field.value || 'https://picsum.photos/seed/offer-placeholder/600/400'} 
                            alt={form.watch('title') || "preview"} 
                            width={300} height={200} 
                            className="rounded-md object-cover aspect-video mb-2 border" 
                          />
                          <div className="relative">
                            <Input 
                              id={`file-upload-${offer.id}`}
                              type="file" 
                              accept="image/*" 
                              onChange={handleImageUpload} 
                              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                            />
                            <label htmlFor={`file-upload-${offer.id}`} className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer">
                              <Upload className="mr-2 h-4 w-4" />
                              Subir Imagen
                            </label>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-4 md:col-span-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título de la Oferta</FormLabel>
                      <FormControl><Input {...field} placeholder="Ej: 2x1 en Cervezas" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl><Textarea {...field} placeholder="Detalles de la promoción..." /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-end justify-between pt-4">
                  <FormField
                    control={form.control}
                    name="published"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} id={`published-switch-${offer.id}`} />
                        </FormControl>
                        <FormLabel htmlFor={`published-switch-${offer.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {field.value ? "Oferta Publicada" : "Oferta Oculta"}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={!form.formState.isDirty}>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </Button>
                </div>
              </div>
            </CardContent>
          </form>
        </Form>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la oferta "{offer.title}" permanentemente. No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => onRemove(offer.id)}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}


export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    api.getOffers().then(setOffers);
  }, []);


  const handleSave = async (id: string, data: Offer) => {
    const isNew = id.startsWith('new-');
    if (isNew) {
      const newOffer = await api.createOffer(data);
      if(newOffer) {
        setOffers(prev => [...prev.filter(o => o.id !== id), newOffer]);
      }
    } else {
      const updatedOffer = await api.updateOffer(id, data);
      if (updatedOffer) {
        setOffers(prev => prev.map(o => o.id === id ? updatedOffer : o));
      }
    }
  };

  const handleRemove = async (id: string) => {
    const isNew = id.startsWith('new-');
    if (isNew) {
      setOffers(prev => prev.filter(o => o.id !== id));
      toast({ title: "Oferta no guardada eliminada." });
    } else {
      const success = await api.deleteOffer(id);
      if (success) {
        setOffers(prev => prev.filter(o => o.id !== id));
        toast({ title: "Oferta Eliminada", description: "La oferta ha sido eliminada exitosamente." });
      } else {
        toast({ title: "Error", description: "No se pudo eliminar la oferta.", variant: "destructive" });
      }
    }
  };
  
  const addNewOffer = () => {
    const newOffer: Offer = {
      id: `new-${Date.now()}`,
      title: 'Nueva Oferta',
      description: 'Describe esta increíble promoción aquí.',
      image: '',
      published: true,
    };
    setOffers(prev => [...prev, newOffer]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Tag className="h-8 w-8 text-primary" />
            <div>
                <h1 className="text-3xl font-bold font-headline">Gestor de Ofertas</h1>
                <p className="text-muted-foreground">Crea y administra las promociones especiales.</p>
            </div>
        </div>
        <Button onClick={addNewOffer}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Oferta
        </Button>
      </div>

      {offers.length > 0 ? (
        <div className="space-y-6">
          {offers.map((offer) => (
            <OfferForm key={offer.id} offer={offer} onSave={handleSave} onRemove={handleRemove} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center">
            <p className="text-muted-foreground mb-4">No hay ninguna oferta creada todavía.</p>
            <Button onClick={addNewOffer}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir la Primera Oferta
            </Button>
        </div>
      )}
    </div>
  );
}
