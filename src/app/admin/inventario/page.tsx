'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Bell, AlertTriangle, Package, TrendingDown } from 'lucide-react';
import { usePerfumes } from '@/context/PerfumeContext';
import { cn } from '@/lib/utils';

export default function InventoryPage() {
  const { perfumes: inventory } = usePerfumes();
  
  const lowStockItems = inventory.filter(p => p.stock < 5);
  const outOfStockItems = inventory.filter(p => p.stock === 0);
  
  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Gestión de Inventario
          </h2>
          <p className="text-foreground/60 mt-2">Control y monitoreo en tiempo real de tu stock</p>
        </div>
        <div className="flex gap-3">
          <div className="text-right">
            <div className="text-2xl font-bold text-foreground">{inventory.length}</div>
            <div className="text-sm text-foreground/60">Productos totales</div>
          </div>
        </div>
      </div>

      {/* Alertas de Estado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Alert className={cn(
          "border-2 transition-all duration-300 hover:shadow-lg",
          lowStockItems.length > 0 ? "border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800" : "border-primary/20 bg-primary/5"
        )}>
          <TrendingDown className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-foreground">Stock Bajo</AlertTitle>
          <AlertDescription className="font-semibold text-amber-700 dark:text-amber-300">
            {lowStockItems.length} productos con stock bajo
          </AlertDescription>
        </Alert>

        <Alert className={cn(
          "border-2 transition-all duration-300 hover:shadow-lg",
          outOfStockItems.length > 0 ? "border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800" : "border-primary/20 bg-primary/5"
        )}>
          <Package className="h-5 w-5 text-red-600 dark:text-red-400" />
          <AlertTitle className="text-foreground">Sin Stock</AlertTitle>
          <AlertDescription className="font-semibold text-red-700 dark:text-red-300">
            {outOfStockItems.length} productos agotados
          </AlertDescription>
        </Alert>

        <Alert className="border-2 border-primary/20 bg-primary/5 hover:shadow-lg transition-all duration-300">
          <Bell className="h-5 w-5 text-primary" />
          <AlertTitle className="text-foreground">Actualización en Tiempo Real</AlertTitle>
          <AlertDescription>
            El stock se actualiza automáticamente
          </AlertDescription>
        </Alert>
      </div>

      {/* Tabla de Inventario */}
      <div className="rounded-2xl border border-primary/20 bg-white/50 backdrop-blur-sm shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-6 border-b border-primary/10">
          <h3 className="text-2xl font-bold text-foreground">Inventario de Perfumes</h3>
          <p className="text-foreground/60 mt-1">
            {inventory.length} productos • {lowStockItems.length} necesitan atención
          </p>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow className="bg-primary/5 hover:bg-primary/10">
              <TableHead className="font-bold text-foreground text-sm uppercase">ID</TableHead>
              <TableHead className="font-bold text-foreground text-sm uppercase">Producto</TableHead>
              <TableHead className="font-bold text-foreground text-sm uppercase">Marca</TableHead>
              <TableHead className="font-bold text-foreground text-sm uppercase text-right">Estado del Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-16">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="h-20 w-20 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <Package className="h-10 w-10 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-semibold text-foreground">No hay productos en inventario</p>
                      <p className="text-foreground/60 mt-1">Agrega productos para comenzar a gestionar tu inventario</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              inventory.map((perfume) => (
                <TableRow 
                  key={perfume.id} 
                  className={cn(
                    "hover:bg-primary/5 transition-all duration-200 group",
                    perfume.stock === 0 && "bg-red-50 dark:bg-red-950/10 border-l-4 border-l-red-400",
                    perfume.stock < 5 && perfume.stock > 0 && "bg-amber-50 dark:bg-amber-950/10 border-l-4 border-l-amber-400"
                  )}
                >
                  <TableCell className="font-medium text-foreground/80">
                    #{perfume.id}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 relative rounded-lg overflow-hidden border border-primary/10 shadow-sm group-hover:shadow-md transition-shadow bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
                        <Package className="h-6 w-6 text-primary/60" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {perfume.name}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground/70">
                    {perfume.brand}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-3">
                      {perfume.stock < 5 && (
                        <AlertTriangle className={cn(
                          "h-5 w-5",
                          perfume.stock === 0 ? "text-red-500" : "text-amber-500"
                        )} />
                      )}
                      <Badge className={cn(
                        "px-3 py-2 text-sm font-semibold shadow-sm border min-w-[100px]",
                        perfume.stock > 20 
                          ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200" 
                          : perfume.stock > 5 
                          ? "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200"
                          : perfume.stock > 0 
                          ? "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200"
                          : "bg-red-100 text-red-700 border-red-200 hover:bg-red-200"
                      )}>
                        {perfume.stock === 0 ? (
                          "🔄 Agotado"
                        ) : perfume.stock < 5 ? (
                          "⚠️ Bajo Stock"
                        ) : perfume.stock < 10 ? (
                          "📦 Stock Moderado"
                        ) : (
                          "✅ Stock Bueno"
                        )}
                      </Badge>
                      <span className={cn(
                        "font-bold text-lg min-w-[60px]",
                        perfume.stock === 0 
                          ? "text-red-600 dark:text-red-400" 
                          : perfume.stock < 5 
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-foreground"
                      )}>
                        {perfume.stock} unidades
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Alerta General de Stock Bajo */}
      {lowStockItems.length > 0 && (
        <Alert variant="destructive" className="border-2 border-red-200 bg-gradient-to-r from-red-50 to-amber-50 dark:from-red-950/20 dark:to-amber-950/20 shadow-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400 mt-0.5" />
            <div className="flex-1">
              <AlertTitle className="text-red-800 dark:text-red-200 text-lg">
                ¡Atención Requerida!
              </AlertTitle>
              <AlertDescription className="text-red-700 dark:text-red-300">
                <strong>{lowStockItems.length} productos</strong> tienen stock bajo (menos de 5 unidades). 
                {outOfStockItems.length > 0 && ` ${outOfStockItems.length} de ellos están completamente agotados.`}
                Se recomienda reabastecer pronto para evitar interrupciones en las ventas.
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}
    </div>
  );
}