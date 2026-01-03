
"use client";

import { useEffect, useState } from 'react';
import { BarChart, LineChart, PieChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart as RechartsBarChart, Line, LineChart as RechartsLineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import type { MenuItem, Order } from '@/lib/types';
import * as api from '@/lib/api';


const salesData = [
  { day: 'Lunes', sales: 0 },
  { day: 'Martes', sales: 0 },
  { day: 'Miércoles', sales: 0 },
  { day: 'Jueves', sales: 0 },
  { day: 'Viernes', sales: 0 },
  { day: 'Sábado', sales: 0 },
  { day: 'Domingo', sales: 0 },
];

const profitData = [
    { month: 'Enero', profit: 0 },
    { month: 'Febrero', profit: 0 },
    { month: 'Marzo', profit: 0 },
    { month: 'Abril', profit: 0 },
    { month: 'Mayo', profit: 0 },
    { month: 'Junio', profit: 0 },
];

export default function AdminDashboardPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    api.getMenuItems().then(setMenuItems);
    api.getOrders().then(setOrders);
  }, []);


  const topSellingItems = [...menuItems]
    .map(item => {
        const totalSold = orders.reduce((sum, order) => sum + (order.items.find(i => i.menuItemId === item.id)?.quantity || 0), 0);
        return { ...item, totalSold };
    })
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-headline">Panel de Administrador</h1>
        <p className="text-muted-foreground">Resumen de ventas, ganancias y rendimiento de platos.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales (Hoy)</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">S/.0.00</div>
            <p className="text-xs text-muted-foreground">Esperando datos...</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganancias Netas (Hoy)</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">S/.0.00</div>
             <p className="text-xs text-muted-foreground">Esperando datos...</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Completados (Hoy)</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Esperando datos...</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ventas de la Semana</CardTitle>
            <CardDescription>Resumen de las ventas diarias de la semana actual.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={salesData}>
                  <XAxis dataKey="day" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `S/.${value}`} />
                  <Tooltip content={<ChartTooltipContent />} cursor={{fill: 'hsl(var(--muted))'}} />
                  <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progresión de Ganancias</CardTitle>
            <CardDescription>Ganancias mensuales durante los últimos 6 meses.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={profitData}>
                        <XAxis dataKey="month" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `S/.${value/1000}k`} />
                        <Tooltip content={<ChartTooltipContent />} cursor={{stroke: 'hsl(var(--accent))', strokeWidth: 2, strokeDasharray: "3 3"}} />
                        <Line type="monotone" dataKey="profit" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ fill: "hsl(var(--accent))", r:4 }} activeDot={{ r: 8, style: {stroke: "hsl(var(--background))"} }} />
                    </RechartsLineChart>
                </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Platos Más Vendidos</CardTitle>
            <CardDescription>Los platos más populares entre los clientes.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plato</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Total Vendido</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topSellingItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className="text-right">{item.totalSold}</TableCell>
                  </TableRow>
                ))}
                 {topSellingItems.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                            No hay datos de ventas disponibles.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
