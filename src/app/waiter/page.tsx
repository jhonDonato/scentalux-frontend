
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Plus, Send, Trash2, Utensils, BellRing, CircleUserRound, CheckCircle, Printer, Truck, PlusCircle, MinusCircle, Edit, FileX, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OrderItem, MenuItem, Order, Table } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
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

function TableCard({ tableId, status, onSelect }: { tableId: string; status: string; onSelect: () => void }) {
  const statusConfig = {
    free: { text: 'Libre', color: 'bg-green-100 text-green-800 border-green-300', icon: CircleUserRound },
    occupied: { text: 'Ocupada', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: Utensils },
    'needs-attention': { text: 'Llamando', color: 'bg-yellow-100 text-yellow-800 border-yellow-300 animate-pulse', icon: BellRing },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.free;
  const Icon = config.icon;

  return (
    <Card
      onClick={onSelect}
      className={cn("cursor-pointer transition-all duration-200 hover:shadow-xl hover:-translate-y-1", config.color)}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold">Mesa {tableId}</CardTitle>
        <Icon className="h-6 w-6" />
      </CardHeader>
      <CardContent>
        <p className="text-sm font-semibold">{config.text}</p>
      </CardContent>
    </Card>
  );
}

function OrderSheet({ tableId, isOpen, onOpenChange, onOrderChange }: { tableId: string, isOpen: boolean, onOpenChange: (open: boolean) => void, onOrderChange: () => void }) {
  const { toast } = useToast();
  
  const [existingOrder, setExistingOrder] = useState<Order | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [currentOrderItems, setCurrentOrderItems] = useState<OrderItem[]>([]);
  const [deliveryTime, setDeliveryTime] = useState('15');
  const [view, setView] = useState<'order' | 'receipt' | 'edit'>('order');
  const [activeCategory, setActiveCategory] = useState<string | undefined>();
  const [isCancelAlertOpen, setIsCancelAlertOpen] = useState(false);

  useEffect(() => {
    api.getMenuItems().then(setMenuItems);
  }, []);

  const getMenuItem = (id: string) => menuItems.find(item => item.id === id);

  useEffect(() => {
    if (isOpen) {
        api.getOrderByTableId(tableId).then(order => {
            if (order) {
                setExistingOrder(order);
                setView('order');
            } else {
                setExistingOrder(null);
                setView('order');
                setCurrentOrderItems([]);
            }
        });
    }
  }, [isOpen, tableId]);


  const addToOrder = (item: MenuItem) => {
    if (item.stock === 0) {
        toast({ title: "Agotado", description: `${item.name} no está disponible.`, variant: "destructive" });
        return;
    }
    setCurrentOrderItems(prev => {
        const existing = prev.find(oi => oi.menuItemId === item.id);
        if (existing) {
            return prev.map(oi => oi.menuItemId === item.id ? { ...oi, quantity: oi.quantity + 1 } : oi);
        }
        return [...prev, { menuItemId: item.id, quantity: 1 }];
    });
  };
  
  const decreaseQuantity = (itemId: string) => {
      setCurrentOrderItems(prev => {
        const existing = prev.find(oi => oi.menuItemId === itemId);
        if (existing && existing.quantity > 1) {
            return prev.map(oi => oi.menuItemId === itemId ? { ...oi, quantity: oi.quantity - 1 } : oi);
        }
        return prev.filter(oi => oi.menuItemId !== itemId);
      });
  };

  const removeFromOrder = (itemId: string) => {
      setCurrentOrderItems(prev => prev.filter(oi => oi.menuItemId !== itemId));
  };


  const submitOrder = async () => {
    const time = parseInt(deliveryTime, 10);
    if (currentOrderItems.length === 0) {
        toast({ title: "Orden Vacía", description: "Agregue al menos un item para enviar el pedido.", variant: "destructive"});
        return;
    }
    if(isNaN(time) || time <= 0) {
        toast({ title: "Tiempo Inválido", description: "Por favor ingrese un tiempo de entrega válido.", variant: "destructive"});
        return;
    }
    
    const newOrder = await api.createOrder({ tableId, items: currentOrderItems, estimatedDeliveryTime: time });
    if(newOrder){
        toast({ title: "Pedido Enviado", description: `El pedido para la mesa ${tableId} ha sido enviado a la cocina.`});
        onOrderChange();
        onOpenChange(false);
    } else {
        toast({ title: "Error", description: "No se pudo crear el pedido.", variant: "destructive"});
    }
  };
  
  const handleOpenChange = async (open: boolean) => {
    if (open) {
        const table = await api.getTableById(tableId);
        if (table && table.status === 'needs-attention') {
            api.updateTableStatus(tableId, 'occupied');
            onOrderChange();
        }
    }
    if (!open) {
      setView('order');
      setCurrentOrderItems([]);
      setActiveCategory(undefined);
    }
    onOpenChange(open);
  }

  const handleConfirmDelivery = async () => {
    if (existingOrder) {
      const updatedOrder = await api.updateOrderStatus(existingOrder.id, 'delivered');
      if (updatedOrder) {
          setExistingOrder(updatedOrder);
          onOrderChange();
          toast({
            title: "Pedido Entregado",
            description: `El pedido de la mesa ${tableId} ha sido marcado como entregado.`
          });
      }
    }
  };

  const handleFreeUpTable = () => {
    if (existingOrder) {
      setView('receipt');
    }
  };

  const handlePayAndClose = async () => {
      if (existingOrder) {
        if (existingOrder.status !== 'delivered') {
            await api.updateOrderStatus(existingOrder.id, 'delivered');
        }
        await api.updateTableStatus(tableId, 'free');
        toast({ title: "Mesa Liberada", description: `La mesa ${tableId} está libre y el pedido ha sido completado.` });
        onOrderChange();
        onOpenChange(false);
      }
  }

   const handleEditClick = () => {
    if (existingOrder) {
      setCurrentOrderItems(existingOrder.items);
      setView('edit');
    }
  };

  const handleCancelClick = () => {
    setIsCancelAlertOpen(true);
  }

  const confirmCancelOrder = async () => {
     if (existingOrder) {
        await api.cancelOrder(existingOrder.id);
        toast({ title: "Pedido Cancelado", description: `El pedido de la mesa ${tableId} ha sido cancelado.` });
        onOrderChange();
        onOpenChange(false);
     }
     setIsCancelAlertOpen(false);
  };

  const handleUpdateOrder = async () => {
    if (!existingOrder) return;
    if (currentOrderItems.length === 0) {
        toast({ title: "Orden Vacía", description: "No puedes dejar un pedido sin items. Cancela el pedido si es necesario.", variant: "destructive" });
        return;
    }
    const updatedOrder = await api.editOrder(existingOrder.id, currentOrderItems);
    if(updatedOrder){
        toast({ title: "Pedido Actualizado", description: `El pedido de la mesa ${tableId} ha sido actualizado.` });
        setExistingOrder(updatedOrder);
        onOrderChange();
        setView('order');
    }
  };

  const getTotal = (items: OrderItem[]) => {
      return items.reduce((total, orderItem) => {
          const menuItem = getMenuItem(orderItem.menuItemId);
          return total + (menuItem ? menuItem.price * orderItem.quantity : 0);
      }, 0);
  };

  const menuByCategory = useMemo(() => menuItems.reduce((acc, item) => {
    if (item.stock > 0) {
        if (!acc[item.category]) {
            acc[item.category] = [];
        }
        acc[item.category].push(item);
    }
    return acc;
  }, {} as Record<MenuItem['category'], MenuItem[]>), [menuItems]);

  const orderCategories: (keyof typeof menuByCategory)[] = ['Entradas', 'Platos Fuertes', 'Platos a la Carta', 'Bebidas', 'Postres'];

  const renderReceiptView = () => {
    const orderToDisplay = existingOrder;
    if (!orderToDisplay) return null;

    const total = getTotal(orderToDisplay.items);
    const igv = total * 0.18;
    const finalTotal = total + igv;

    return (
        <div className="flex-1 flex flex-col justify-between p-6">
            <div className="p-4 border rounded-lg">
                <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold">Boleta de Venta</h3>
                    <p className="text-sm text-muted-foreground">Costa Del Sur</p>
                </div>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>Mesa:</span><span>{orderToDisplay.tableId}</span></div>
                    <div className="flex justify-between"><span>Fecha:</span><span>{new Date(orderToDisplay.createdAt).toLocaleDateString()}</span></div>
                    <div className="flex justify-between border-b pb-2 mb-2"><span>Hora:</span><span>{new Date(orderToDisplay.createdAt).toLocaleTimeString()}</span></div>
                    
                    {orderToDisplay.items.map(item => {
                        const menuItem = getMenuItem(item.menuItemId);
                        return (
                            <div key={item.menuItemId} className="flex justify-between">
                                <span>{item.quantity}x {menuItem?.name}</span>
                                <span>S/. {((menuItem?.price || 0) * item.quantity).toFixed(2)}</span>
                            </div>
                        )
                    })}

                    <div className="border-t pt-2 mt-2 space-y-1">
                        <div className="flex justify-between"><span>Subtotal:</span><span>S/. {total.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>IGV (18%):</span><span>S/. {igv.toFixed(2)}</span></div>
                        <div className="flex justify-between font-bold text-base"><span>Total a Pagar:</span><span>S/. {finalTotal.toFixed(2)}</span></div>
                    </div>
                </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
                <Button onClick={() => toast({title: "Función no implementada", description: "La impresión no está disponible en esta demo."})} variant="outline">
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimir
                </Button>
                <Button onClick={handlePayAndClose}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Marcar y Liberar
                </Button>
            </div>
        </div>
    )
  }

  const renderExistingOrderView = (order: Order) => {
    const orderTotal = getTotal(order.items);
    const isPending = order.status === 'pending';
    const isOrderReady = order.status === 'ready';
    const isOrderDelivered = order.status === 'delivered';

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <Badge 
                    className={cn({ "bg-green-500 text-white": isOrderReady, "bg-orange-500 text-white animate-pulse": isPending })}
                    variant={isOrderReady ? 'default' : 'secondary'}
                >
                    {order.status}
                </Badge>
                <span className="text-xs text-muted-foreground">hace {formatDistanceToNow(order.createdAt, {locale: es})}</span>
            </div>
            <h3 className="font-semibold mb-2">Pedido Actual</h3>
            <div className="space-y-2 mb-4">
                {order.items.map(item => {
                    const menuItem = getMenuItem(item.menuItemId);
                    return (
                        <div key={item.menuItemId} className="flex justify-between items-center text-sm">
                            <span>{menuItem?.name} x {item.quantity}</span>
                            <span>S/.{((menuItem?.price || 0) * item.quantity).toFixed(2)}</span>
                        </div>
                    );
                })}
            </div>
            <div className="font-bold text-lg flex justify-between pt-2 border-t mt-2">
                <span>Total:</span>
                <span>S/.{orderTotal.toFixed(2)}</span>
            </div>
            <div className="mt-6 space-y-2">
                 {isPending && (
                    <>
                        <Button onClick={handleEditClick} className="w-full" variant="outline">
                            <Edit className="mr-2 h-4 w-4" />
                            Añadir / Editar Pedido
                        </Button>
                        <Button onClick={handleCancelClick} className="w-full" variant="destructive">
                            <FileX className="mr-2 h-4 w-4" />
                            Cancelar Pedido
                        </Button>
                    </>
                )}
                {isOrderReady && (
                    <Button onClick={handleConfirmDelivery} className="w-full bg-green-600 hover:bg-green-700">
                        <Truck className="mr-2 h-4 w-4" />
                        Confirmar Entrega de Pedido
                    </Button>
                )}
                 {isOrderDelivered && (
                    <Button onClick={handleFreeUpTable} className="w-full">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Desocupar Mesa y Generar Boleta
                    </Button>
                )}
            </div>
        </div>
    )
  }

  const renderNewOrEditOrderView = (isEditing: boolean) => {
    const newOrderTotal = getTotal(currentOrderItems);

    return (
      <div className="h-full flex flex-col">
        <ScrollArea className="flex-1">
          <div className="p-6">
            <Accordion type="single" collapsible className="w-full" value={activeCategory} onValueChange={setActiveCategory}>
              {orderCategories.map(category => {
                const categoryItems = menuByCategory[category];
                if (!categoryItems) return null;
                const isActive = activeCategory === category;
                return (
                  <AccordionItem value={category} key={category} className={cn('mb-2 rounded-lg border-none transition-colors', { 'bg-primary/10': isActive })}>
                    <AccordionTrigger 
                      className={cn("hover:no-underline rounded-lg px-4 py-3 hover:bg-accent hover:text-accent-foreground", isActive ? 'bg-primary/10' : '')}
                    >
                      {category}
                    </AccordionTrigger>
                    <AccordionContent className="p-2">
                      <div className="space-y-2 pt-2">
                        {categoryItems.map(item => (
                          <Card key={item.id} className={cn("flex items-center justify-between p-3 rounded-lg", isActive ? 'bg-background/5' : 'bg-background/50')}>
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">S/.{item.price.toFixed(2)}</p>
                            </div>
                            <Button size="icon" variant="outline" onClick={() => addToOrder(item)}>
                              <Plus className="h-4 w-4" />
                            </Button>
                          </Card>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          </div>
        </ScrollArea>
        <div className="p-6 border-t bg-background">
             <div className="space-y-4">
                <h3 className="font-semibold">Resumen del Pedido</h3>
                {currentOrderItems.length > 0 ? (
                  <ScrollArea className="max-h-40">
                      <div className="space-y-2 pr-4">
                          {currentOrderItems.map(orderItem => {
                            const menuItem = getMenuItem(orderItem.menuItemId);
                            if (!menuItem) return null;
                            return (
                              <div key={orderItem.menuItemId} className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-sm">{menuItem.name}</p>
                                  <p className="text-xs text-muted-foreground">{orderItem.quantity} x S/.{menuItem.price.toFixed(2)}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => addToOrder(menuItem)}><PlusCircle className="h-4 w-4"/></Button>
                                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => decreaseQuantity(orderItem.menuItemId)}><MinusCircle className="h-4 w-4"/></Button>
                                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => removeFromOrder(orderItem.menuItemId)}><Trash2 className="h-4 w-4"/></Button>
                                </div>
                              </div>
                            )
                          })}
                      </div>
                  </ScrollArea>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">Añada items al pedido.</p>
                )}
                 <div className="font-bold text-lg flex justify-between pt-2 border-t">
                  <span>Total:</span>
                  <span>S/.{newOrderTotal.toFixed(2)}</span>
                </div>
                 {!isEditing && (
                    <div className="space-y-2">
                        <Label htmlFor="deliveryTime">Tiempo de Entrega (min)</Label>
                        <Input id="deliveryTime" type="number" value={deliveryTime} onChange={e => setDeliveryTime(e.target.value)} placeholder="Ej: 15" />
                    </div>
                 )}
                {isEditing ? (
                    <Button onClick={handleUpdateOrder} className="w-full" disabled={currentOrderItems.length === 0}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Actualizar y Enviar a Cocina
                    </Button>
                ) : (
                    <Button onClick={submitOrder} className="w-full" disabled={currentOrderItems.length === 0}>
                        <Send className="mr-2 h-4 w-4" />
                        Enviar Pedido a Cocina
                    </Button>
                )}
              </div>
          </div>
      </div>
    )
  }

  const renderContent = () => {
    if(view === 'receipt') return renderReceiptView();
    if(view === 'edit') return renderNewOrEditOrderView(true);
    if(existingOrder) return renderExistingOrderView(existingOrder);
    return renderNewOrEditOrderView(false);
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent className="sm:max-w-lg w-full flex flex-col p-0 overflow-y-auto">
        <SheetHeader className="p-6 pb-2 border-b">
          <SheetTitle>Mesa {tableId}</SheetTitle>
          <SheetDescription>
            {
              view === 'receipt' ? "Boleta de venta para el cliente." :
              view === 'edit' ? `Editando el pedido para la mesa ${tableId}.` :
              existingOrder ? "Gestionar pedido existente o liberar la mesa." : 
              "Tome un nuevo pedido para esta mesa."
            }
          </SheetDescription>
        </SheetHeader>
        {renderContent()}
         <AlertDialog open={isCancelAlertOpen} onOpenChange={setIsCancelAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                    Esta acción cancelará el pedido completo para la Mesa {tableId}. No se puede deshacer.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Volver</AlertDialogCancel>
                <AlertDialogAction onClick={confirmCancelOrder} className={cn(buttonVariants({variant: "destructive"}))}>
                    Confirmar Cancelación
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </SheetContent>
    </Sheet>
  );
}


export default function WaiterDashboardPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  const fetchTables = () => {
      api.getTables().then(setTables);
  }
  
  useEffect(() => {
    const interval = setInterval(fetchTables, 5000); // Poll every 5 seconds
    fetchTables(); // Initial fetch
    return () => clearInterval(interval);
  }, []);
  
  const handleDataChange = () => {
      fetchTables();
  }

  const addTable = async () => {
    if (tables.length >= 15) return;
    await api.addTable();
    fetchTables();
  }

  const removeTable = async () => {
    if (tables.length <= 8) return;
    await api.removeTable();
    fetchTables();
  }
  
  return (
    <TooltipProvider>
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold font-headline">Gestión de Mesas</h1>
                <p className="text-muted-foreground">Seleccione una mesa para ver su estado o tomar un pedido.</p>
            </div>
            <div className="flex gap-2">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={addTable} disabled={tables.length >= 15}>
                            <PlusCircle />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Añadir Mesa</p>
                    </TooltipContent>
                </Tooltip>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={removeTable} disabled={tables.length <= 8}>
                            <MinusCircle />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Eliminar Última Mesa</p>
                    </TooltipContent>
                </Tooltip>
            </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {tables.map((table) => (
            <TableCard
                key={table.id}
                tableId={table.id}
                status={table.status}
                onSelect={() => setSelectedTable(table.id)}
            />
            ))}
        </div>

        {selectedTable !== null && (
            <OrderSheet 
                tableId={selectedTable}
                isOpen={selectedTable !== null} 
                onOpenChange={(open) => !open && setSelectedTable(null)} 
                onOrderChange={handleDataChange}
            />
        )}
    </div>
    </TooltipProvider>
  );
}
