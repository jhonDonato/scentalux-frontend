
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Notebook, PlusCircle, MessageSquare, FileDown, Trash2 } from 'lucide-react';
import type { Note } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Papa from 'papaparse';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const noteSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres."),
  content: z.string().min(5, "El contenido debe tener al menos 5 caracteres."),
});

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const { toast } = useToast();
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  // In a real app, you would fetch notes from an API
  // useEffect(() => {
  //   // api.getNotes().then(setNotes);
  // }, []);

  const form = useForm<z.infer<typeof noteSchema>>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  const onSubmit = (data: z.infer<typeof noteSchema>) => {
    const newNote: Note = {
        id: `note-${Date.now()}`,
        createdAt: Date.now(),
        ...data,
    };
    setNotes(prev => [...prev, newNote]);
    toast({
        title: "Nota Guardada",
        description: "Tu nueva nota ha sido creada.",
    });
    form.reset();
  };

  const exportToWhatsApp = (note: Note) => {
    const message = `*${note.title}*\n\n${note.content}`;
    const whatsappUrl = `https://wa.me/51927325659?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const exportToCsv = (notesToExport: Note[]) => {
    const data = notesToExport.map(note => ({
        'Titulo': note.title,
        'Contenido': note.content,
        'Fecha de Creacion': format(note.createdAt, 'yyyy-MM-dd HH:mm'),
    }));
    const csv = Papa.unparse(data, { quotes: true, header: true });
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    const fileName = notesToExport.length > 1 ? `notas-${Date.now()}.csv` : `nota-${notesToExport[0].id}.csv`;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Exportación Exitosa", description: "Tus notas han sido exportadas a CSV." });
  };
  
  const confirmDelete = () => {
    if (noteToDelete) {
        setNotes(prev => prev.filter(note => note.id !== noteToDelete));
        toast({
            title: 'Nota eliminada',
            description: 'La nota ha sido eliminada correctamente.',
            variant: 'destructive'
        });
        setNoteToDelete(null);
    }
  }


  return (
    <TooltipProvider>
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Notebook className="h-8 w-8 text-primary" />
                <div>
                <h1 className="text-3xl font-bold font-headline">Notas y Tareas</h1>
                <p className="text-muted-foreground">Crea, gestiona y exporta tus notas importantes.</p>
                </div>
            </div>
            <Button onClick={() => exportToCsv(notes)} disabled={notes.length === 0}>
                <FileDown className="mr-2 h-4 w-4" />
                Exportar Todo a CSV
            </Button>
        </div>


      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Nueva Nota</CardTitle>
              <CardDescription>Añade una nueva nota o lista de tareas.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl><Input {...field} placeholder="Ej: Compras para la semana" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contenido / Tareas</FormLabel>
                        <FormControl><Textarea {...field} placeholder="- Limones\n- Pescado fresco\n- Cilantro" rows={5} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Guardar Nota
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
            <h2 className="text-2xl font-bold font-headline mb-4">Notas Guardadas</h2>
            {notes.length > 0 ? (
                <div className="space-y-4">
                    {notes.sort((a, b) => b.createdAt - a.createdAt).map(note => (
                        <Card key={note.id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>{note.title}</CardTitle>
                                        <CardDescription>
                                            Creado el {format(note.createdAt, "dd 'de' MMMM, yyyy", { locale: es })}
                                        </CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button size="icon" variant="outline" onClick={() => exportToWhatsApp(note)}>
                                                    <MessageSquare className="h-4 w-4"/>
                                                    <span className="sr-only">Exportar a WhatsApp</span>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent><p>Exportar a WhatsApp</p></TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button size="icon" variant="outline" onClick={() => exportToCsv([note])}>
                                                    <FileDown className="h-4 w-4"/>
                                                    <span className="sr-only">Exportar a CSV</span>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent><p>Exportar a CSV</p></TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button size="icon" variant="outline" onClick={() => setNoteToDelete(note.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                                    <Trash2 className="h-4 w-4"/>
                                                    <span className="sr-only">Eliminar Nota</span>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent><p>Eliminar Nota</p></TooltipContent>
                                        </Tooltip>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                 <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">Aún no has creado ninguna nota.</p>
                </div>
            )}
        </div>
      </div>
      <AlertDialog open={noteToDelete !== null} onOpenChange={(open) => !open && setNoteToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
                Esta acción no se puede deshacer. Esto eliminará permanentemente la nota.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Eliminar</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </TooltipProvider>
  );
}
