'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Check, X, FileText, ShieldCheck, AlertTriangle, Eye, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { OrderDTO, getAllOrders, updateOrderStatus } from '@/lib/orderService';

type Status = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';

interface Evidence {
  id: string;
  orderId: string;
  orderNumber: string;
  user: string;
  date: string;
  imageUrl: string;
  status: Status;
  orderData?: OrderDTO;
}

export default function EvidencesPage() {
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const { toast } = useToast();

  // Cargar órdenes reales desde la API
  useEffect(() => {
    const loadEvidences = async () => {
      try {
        setLoading(true);
        
        // Verificar si es admin
        const userRole = localStorage.getItem('scentalux_user_role');
        let orders: OrderDTO[] = [];
        
        if (userRole === 'ADMIN') {
          // Si es admin, obtener TODAS las órdenes
          orders = await getAllOrders();
        } else {
          // Si no es admin, obtener solo las del usuario
          const { getUserOrders } = await import('@/lib/orderService');
          orders = await getUserOrders();
        }
        
        console.log('📋 Órdenes cargadas:', orders);
        
        // Transformar órdenes a evidencias - solo las que tienen comprobante
        const evidencesData: Evidence[] = orders
          .filter(order => order.receiptImageUrl && order.receiptImageUrl.trim() !== '')
          .map(order => {
            console.log('📸 Orden con comprobante:', order.orderNumber, order.receiptImageUrl);
            
            // CORREGIDO: Todas las órdenes nuevas empiezan como PENDIENTE
            let status: Status = 'PENDIENTE';
            if (order.status === 'CONFIRMADO') {
              status = 'APROBADO';
            } else if (order.status === 'CANCELADO') {
              status = 'RECHAZADO';
            }

            // CORREGIR LA URL DE LA IMAGEN - agregar el dominio si es necesario
            let imageUrl = order.receiptImageUrl || '';
            if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
              // Si es una ruta relativa, agregar el dominio del backend
              const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
              if (API_URL) {
                imageUrl = `${API_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
              }
            }

            return {
              id: `EV${order.id.toString().padStart(3, '0')}`,
              orderId: order.id.toString(),
              orderNumber: order.orderNumber,
              user: order.customerName,
              date: new Date(order.orderDate).toISOString().split('T')[0],
              imageUrl: imageUrl,
              status: status,
              orderData: order
            };
          });

        console.log('🔍 Evidencias encontradas:', evidencesData.length);
        setEvidences(evidencesData);
        
      } catch (error: any) {
        console.error('Error loading evidences:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las evidencias: ' + error.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadEvidences();
  }, [toast]);

  const handleStatusChange = async (orderId: string, newStatus: Status) => {
    try {
      setUpdatingOrder(orderId);
      
      // Mapear el estado de evidencia al estado de orden
      let orderStatus = '';
      switch (newStatus) {
        case 'APROBADO':
          orderStatus = 'CONFIRMADO';
          break;
        case 'RECHAZADO':
          orderStatus = 'CANCELADO';
          break;
        case 'PENDIENTE':
          orderStatus = 'PENDIENTE';
          break;
      }
      
      // Actualizar el estado en el backend
      await updateOrderStatus(parseInt(orderId), orderStatus);
      
      // Actualizar el estado local
      setEvidences(evidences.map(e => 
        e.orderId === orderId ? { ...e, status: newStatus } : e
      ));

      toast({
        title: `Evidencia ${newStatus.toLowerCase()}`,
        description: `El comprobante de pago ha sido marcado como ${newStatus.toLowerCase()}.`,
      });
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setUpdatingOrder(null);
    }
  };

  const getStatusVariant = (status: Status) => {
    switch (status) {
      case 'APROBADO': return 'default';
      case 'RECHAZADO': return 'destructive';
      case 'PENDIENTE': return 'secondary';
    }
  };

  const getStatusIcon = (status: Status) => {
    switch (status) {
      case 'APROBADO': return <ShieldCheck className="h-3 w-3 mr-1" />;
      case 'RECHAZADO': return <X className="h-3 w-3 mr-1" />;
      case 'PENDIENTE': return <AlertTriangle className="h-3 w-3 mr-1" />;
    }
  };

  const getStatusText = (status: Status) => {
    switch (status) {
      case 'APROBADO': return 'Aprobado';
      case 'RECHAZADO': return 'Rechazado';
      case 'PENDIENTE': return 'Pendiente';
    }
  };

  const pendingCount = evidences.filter(e => e.status === 'PENDIENTE').length;
  const approvedCount = evidences.filter(e => e.status === 'APROBADO').length;
  const rejectedCount = evidences.filter(e => e.status === 'RECHAZADO').length;

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">Cargando evidencias...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Validación de Pagos
          </h2>
          <p className="text-foreground/60 mt-2">Revisa y valida los comprobantes de pago de los clientes</p>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-foreground">{evidences.length}</div>
            <div className="text-sm text-foreground/60">Total evidencias</div>
          </div>
        </div>
      </div>

      {/* Tarjetas de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={cn(
          "rounded-2xl border-2 p-6 transition-all duration-300 hover:shadow-lg",
          pendingCount > 0 
            ? "border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800" 
            : "border-primary/20 bg-primary/5"
        )}>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{pendingCount}</div>
              <div className="text-sm text-foreground/60">Pendientes</div>
            </div>
          </div>
        </div>

        <div className={cn(
          "rounded-2xl border-2 p-6 transition-all duration-300 hover:shadow-lg",
          approvedCount > 0 
            ? "border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800" 
            : "border-primary/20 bg-primary/5"
        )}>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{approvedCount}</div>
              <div className="text-sm text-foreground/60">Aprobados</div>
            </div>
          </div>
        </div>

        <div className={cn(
          "rounded-2xl border-2 p-6 transition-all duration-300 hover:shadow-lg",
          rejectedCount > 0 
            ? "border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800" 
            : "border-primary/20 bg-primary/5"
        )}>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <X className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{rejectedCount}</div>
              <div className="text-sm text-foreground/60">Rechazados</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Evidencias */}
      <div className="rounded-2xl border border-primary/20 bg-white/50 backdrop-blur-sm shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-6 border-b border-primary/10">
          <h3 className="text-2xl font-bold text-foreground">Evidencias de Pago</h3>
          <p className="text-foreground/60 mt-1">
            {evidences.length} comprobantes • {pendingCount} requieren revisión
          </p>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow className="bg-primary/5 hover:bg-primary/10">
              <TableHead className="font-bold text-foreground text-sm uppercase">ID Evidencia</TableHead>
              <TableHead className="font-bold text-foreground text-sm uppercase">Pedido</TableHead>
              <TableHead className="font-bold text-foreground text-sm uppercase">Usuario</TableHead>
              <TableHead className="font-bold text-foreground text-sm uppercase">Fecha</TableHead>
              <TableHead className="font-bold text-foreground text-sm uppercase">Estado</TableHead>
              <TableHead className="font-bold text-foreground text-sm uppercase text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {evidences.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-16">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="h-20 w-20 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <FileText className="h-10 w-10 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-semibold text-foreground">No hay evidencias pendientes</p>
                      <p className="text-foreground/60 mt-1">Todos los comprobantes han sido revisados</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              evidences.map((evidence) => (
                <TableRow 
                  key={evidence.id} 
                  className={cn(
                    "hover:bg-primary/5 transition-all duration-200 group",
                    evidence.status === 'PENDIENTE' && "bg-amber-50 dark:bg-amber-950/10 border-l-4 border-l-amber-400",
                    evidence.status === 'RECHAZADO' && "bg-red-50 dark:bg-red-950/10 border-l-4 border-l-red-400",
                    evidence.status === 'APROBADO' && "bg-green-50 dark:bg-green-950/10 border-l-4 border-l-green-400"
                  )}
                >
                  <TableCell className="font-medium text-foreground/80">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary/60" />
                      {evidence.id}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-foreground">
                    {evidence.orderNumber}
                  </TableCell>
                  <TableCell className="text-foreground/70">
                    {evidence.user}
                  </TableCell>
                  <TableCell className="text-foreground/70">
                    {evidence.date}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={getStatusVariant(evidence.status)}
                      className={cn(
                        "px-3 py-2 text-sm font-semibold shadow-sm border flex items-center w-fit",
                        evidence.status === 'APROBADO' && "bg-green-100 text-green-700 border-green-200 hover:bg-green-200",
                        evidence.status === 'RECHAZADO' && "bg-red-100 text-red-700 border-red-200 hover:bg-red-200",
                        evidence.status === 'PENDIENTE' && "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200"
                      )}
                    >
                      {getStatusIcon(evidence.status)}
                      {getStatusText(evidence.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-primary/20 hover:border-primary/40 hover:bg-primary/10 transition-all duration-200 rounded-lg"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Comprobante
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto border-0 bg-transparent shadow-none">
                        <div className="bg-background rounded-2xl border border-primary/20 shadow-2xl overflow-hidden">
                          <div className="bg-gradient-to-r from-primary/5 to-primary/10 py-4 px-8 border-b border-primary/10">
                            <DialogHeader className="text-center">
                              <DialogTitle className="text-2xl font-bold text-foreground flex items-center justify-center gap-3">
                                <div className="p-2 bg-primary/20 rounded-full">
                                  <FileText className="h-6 w-6 text-primary" />
                                </div>
                                Comprobante de Pago
                              </DialogTitle>
                              <p className="text-foreground/60 mt-2">
                                {evidence.user} - {evidence.orderNumber}
                              </p>
                              {evidence.orderData && (
                                <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="font-semibold">Total:</span> ${evidence.orderData.total.toFixed(2)}
                                  </div>
                                  <div>
                                    <span className="font-semibold">Método:</span> {evidence.orderData.paymentMethod}
                                  </div>
                                  <div className="col-span-2">
                                    <span className="font-semibold">Estado actual:</span> 
                                    <Badge 
                                      variant={getStatusVariant(evidence.status)}
                                      className="ml-2"
                                    >
                                      {getStatusText(evidence.status)}
                                    </Badge>
                                  </div>
                                </div>
                              )}
                            </DialogHeader>
                          </div>
                          <div className="p-8">
                            <div className="relative h-[600px] w-full rounded-xl border-2 border-dashed border-primary/20 overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10">
                              {evidence.imageUrl ? (
                                <Image 
                                  src={evidence.imageUrl} 
                                  alt={`Comprobante de ${evidence.orderNumber}`} 
                                  fill 
                                  className="object-contain" 
                                  onError={(e) => {
                                    // Si hay error al cargar la imagen, mostrar mensaje
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                      const errorDiv = document.createElement('div');
                                      errorDiv.className = 'flex items-center justify-center h-full text-red-500';
                                      errorDiv.innerHTML = `
                                        <div class="text-center">
                                          <FileText class="h-16 w-16 mx-auto mb-2 text-red-300" />
                                          <p class="font-semibold">Error al cargar la imagen</p>
                                          <p class="text-sm text-red-400">URL: ${evidence.imageUrl}</p>
                                          <p class="text-xs text-red-300 mt-2">Verifique que la imagen exista en el servidor</p>
                                        </div>
                                      `;
                                      parent.appendChild(errorDiv);
                                    }
                                  }}
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                  <div className="text-center">
                                    <FileText className="h-16 w-16 mx-auto mb-2 text-gray-300" />
                                    <p className="font-semibold">No hay comprobante disponible</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    {/* CORREGIDO: Botones siempre visibles para que el admin pueda cambiar entre estados libremente */}
                    <div className="inline-flex gap-2 ml-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        disabled={updatingOrder === evidence.orderId}
                        className={cn(
                          "h-9 w-9 border-green-200 hover:shadow-md transition-all duration-200 rounded-lg",
                          evidence.status === 'APROBADO' 
                            ? "bg-green-200 text-green-700 border-green-300" 
                            : "bg-green-100 text-green-700 hover:bg-green-200 hover:border-green-300"
                        )}
                        onClick={() => handleStatusChange(evidence.orderId, 'APROBADO')}
                      >
                        {updatingOrder === evidence.orderId ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        disabled={updatingOrder === evidence.orderId}
                        className={cn(
                          "h-9 w-9 border-red-200 hover:shadow-md transition-all duration-200 rounded-lg",
                          evidence.status === 'RECHAZADO' 
                            ? "bg-red-200 text-red-700 border-red-300" 
                            : "bg-red-100 text-red-700 hover:bg-red-200 hover:border-red-300"
                        )}
                        onClick={() => handleStatusChange(evidence.orderId, 'RECHAZADO')}
                      >
                        {updatingOrder === evidence.orderId ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Alerta de Pendientes */}
      {pendingCount > 0 && (
        <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 shadow-lg p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-amber-800 dark:text-amber-200">
                Comprobantes Pendientes de Revisión
              </h4>
              <p className="text-amber-700 dark:text-amber-300 mt-1">
                Tienes <strong>{pendingCount} comprobantes</strong> esperando validación. 
                Revisa cada evidencia y aprueba o rechaza según corresponda.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Instrucciones para el Admin */}
      <div className="rounded-2xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 shadow-lg p-6">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-bold text-blue-800">Instrucciones para Validación</h4>
            <div className="mt-2 space-y-2 text-blue-700">
              <p><strong>✅ Aprobar:</strong> El comprobante es válido y el pago está confirmado.</p>
              <p><strong>❌ Rechazar:</strong> El comprobante es inválido, incompleto o el pago no se verificó.</p>
              <p><strong>🔄 Cambiar estado:</strong> Puedes cambiar entre estados en cualquier momento.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}