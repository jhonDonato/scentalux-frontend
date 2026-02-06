"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Tag, Trash2, PlusCircle, Search, Eye, Info, Calendar } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import * as api from '@/lib/api';
import type { Discount, MenuItem, OfferRequest } from '@/lib/types';

export default function OffersPage() {
  const { toast } = useToast();
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);

  // --- ESTADOS PARA EL MODAL DE DETALLES ---
  const [selectedOffer, setSelectedOffer] = useState<Discount | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [offerData, setOfferData] = useState<OfferRequest>({
    description: '',
    percentage: 10,
    startDate: '',
    endDate: '',
    modality: 'ALL', 
    menuItemIds: []
  });

  const [newPromoItem, setNewPromoItem] = useState<MenuItem>({
    name: '',
    description: '',
    price: 0,
    category: 'Ofertas',
    stock: 50,
    published: true,
    image: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [itemsData, discountsData] = await Promise.all([
        api.getMenuItems(),
        api.getOffers()
      ]);
      setMenuItems(itemsData); 
      setDiscounts(discountsData);
    } catch (error) {
      console.error("Error cargando datos:", error);
      toast({ title: "Error de conexión", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (isNewItem: boolean) => {
    try {
      if (!offerData.startDate || !offerData.endDate || !offerData.description) {
        toast({ title: "Faltan datos", description: "Completa nombre y fechas.", variant: "destructive" });
        return;
      }

      const payload: OfferRequest = { ...offerData };
      if (payload.startDate.length === 16) payload.startDate += ":00";
      if (payload.endDate.length === 16) payload.endDate += ":00";

      if (isNewItem) {
        if (!newPromoItem.name || newPromoItem.price <= 0) {
           toast({ title: "Plato incompleto", variant: "destructive" });
           return;
        }
        payload.newPromoItem = newPromoItem;
        payload.menuItemIds = []; 
      } else {
        if (!payload.menuItemIds?.length) {
          toast({ title: "Selecciona platos", variant: "destructive" });
          return;
        }
      }

      await api.createOffer(payload);
      toast({ title: "¡Oferta Creada!" });
      loadData();
      resetForms();
    } catch (error) {
      toast({ title: "Error al guardar", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Eliminar oferta? Los platos volverán a su precio original.")) {
      await api.deleteOffer(id);
      loadData();
      toast({ title: "Oferta eliminada" });
    }
  };

  const resetForms = () => {
    setOfferData({ description: '', percentage: 10, startDate: '', endDate: '', modality: 'ALL', menuItemIds: [] });
    setNewPromoItem({ name: '', description: '', price: 0, category: 'Ofertas', stock: 50, published: true, image: '' });
  };

  const handleOpenDetails = (offer: Discount) => {
    setSelectedOffer(offer);
    setIsDetailsOpen(true);
  };

  // Función para obtener platos vinculados a una oferta específica
  const getItemsForOffer = (discountId?: number) => {
    if (!discountId) return [];
    return menuItems.filter(item => item.discount?.id === discountId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Tag className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold font-headline">Gestor de Ofertas</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* --- COLUMNA IZQUIERDA: FORMULARIO --- */}
        <div className="xl:col-span-1 space-y-6">
          <Card className="shadow-sm border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle>Nueva Campaña</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Nombre</Label>
                <Input value={offerData.description} onChange={(e) => setOfferData({...offerData, description: e.target.value})} placeholder="Ej. Promo Verano" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Descuento (%)</Label>
                  <Input type="number" value={offerData.percentage} onChange={(e) => setOfferData({...offerData, percentage: Number(e.target.value)})} />
                </div>
                <div>
                  <Label>Canal</Label>
                  <Select value={offerData.modality} onValueChange={(val: any) => setOfferData({...offerData, modality: val})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Todo</SelectItem>
                      <SelectItem value="RESTAURANT">Mesa</SelectItem>
                      <SelectItem value="DELIVERY">Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2">
                 <Label>Vigencia</Label>
                 <Input type="datetime-local" value={offerData.startDate} onChange={(e) => setOfferData({...offerData, startDate: e.target.value})} />
                 <Input type="datetime-local" value={offerData.endDate} onChange={(e) => setOfferData({...offerData, endDate: e.target.value})} />
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="existing">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="existing">Menú Existente</TabsTrigger>
              <TabsTrigger value="new">Nuevo Combo</TabsTrigger>
            </TabsList>
            <TabsContent value="existing">
              <Card>
                <CardContent className="pt-4">
                  <ScrollArea className="h-[250px] border rounded-md p-2">
                    {menuItems.filter(i => !i.isPromo).map((item) => (
                      <div key={item.id} className="flex items-center space-x-2 p-2 hover:bg-muted rounded text-sm">
                        <Checkbox 
                          checked={offerData.menuItemIds?.includes(item.id!)}
                          onCheckedChange={(checked) => {
                            setOfferData(prev => ({
                              ...prev,
                              menuItemIds: checked 
                                ? [...(prev.menuItemIds || []), item.id!] 
                                : (prev.menuItemIds || []).filter(id => id !== item.id)
                            }))
                          }}
                        />
                        <span className="flex-1">{item.name}</span>
                        <span className="text-muted-foreground">S/ {item.price}</span>
                      </div>
                    ))}
                  </ScrollArea>
                  <Button className="w-full mt-4" onClick={() => handleSubmit(false)}>Aplicar a Selección</Button>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="new">
              <Card>
                <CardContent className="space-y-3 pt-4">
                   <Input placeholder="Nombre del Combo" value={newPromoItem.name} onChange={e => setNewPromoItem({...newPromoItem, name: e.target.value})} />
                   <Input type="number" placeholder="Precio Base (S/.)" value={newPromoItem.price || ''} onChange={e => setNewPromoItem({...newPromoItem, price: Number(e.target.value)})} />
                   <Input placeholder="Descripción breve" value={newPromoItem.description} onChange={e => setNewPromoItem({...newPromoItem, description: e.target.value})} />
                   <Button className="w-full" onClick={() => handleSubmit(true)}>Crear Combo</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* --- COLUMNA DERECHA: TABLA DE OFERTAS --- */}
        <div className="xl:col-span-2">
          <Card className="h-full shadow-sm">
            <CardHeader>
              <CardTitle>Campañas Activas</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaña</TableHead>
                    <TableHead>Vigencia</TableHead>
                    <TableHead>Descuento</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {discounts.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-10 text-muted-foreground">No hay ofertas vigentes.</TableCell></TableRow>
                  ) : (
                    discounts.map((offer) => (
                      <TableRow key={offer.id}>
                        <TableCell className="font-semibold">{offer.description}</TableCell>
                        <TableCell className="text-xs">
                          {new Date(offer.endDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell><Badge variant="secondary" className="text-red-600 font-bold">-{offer.percentage}%</Badge></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenDetails(offer)}>
                              <Eye className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(offer.id!)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* --- MODAL DE DETALLES --- */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" /> Detalles de Campaña
            </DialogTitle>
            <DialogDescription>
              Oferta: <strong>{selectedOffer?.description}</strong>
            </DialogDescription>
          </DialogHeader>
          
          {selectedOffer && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4 bg-muted/50 p-4 rounded-lg text-sm">
                <div><p className="text-muted-foreground">Descuento</p><p className="font-bold text-red-600">-{selectedOffer.percentage}%</p></div>
                <div><p className="text-muted-foreground">Canal</p><p className="font-bold">{selectedOffer.modality}</p></div>
                <div><p className="text-muted-foreground">Fin</p><p className="font-bold">{new Date(selectedOffer.endDate).toLocaleDateString()}</p></div>
              </div>

              <div>
                <h4 className="font-bold mb-3">Platos Incluidos</h4>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead className="text-right">Precio Original</TableHead>
                        <TableHead className="text-right text-red-600">Precio Oferta</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getItemsForOffer(selectedOffer.id).map(item => (
                        <TableRow key={item.id}>
                          <TableCell className="text-sm font-medium">
                            {item.name} {item.isPromo && <Badge className="ml-2 text-[10px]">Temporal</Badge>}
                          </TableCell>
                          <TableCell className="text-right line-through text-muted-foreground text-xs">
                            S/ {item.price.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-extrabold text-primary text-lg">
                            S/ {(item.price * (1 - selectedOffer.percentage / 100)).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                      {getItemsForOffer(selectedOffer.id).length === 0 && (
                        <TableRow><TableCell colSpan={3} className="text-center py-4 text-muted-foreground">Sin platos vinculados.</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}