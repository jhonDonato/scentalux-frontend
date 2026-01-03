
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
import { CalendarDays, PlusCircle, Trash2, MessageSquare, FileDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { CalendarEvent } from '@/lib/types';
import Papa from 'papaparse';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const eventSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres."),
  description: z.string().optional(),
  date: z.date({
    required_error: "La fecha es requerida.",
  }),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora inválido (HH:mm)."),
});

export default function CalendarPage() {
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const { toast } = useToast();

  // In a real app, fetch this from an API
  // useEffect(() => {
  //   api.getCalendarEvents().then(setCalendarEvents);
  // }, []);

  const form = useForm<z.infer<typeof eventSchema>>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
      date: new Date(),
      time: '12:00',
    },
  });

  const onSubmit = (data: z.infer<typeof eventSchema>) => {
    const newEvent: CalendarEvent = {
        id: `event-${Date.now()}`,
        ...data,
    };
    setCalendarEvents(prev => [...prev, newEvent]);
    toast({
        title: "Evento Guardado",
        description: "Tu nuevo evento ha sido añadido al calendario.",
    });
    form.reset({ title: '', description: '', date: new Date(), time: '12:00' });
  };
  
  const upcomingEvents = calendarEvents
    .filter(event => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const exportToWhatsApp = (event: CalendarEvent) => {
    const message = `*Recordatorio de Evento:*\n\n*${event.title}*\n*Fecha:* ${format(event.date, "dd 'de' MMMM, yyyy", { locale: es })}\n*Hora:* ${event.time}`;
    const whatsappUrl = `https://wa.me/51927325659?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const exportToCsv = (events: CalendarEvent[]) => {
    const data = events.map(event => ({
        'Titulo': event.title,
        'Descripcion': event.description || '',
        'Fecha': format(event.date, 'yyyy-MM-dd'),
        'Hora': event.time,
    }));
    const csv = Papa.unparse(data, { quotes: true, header: true });
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    const fileName = events.length > 1 ? `eventos-${Date.now()}.csv` : `evento-${events[0].id}.csv`;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Exportación Exitosa", description: "Tus eventos han sido exportados a CSV." });
  };
  
  const removeEvent = (eventId: string) => {
    setCalendarEvents(prev => prev.filter(event => event.id !== eventId));
  }

  return (
    <TooltipProvider>
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <CalendarDays className="h-8 w-8 text-primary" />
                <div>
                <h1 className="text-3xl font-bold font-headline">Calendario de Eventos</h1>
                <p className="text-muted-foreground">Organiza tus actividades y recordatorios importantes.</p>
                </div>
            </div>
             <Button onClick={() => exportToCsv(calendarEvents)} disabled={calendarEvents.length === 0}>
                <FileDown className="mr-2 h-4 w-4" />
                Exportar Todo a CSV
            </Button>
        </div>


      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Añadir Evento</CardTitle>
              <CardDescription>Crea un nuevo evento o recordatorio.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título del Evento</FormLabel>
                        <FormControl><Input {...field} placeholder="Ej: Reunión con proveedores" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción (Opcional)</FormLabel>
                        <FormControl><Textarea {...field} placeholder="Detalles sobre el evento..." rows={3} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                <FormLabel>Fecha</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start pl-3 text-left font-normal",
                                            !field.value && "text-muted-foreground"
                                        )}
                                        >
                                        {field.value ? (
                                            format(field.value, "PPP", { locale: es })
                                        ) : (
                                            <span>Elige una fecha</span>
                                        )}
                                        <CalendarDays className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                    <CalendarComponent
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                                        initialFocus
                                        locale={es}
                                        className="admin-calendar"
                                    />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="time"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Hora</FormLabel>
                                <FormControl><Input type="time" {...field} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                   </div>
                  <Button type="submit" className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Guardar Evento
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
           <Card>
                <CardHeader>
                    <CardTitle>Próximos Eventos</CardTitle>
                </CardHeader>
                <CardContent>
                     {upcomingEvents.length > 0 ? (
                        <div className="space-y-4">
                            {upcomingEvents.map(event => (
                                <div key={event.id} className="flex items-start justify-between p-3 rounded-lg border bg-muted/50">
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col items-center justify-center bg-primary text-primary-foreground rounded-md p-2 w-16">
                                            <span className="text-sm font-bold uppercase">{format(new Date(event.date), 'MMM', { locale: es })}</span>
                                            <span className="text-2xl font-bold">{format(new Date(event.date), 'dd')}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">{event.title}</h4>
                                            <p className="text-sm text-muted-foreground">{event.time} - {event.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button size="icon" variant="outline" onClick={() => exportToWhatsApp(event)}>
                                                    <MessageSquare className="h-4 w-4"/>
                                                    <span className="sr-only">Exportar a WhatsApp</span>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent><p>Exportar a WhatsApp</p></TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button size="icon" variant="outline" onClick={() => exportToCsv([event])}>
                                                    <FileDown className="h-4 w-4"/>
                                                    <span className="sr-only">Exportar a CSV</span>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent><p>Exportar a CSV</p></TooltipContent>
                                        </Tooltip>
                                         <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="outline" size="icon" onClick={() => removeEvent(event.id)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent><p>Eliminar Evento</p></TooltipContent>
                                        </Tooltip>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 border-2 border-dashed rounded-lg">
                            <p className="text-muted-foreground">No tienes eventos programados.</p>
                        </div>
                    )}
                </CardContent>
           </Card>
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
}
