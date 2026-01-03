"use client";
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UtensilsCrossed, Clock, Check, ChefHat } from 'lucide-react';
import type { Order, MenuItem } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import * as api from '@/lib/api';

function OrderCard({ order, onUpdateStatus }: { order: Order; onUpdateStatus: (orderId: string, status: Order['status']) => void; }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    api.getMenuItems().then(setMenuItems);
  }, []);

  const getMenuItem = (id: string) => menuItems.find(item => item.id === id);
  
  const timeAgo = formatDistanceToNow(order.createdAt, { addSuffix: true, locale: es });

  return (
    <Card className="mb-4 bg-card/80">
      <CardHeader className="flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-bold">Mesa {order.tableId}</CardTitle>
        <span className="text-xs text-muted-foreground">{timeAgo}</span>
      </CardHeader>
      <CardContent className="pt-2">
        <ul className="space-y-1 text-sm mb-4">
          {order.items.map((item) => {
            const menuItem = getMenuItem(item.menuItemId);
            return <li key={item.menuItemId}>{item.quantity}x {menuItem?.name || 'Item desconocido'}</li>;
          })}
        </ul>
        <div className="flex gap-2">
          {order.status === 'pending' && (
            <Button size="sm" className="w-full" onClick={() => onUpdateStatus(order.id, 'preparing')}>
              <ChefHat className="mr-2 h-4 w-4" />
              Empezar
            </Button>
          )}
          {order.status === 'preparing' && (
            <Button size="sm" className="w-full" onClick={() => onUpdateStatus(order.id, 'ready')}>
              <Check className="mr-2 h-4 w-4" />
              Marcar como Listo
            </Button>
          )}
          {order.status === 'ready' && (
            <p className="text-sm font-semibold text-green-600">Esperando recojo...</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

const statusConfig: Record<Order['status'], { title: string, icon: React.ElementType, bg: string }> = {
    pending: { title: 'Pendiente', icon: Clock, bg: 'bg-red-50' },
    preparing: { title: 'En Preparación', icon: ChefHat, bg: 'bg-yellow-50' },
    ready: { title: 'Listo para Entregar', icon: Check, bg: 'bg-green-50' },
    delivered: { title: 'Entregado', icon: Check, bg: '' },
    cancelled: { title: 'Cancelado', icon: Check, bg: '' },
};


export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // In a real app, this would be a WebSocket subscription
    const interval = setInterval(() => {
        api.getOrders().then(setOrders);
    }, 5000); // Poll every 5 seconds
    api.getOrders().then(setOrders); // Initial fetch
    return () => clearInterval(interval);
  }, []);
  
  const handleUpdateStatus = async (orderId: string, status: Order['status']) => {
    const updatedOrder = await api.updateOrderStatus(orderId, status);
    if(updatedOrder) {
        setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
    }
  }

  const relevantStatuses: Order['status'][] = ['pending', 'preparing', 'ready'];

  const ordersByStatus = relevantStatuses.reduce((acc, status) => {
    acc[status] = orders.filter(order => order.status === status)
      .sort((a, b) => a.createdAt - b.createdAt);
    return acc;
  }, {} as Record<Order['status'], Order[]>);

  return (
    <div className="space-y-6 h-full flex flex-col">
       <div className="flex items-center gap-4">
        <UtensilsCrossed className="h-8 w-8 text-primary" />
        <div>
            <h1 className="text-3xl font-bold font-headline">Panel de Cocina</h1>
            <p className="text-muted-foreground">Gestiona los pedidos de los clientes en tiempo real.</p>
        </div>
      </div>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
        {relevantStatuses.map(status => {
            const config = statusConfig[status];
            const Icon = config.icon;
            return (
                <div key={status} className={`rounded-lg p-4 ${config.bg}`}>
                    <div className="flex items-center gap-2 mb-4">
                        <Icon className="h-5 w-5 text-foreground"/>
                        <h2 className="text-lg font-semibold">{config.title} ({ordersByStatus[status].length})</h2>
                    </div>
                    <div className="h-full overflow-y-auto">
                        {ordersByStatus[status].length > 0 ? (
                            ordersByStatus[status].map(order => <OrderCard key={order.id} order={order} onUpdateStatus={handleUpdateStatus}/>)
                        ) : (
                            <div className="text-center text-muted-foreground mt-8">
                                <p>No hay pedidos en este estado.</p>
                            </div>
                        )}
                    </div>
                </div>
            )
        })}
      </div>
    </div>
  );
}
