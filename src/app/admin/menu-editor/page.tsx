"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';
import { Utensils, PlusCircle, Save, Search, Filter, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { ImageUpload } from '@/components/ui/image-upload'; 
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
  id: z.union([z.string(), z.number()]).optional().transform(String),
  
  name: z.string()
    .min(1, "El nombre es obligatorio.")
    .min(3, "Mínimo 3 caracteres.")
    .max(50, "Máximo 50 caracteres."),
  
  description: z.string()
    .min(1, "La descripción es obligatoria.")
    .min(10, "Mínimo 10 caracteres.")
    .max(200, "Máximo 200 caracteres."),
  
  price: z.preprocess(
    (a) => {
        if (a === '' || a === undefined || a === null) return undefined;
        return parseFloat(String(a));
    },
    z.number({ required_error: "El precio es obligatorio." })
      .positive("El precio debe ser mayor a 0.")
      .refine((val) => Number.isInteger(val * 10), "Debe ser múltiplo de 10 céntimos (ej: 20.10).")
  ),
  
  category: z.enum(['Entradas', 'Platos Fuertes', 'Bebidas', 'Postres', 'Platos a la Carta']),
  
  stock: z.preprocess(
    (a) => {
        if (a === '' || a === undefined || a === null) return undefined;
        return parseFloat(String(a));
    }, 
    z.number({ required_error: "El stock es obligatorio." })
      .min(0, "No puede ser negativo.")
      .int("Debe ser un número entero.")
  ),
  
  image: z.string().nullable().optional().or(z.literal('')),
  published: z.boolean().default(true),
})
.refine((data) => {
    if (data.published === true) {
        return !!data.image && data.image.length > 0;
    }
    return true; 
}, {
    message: "Para mostrar el plato, es OBLIGATORIO subir una imagen.",
    path: ["published"], 
});

interface MenuItemFormProps {
  initialData: MenuItem | null;
  onSave: (data: MenuItem) => Promise<void>;
  onCancel: () => void;
  setIsDirty: (isDirty: boolean) => void;
  formRef: any; 
}

