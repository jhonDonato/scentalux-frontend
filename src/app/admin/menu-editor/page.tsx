
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Utensils, PlusCircle, Trash2, Save, Upload, GripVertical } from 'lucide-react';
import Image from 'next/image';
import type { MenuItem } from '@/lib/types';
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


const menuItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres.").max(50, "El nombre no puede tener más de 50 caracteres."),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres.").max(200, "La descripción no puede tener más de 200 caracteres."),
  price: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().positive("El precio debe ser un número positivo.")
  ),
  category: z.enum(['Entradas', 'Platos Fuertes', 'Bebidas', 'Postres', 'Platos a la Carta']),
  stock: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().int().min(0, "El stock no puede ser negativo.")
  ),
  image: z.string().url("Se requiere una URL de imagen válida.").optional().or(z.literal('')),
  published: z.boolean().default(true),
});


function MenuItemForm({ item, onSave, onRemove }: { item: MenuItem, onSave: (id: string, data: MenuItem) => void, onRemove: (id: string) => void }) {
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const form = useForm<z.infer<typeof menuItemSchema>>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      ...item,
      image: item.image || ''
    },
  });
  
  useEffect(() => {
    form.reset({
      ...item,
      image: item.image || ''
    });
  }, [item, form]);


  const onSubmit = (data: z.infer<typeof menuItemSchema>) => {
    onSave(item.id, { ...data, id: item.id });
    toast({
      title: "Plato Guardado",
      description: `"${data.name}" ha sido guardado exitosamente.`,
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
                        <CardTitle className="text-lg font-semibold">{form.watch('name') || "Nuevo Plato"}</CardTitle>
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
                            <FormLabel>Imagen</FormLabel>
                            <FormControl>
                                <div>
                                    <Image 
                                      src={field.value || 'https://picsum.photos/seed/placeholder/600/400'} 
                                      alt={form.watch('name') || "preview"} 
                                      width={300} 
                                      height={200} 
                                      className="rounded-md object-cover aspect-video mb-2 border" 
                                    />
                                    <div className="relative">
                                      <Input 
                                        id={`file-upload-${item.id}`}
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handleImageUpload} 
                                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                                      />
                                      <label htmlFor={`file-upload-${item.id}`} className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Nombre del Plato</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                        <FormField control={form.control} name="price" render={({ field }) => ( <FormItem> <FormLabel>Precio (S/.)</FormLabel> <FormControl><Input type="number" step="0.1" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                    </div>
                     <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>Descripción</FormLabel> <FormControl><Textarea {...field} rows={3} /></FormControl> <FormMessage /> </FormItem> )} />
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 items-end">
                        <FormField control={form.control} name="category" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Categoría</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Seleccione" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Entradas">Entradas</SelectItem>
                                    <SelectItem value="Platos Fuertes">Platos Fuertes</SelectItem>
                                    <SelectItem value="Platos a la Carta">Platos a la Carta</SelectItem>
                                    <SelectItem value="Bebidas">Bebidas</SelectItem>
                                    <SelectItem value="Postres">Postres</SelectItem>
                                </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="stock" render={({ field }) => ( <FormItem> <FormLabel>Stock</FormLabel> <FormControl><Input type="number" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                        
                        <FormField control={form.control} name="published" render={({ field }) => (
                            <FormItem className="flex flex-col space-y-2">
                            <FormLabel>Publicado</FormLabel>
                            <FormControl>
                                <div className="flex items-center h-10 space-x-2">
                                    <Switch checked={field.value} onCheckedChange={field.onChange} id={`published-switch-${item.id}`} />
                                    <label htmlFor={`published-switch-${item.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{field.value ? "Visible" : "Oculto"}</label>
                                </div>
                            </FormControl>
                            </FormItem>
                        )} />
                    </div>
                    <div className='flex justify-end'>
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
                Esta acción eliminará el plato "{item.name}" permanentemente. No se puede deshacer.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => onRemove(item.id)}>Eliminar</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
     </>
  )
}


export default function MenuEditorPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    api.getMenuItems().then(setMenuItems);
  }, []);

  const handleSave = async (id: string, data: MenuItem) => {
    const isNew = id.startsWith('new-');
    if (isNew) {
      const newItem = await api.createMenuItem(data);
      if (newItem) {
        setMenuItems(prev => [...prev.filter(i => i.id !== id), newItem]);
      }
    } else {
      const updatedItem = await api.updateMenuItem(id, data);
      if (updatedItem) {
        setMenuItems(prev => prev.map(item => item.id === id ? updatedItem : item));
      }
    }
  };
  
  const handleRemove = async (id: string) => {
    const isNew = id.startsWith('new-');
    if (isNew) {
      setMenuItems(prev => prev.filter(item => item.id !== id));
      toast({ title: "Plato no guardado eliminado." });
    } else {
      const success = await api.deleteMenuItem(id);
      if (success) {
        setMenuItems(prev => prev.filter(item => item.id !== id));
        toast({ title: "Plato Eliminado", description: "El plato ha sido eliminado exitosamente." });
      } else {
        toast({ title: "Error", description: "No se pudo eliminar el plato.", variant: "destructive" });
      }
    }
  }

  const addNewDish = () => {
    const newDish: MenuItem = {
      id: `new-${Date.now()}`,
      name: 'Nuevo Plato',
      description: 'Describe este delicioso plato aquí...',
      price: 0,
      category: 'Platos a la Carta',
      stock: 0,
      image: '',
      published: true,
    };
    setMenuItems(prev => [...prev, newDish]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Utensils className="h-8 w-8 text-primary" />
            <div>
                <h1 className="text-3xl font-bold font-headline">Editor del Menú</h1>
                <p className="text-muted-foreground">Añade, edita y gestiona los platos de tu restaurante.</p>
            </div>
        </div>
        <Button onClick={addNewDish}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Plato
        </Button>
      </div>
      
      {menuItems.length > 0 ? (
          <div className="space-y-6">
              {menuItems.map(item => (
                <MenuItemForm key={item.id} item={item} onSave={handleSave} onRemove={handleRemove} />
              ))}
          </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center">
            <p className="text-muted-foreground mb-4">No hay ningún plato en el menú todavía.</p>
            <Button onClick={addNewDish}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Agregar el Primer Plato
            </Button>
        </div>
      )}
    </div>
  );
}
