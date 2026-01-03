"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { PackageOpen, Save, X } from 'lucide-react';
import type { MenuItem } from '@/lib/types';
import * as api from '@/lib/api';

export default function InventoryPage() {
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [editedStocks, setEditedStocks] = useState<Record<string, number | string>>({});

  useEffect(() => {
    api.getMenuItems().then(setMenuItems);
  }, []);

  const handleStockChange = (itemId: string, value: string) => {
    setEditedStocks(prev => ({ ...prev, [itemId]: value }));
  };

  const handleSaveStock = async (itemId: string) => {
    const newStockStr = editedStocks[itemId];
    if (newStockStr === undefined || newStockStr === '') return;
    
    const newStock = parseInt(String(newStockStr), 10);
    if (isNaN(newStock) || newStock < 0) {
      toast({
        title: "Error",
        description: "Por favor ingrese un número válido para el stock.",
        variant: "destructive"
      });
      return;
    }

    const updatedItem = await api.updateMenuItemStock(itemId, newStock);
    if (updatedItem) {
        setMenuItems(prev => prev.map(item => item.id === itemId ? updatedItem : item));
        toast({
          title: "Inventario Actualizado",
          description: `El stock para el ítem ha sido actualizado a ${newStock}.`,
        });
        setEditedStocks(prev => {
          const newState = { ...prev };
          delete newState[itemId];
          return newState;
        });
    } else {
        toast({ title: "Error", description: "No se pudo actualizar el stock.", variant: "destructive" });
    }
  };
  
  const handleToggleAvailability = async (item: MenuItem) => {
    const newStock = item.stock > 0 ? 0 : 10; // Simple toggle logic
    const updatedItem = await api.updateMenuItemStock(item.id, newStock);
     if (updatedItem) {
        setMenuItems(prev => prev.map(i => i.id === item.id ? updatedItem : i));
        toast({
          title: "Disponibilidad Cambiada",
          description: `${item.name} ahora está ${newStock > 0 ? 'disponible' : 'no disponible'}.`,
        });
     }
  }

  const cancelEdit = (itemId: string) => {
     setEditedStocks(prev => {
      const newState = { ...prev };
      delete newState[itemId];
      return newState;
    });
  }

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
        <PackageOpen className="h-8 w-8 text-primary" />
        <div>
            <h1 className="text-3xl font-bold font-headline">Gestión de Inventario</h1>
            <p className="text-muted-foreground">Actualiza el stock y la disponibilidad de los platos del menú.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Control de Platos</CardTitle>
          <CardDescription>
            Gestiona la disponibilidad y las existencias de cada plato.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plato</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-center">Stock Actual</TableHead>
                <TableHead>Nuevo Stock</TableHead>
                <TableHead className="text-center">Disponible</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menuItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell className="text-right">S/.{item.price.toFixed(2)}</TableCell>
                  <TableCell className="text-center">
                    <span className={item.stock <= 5 && item.stock > 0 ? 'text-destructive font-bold' : ''}>
                      {item.stock}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={editedStocks[item.id] ?? ''}
                        onChange={(e) => handleStockChange(item.id, e.target.value)}
                        className="h-9 w-24"
                        placeholder={String(item.stock)}
                      />
                      {editedStocks[item.id] !== undefined && (
                        <>
                          <Button size="icon" className="h-9 w-9" onClick={() => handleSaveStock(item.id)}>
                            <Save className="h-4 w-4" />
                          </Button>
                           <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => cancelEdit(item.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                        checked={item.stock > 0}
                        onCheckedChange={() => handleToggleAvailability(item)}
                        aria-label={`Marcar ${item.name} como ${item.stock > 0 ? 'no disponible' : 'disponible'}`}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
            {menuItems.length === 0 && (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">No hay platos en el menú para gestionar.</p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