function MenuItemForm({ initialData, onSave, onCancel, setIsDirty, formRef }: MenuItemFormProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  const defaultValues = {
    name: '', 
    description: '', 
    category: 'Platos a la Carta' as const, 
    image: '', 
    published: true
  };

  const form = useForm<z.infer<typeof menuItemSchema>>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: initialData || defaultValues,
  });

  useEffect(() => {
    setIsDirty(form.formState.isDirty);
  }, [form.formState.isDirty, setIsDirty]);

  useEffect(() => {
    if (initialData) {
      form.reset({ ...initialData, image: initialData.image || '' });

    } else {
      form.reset(defaultValues); 
    }
  }, [initialData, form]);

  const onSubmit = async (data: z.infer<typeof menuItemSchema>) => {
    if (isUploadingImage) {
        toast({ title: "Espera", description: "La imagen se está subiendo...", variant: "destructive" });
        return;
    }
    try {
      setIsSaving(true);
      const idToSave = initialData?.id || `new-${Date.now()}`;
      await onSave({ ...data, id: idToSave, image: data.image || '' });
      
      if (!initialData) {
          form.reset(defaultValues); 
      }
      
      toast({ title: "Guardado", description: "El plato ha sido guardado exitosamente." });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "No se pudo guardar.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="mb-8 shadow-md border-l-4 border-l-primary/20">
       <Form {...form}>
        <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader className="pb-4 border-b bg-gray-50/50">
                <div className="flex justify-between items-center">
                    <div className='flex items-center gap-2'>
                        {initialData ? <Utensils className="h-5 w-5 text-primary" /> : <PlusCircle className="h-5 w-5 text-green-600" />}
                        <CardTitle className="text-lg font-semibold">
                            {initialData ? `Editando: ${initialData.name}` : "Registrar Nuevo Plato"}
                        </CardTitle>
                    </div>
                    {initialData && (
                        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
                            Cancelar Edición
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                 <div className="space-y-4 md:col-span-1">
                    <FormField control={form.control} name="image" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Imagen del Plato</FormLabel>
                                <div className="mt-1">
                                    <ImageUpload 
                                        key={initialData?.id || 'new-plate'} 
                                        currentImage={field.value || ''} 
                                        onUploadStart={() => setIsUploadingImage(true)}
                                        onImageChange={(url) => {
                                            field.onChange(url);
                                            setIsUploadingImage(false);
                                        }}
                                    />
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-4 md:col-span-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField control={form.control} name="name" render={({ field }) => ( 
                            <FormItem> 
                                <FormLabel>Nombre <span className="text-destructive">*</span></FormLabel> 
                                <FormControl><Input {...field} placeholder="Ej: Lomo Saltado" /></FormControl> 
                                <FormMessage /> 
                            </FormItem> 
                        )} />
                        
                        <FormField control={form.control} name="price" render={({ field }) => ( 
                            <FormItem> 
                                <FormLabel>Precio (S/.) <span className="text-destructive">*</span></FormLabel> 
                                <FormControl>
                                    <Input 
                                        type="number" 
                                        step="0.10"
                                        placeholder="0.00"
                                        {...field} 
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            field.onChange(val === '' ? '' : val); 
                                        }}
                                        value={field.value ?? ''}
                                    />
                                </FormControl> 
                                <FormMessage /> 
                            </FormItem> 
                        )} />
                    </div>
                     <FormField control={form.control} name="description" render={({ field }) => ( 
                        <FormItem> 
                            <FormLabel>Descripción <span className="text-destructive">*</span></FormLabel> 
                            <FormControl><Textarea {...field} rows={3} placeholder="Ingredientes..." /></FormControl> 
                            <FormMessage /> 
                        </FormItem> 
                    )} />
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 items-end">
                        <FormField control={form.control} name="category" render={({ field }) => (
                            <FormItem> 
                                <FormLabel>Categoría</FormLabel> 
                                <Select onValueChange={field.onChange} value={field.value}> 
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione" />
                                        </SelectTrigger>
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
                        
                        <FormField control={form.control} name="stock" render={({ field }) => ( 
                            <FormItem> 
                                <FormLabel>Stock <span className="text-destructive">*</span></FormLabel> 
                                <FormControl>
                                    <Input 
                                        type="number" 
                                        {...field}
                                        value={field.value ?? ''}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            field.onChange(val === '' ? '' : val); 
                                        }}
                                        onKeyDown={(e) => {
                                            if (["e", "E", "+", "-", ".", ","].includes(e.key)) {
                                                e.preventDefault();
                                            }
                                        }}
                                    />
                                </FormControl> 
                                <FormMessage /> 
                            </FormItem> 
                        )} />
                        
                        <FormField control={form.control} name="published" render={({ field }) => (
                            <FormItem className="flex flex-col space-y-2"> 
                                <FormLabel>Publicado</FormLabel> 
                                <div className="flex items-center h-10 space-x-2"> 
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} /> 
                                    </FormControl>
                                    <label className="text-sm font-medium cursor-pointer" onClick={() => field.onChange(!field.value)}>
                                        {field.value ? "Visible" : "Oculto"}
                                    </label> 
                                </div>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                    <div className='flex justify-end items-center gap-3 pt-2'>
                         {isUploadingImage && <span className="text-xs text-muted-foreground animate-pulse">Subiendo imagen...</span>}
                         <Button type="submit" disabled={isSaving || isUploadingImage}>
                            <Save className="mr-2 h-4 w-4" />
                            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                         </Button>
                    </div>
                </div>
            </CardContent>
        </form>
       </Form>
    </Card>
  );
}

export default function MenuEditorPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [pendingId, setPendingId] = useState<string | null | undefined>(undefined);
  const [showWarning, setShowWarning] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todos');

  useEffect(() => {
    api.getMenuItems().then(setMenuItems);
  }, []);

  const handleSaveData = async (data: MenuItem) => {
    if (!selectedId) {
      const newItem = await api.createMenuItem(data);
      if (newItem) setMenuItems(prev => [...prev, newItem]);
    } else {
      const updatedItem = await api.updateMenuItem(selectedId, data);
      if (updatedItem) {
        setMenuItems(prev => prev.map(item => item.id === selectedId ? updatedItem : item));
      }
    }
    setSelectedId(null);
    setIsFormDirty(false);
    setPendingId(undefined);
  };

  const handleRowClick = (id: string | null) => {
    if (selectedId === id) return; 

    if (isFormDirty) {
      setPendingId(id); 
      setShowWarning(true); 
    } else {
      setSelectedId(id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const confirmDiscard = () => {
    setSelectedId(pendingId as string | null);
    setIsFormDirty(false); 
    setShowWarning(false);
    setPendingId(undefined);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmSaveAndSwitch = async () => {
    if (formRef.current) {
        formRef.current.requestSubmit(); 
        
        setTimeout(() => {
            if (pendingId !== undefined) {
                setSelectedId(pendingId);
                setShowWarning(false);
                setPendingId(undefined);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }, 500);
    }
  };

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'Todos' || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [menuItems, search, categoryFilter]);

  const itemsToShow = filteredItems.slice(0, 10);
  const selectedItemData = selectedId ? menuItems.find(i => i.id === selectedId) || null : null;
  const isCreatingNew = selectedId === null; 

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold font-headline">Editor del Menú</h1>
        <p className="text-muted-foreground">Gestiona el inventario de platos diarios.</p>
      </div>

      <MenuItemForm 
        initialData={selectedItemData} 
        onSave={handleSaveData} 
        onCancel={() => handleRowClick(null)}
        setIsDirty={setIsFormDirty}
        formRef={formRef}
      />

      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-2 w-full md:w-auto">
            <h2 className="text-lg font-semibold flex items-center gap-2">
                <Utensils className="h-5 w-5" /> Listado de Platos
            </h2>
            <Badge variant="secondary">{filteredItems.length} resultados</Badge>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Buscar plato..." 
                    className="pl-8" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <SelectValue placeholder="Categoría" />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Todos">Todas</SelectItem>
                    <SelectItem value="Entradas">Entradas</SelectItem>
                    <SelectItem value="Platos Fuertes">Platos Fuertes</SelectItem>
                    <SelectItem value="Platos a la Carta">Platos a la Carta</SelectItem>
                    <SelectItem value="Bebidas">Bebidas</SelectItem>
                    <SelectItem value="Postres">Postres</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>

      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        <Table>
            <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="w-[80px]">Imagen</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead className="hidden md:table-cell">Categoría</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Estado</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {itemsToShow.length > 0 ? (
                    itemsToShow.map((item) => (
                        <TableRow 
                            key={item.id} 
                            onClick={() => handleRowClick(item.id)}
                            className={`cursor-pointer transition-colors hover:bg-blue-50 ${selectedId === item.id ? 'bg-blue-100 hover:bg-blue-100 border-l-4 border-l-primary' : ''}`}
                        >
                            <TableCell>
                                <div className="relative h-10 w-10 rounded overflow-hidden border bg-gray-100">
                                    {item.image ? (
                                        <Image src={item.image} alt={item.name} fill className="object-cover" unoptimized />
                                    ) : (
                                        <div className="flex items-center justify-center h-full w-full"><ImageIcon className="h-4 w-4 text-gray-400" /></div>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="font-medium">
                                {item.name}
                                {selectedId === item.id && <span className="ml-2 text-xs text-primary font-bold">(Editando)</span>}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                                <Badge variant="outline">{item.category}</Badge>
                            </TableCell>
                            <TableCell>S/. {item.price.toFixed(2)}</TableCell>
                            <TableCell>{item.stock}</TableCell>
                            <TableCell>
                                {item.published ? (
                                    <Badge className="bg-green-500 hover:bg-green-600">Visible</Badge>
                                ) : (
                                    <Badge variant="destructive">Oculto</Badge>
                                )}
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                            No se encontraron platos.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
        {filteredItems.length > 10 && (
            <div className="p-4 text-center text-xs text-muted-foreground bg-gray-50 border-t">
                Mostrando los primeros 10 de {filteredItems.length} platos. Usa el buscador para ver más.
            </div>
        )}
      </div>

      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
                    <AlertCircle className="h-5 w-5" /> 
                    {isCreatingNew ? "Registro incompleto" : "Cambios sin guardar"}
                </AlertDialogTitle>
                <AlertDialogDescription>
                    {isCreatingNew 
                        ? "Estás registrando un nuevo plato y no has terminado. Si sales ahora, perderás los datos ingresados."
                        : `Tienes modificaciones pendientes en "${menuItems.find(i => i.id === selectedId)?.name}".`
                    }
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                {isCreatingNew ? (
                    <>
                        <Button variant="destructive" onClick={confirmDiscard}>
                            Salir de todas formas
                        </Button>
                        <Button variant="outline" onClick={() => setShowWarning(false)}>
                            Continuar editando
                        </Button>
                    </>
                ) : (
                    <>
                        <AlertDialogCancel onClick={() => setShowWarning(false)}>Cancelar</AlertDialogCancel>
                        <Button variant="destructive" onClick={confirmDiscard}>
                            Descartar cambios
                        </Button>
                        <Button onClick={confirmSaveAndSwitch}>
                            Guardar cambios
                        </Button>
                    </>
                )}
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}