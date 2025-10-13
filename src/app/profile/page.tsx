'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Home, 
  ShoppingBag, 
  Calendar, 
  DollarSign, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock,
  Edit3,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Settings,
  Loader2
} from 'lucide-react';
import { OrderDTO, getUserOrders } from '@/lib/orderService';
import { useCart } from '@/context/CartContext';

interface UserData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  joinDate: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { cartItems } = useCart();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loggedIn = localStorage.getItem('scentalux_auth_status') === 'true';
    setIsAuthenticated(loggedIn);
    
    if (!loggedIn) {
      router.replace('/login');
      return;
    }

    const loadUserData = async () => {
      try {
        const username = localStorage.getItem('username');
        
        // Datos del usuario desde localStorage
        const user: UserData = {
          name: username || 'Usuario',
          email: username || 'usuario@example.com',
          phone: '+51 987 654 321',
          address: 'Av. Principal 123, Lima',
          joinDate: '2024-01-15'
        };

        setUserData(user);

        // Cargar pedidos reales desde la API
        const userOrders = await getUserOrders();
        setOrders(userOrders);
        
      } catch (error) {
        console.error('Error loading user data:', error);
        // En caso de error, mantener array vacío
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [router]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ENTREGADO':
      case 'Entregado': 
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'EN_CAMINO':
      case 'En Camino': 
        return <Truck className="h-4 w-4 text-blue-500" />;
      case 'PROCESANDO':
      case 'Procesando': 
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'CANCELADO':
      case 'Cancelado': 
        return <Package className="h-4 w-4 text-red-500" />;
      case 'PENDIENTE':
      case 'CONFIRMADO':
      default:
        return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ENTREGADO':
      case 'Entregado': 
        return 'default';
      case 'EN_CAMINO':
      case 'En Camino': 
        return 'secondary';
      case 'PROCESANDO':
      case 'Procesando': 
        return 'outline';
      case 'CANCELADO':
      case 'Cancelado': 
        return 'destructive';
      case 'PENDIENTE':
      case 'CONFIRMADO':
      default:
        return 'outline';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'PENDIENTE': 'Pendiente',
      'CONFIRMADO': 'Confirmado',
      'PROCESANDO': 'Procesando',
      'EN_CAMINO': 'En Camino',
      'ENTREGADO': 'Entregado',
      'CANCELADO': 'Cancelado'
    };
    return statusMap[status] || status;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateStats = () => {
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
    
    // CORREGIDO: Contar como completados solo los pedidos CONFIRMADOS, EN_CAMINO y ENTREGADOS
    const completedOrders = orders.filter(o => 
      o.status === 'CONFIRMADO' || 
      o.status === 'EN_CAMINO' || 
      o.status === 'ENTREGADO'
    ).length;
    
    // CORREGIDO: Pedidos activos son los que están en proceso (no cancelados ni pendientes)
    const activeOrders = orders.filter(o => 
      o.status === 'PROCESANDO' || 
      o.status === 'EN_CAMINO'
    ).length;
    
    return { 
      totalSpent, 
      completedOrders, 
      activeOrders, 
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'PENDIENTE').length
    };
  };

  const stats = calculateStats();

  if (!isAuthenticated || loading) {
    return (
      <div className="container mx-auto max-w-6xl py-12">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Cargando perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="container mx-auto max-w-6xl py-12">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">No se pudo cargar la información del usuario</p>
          <Button asChild className="mt-4">
            <Link href="/">Volver al Inicio</Link>
          </Button>
        </div>
      </div>
    );
  }

  const fullName = userData.name;
  const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="container mx-auto max-w-6xl py-8">
      {/* Header del Perfil */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-28 w-28 border-4 border-background shadow-2xl">
                <AvatarImage src={`https://picsum.photos/seed/${userData.email}/200/200`} alt={fullName} />
                <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-primary to-purple-600 text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 h-6 w-6 bg-green-500 rounded-full border-4 border-background"></div>
            </div>
            <div className="space-y-2">
              <h1 className="font-headline text-4xl font-light text-foreground">
                {fullName}
              </h1>
              <p className="text-lg text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {userData.email}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Miembro desde {formatDate(userData.joinDate)}
                </span>
                <span className="flex items-center gap-1">
                  <ShoppingBag className="h-4 w-4" />
                  {stats.totalOrders} pedidos
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline" className="border-primary/20 hover:border-primary/40">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Ir a Inicio
              </Link>
            </Button>
            <Button className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
              <Edit3 className="mr-2 h-4 w-4" />
              Editar Perfil
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Principal - Pedidos */}
        <div className="lg:col-span-2 space-y-8">
          {/* Estadísticas Rápidas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Gastado</p>
                    <p className="text-2xl font-bold text-foreground">${stats.totalSpent.toFixed(2)}</p>
                  </div>
                  <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pedidos Completados</p>
                    <p className="text-2xl font-bold text-foreground">{stats.completedOrders}</p>
                    <p className="text-xs text-muted-foreground">
                      Confirmados y enviados
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Carrito Actual</p>
                    <p className="text-2xl font-bold text-foreground">{cartItems.length}</p>
                    <p className="text-xs text-muted-foreground">artículos</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Historial de Pedidos */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-headline text-2xl flex items-center gap-3">
                    <ShoppingBag className="h-6 w-6 text-primary" />
                    Historial de Pedidos
                  </CardTitle>
                  <CardDescription>Tus compras reales en Scenta Lux</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-sm">
                    {stats.totalOrders} total
                  </Badge>
                  <Badge variant="outline" className="text-sm bg-green-50 text-green-700">
                    {stats.completedOrders} completados
                  </Badge>
                  {stats.pendingOrders > 0 && (
                    <Badge variant="outline" className="text-sm bg-amber-50 text-amber-700">
                      {stats.pendingOrders} pendientes
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-4 p-6">
                {orders.map((order) => (
                  <div 
                    key={order.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 group"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <Package className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {order.orderNumber}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(order.orderDate)}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {order.items.slice(0, 2).map((item, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {item.perfumeName}
                              </Badge>
                            ))}
                            {order.items.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{order.items.length - 2} más
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-lg text-foreground">${order.total.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.items.reduce((sum, item) => sum + item.quantity, 0)} artículos
                        </p>
                      </div>
                      <Badge 
                        variant={getStatusVariant(order.status)} 
                        className="flex items-center gap-1.5 px-3 py-1.5 min-w-[120px] justify-center"
                      >
                        {getStatusIcon(order.status)}
                        {getStatusText(order.status)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              
              {orders.length === 0 && (
                <div className="text-center py-12">
                  <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-semibold text-foreground">No hay pedidos aún</p>
                  <p className="text-muted-foreground mt-1">Realiza tu primera compra para ver tu historial aquí</p>
                  <Button asChild className="mt-4">
                    <Link href="/">Explorar Productos</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Información de la Cuenta */}
        <div className="space-y-6">
          {/* Información Personal */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="font-headline text-xl flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5">
                  <Mail className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-foreground">{userData.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5">
                  <Phone className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                    <p className="text-foreground">{userData.phone || 'No especificado'}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5">
                  <MapPin className="h-4 w-4 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Dirección</p>
                    <p className="text-foreground">{userData.address || 'No especificada'}</p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <Button variant="outline" className="w-full border-primary/20 hover:border-primary/40">
                <Settings className="mr-2 h-4 w-4" />
                Gestionar Cuenta
              </Button>
            </CardContent>
          </Card>

          {/* Acciones Rápidas */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="font-headline text-xl">Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild variant="outline" className="w-full justify-start border-primary/20 hover:border-primary/40">
                <Link href="/categories">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Seguir Comprando
                </Link>
              </Button>
              
              {cartItems.length > 0 && (
                <Button asChild variant="outline" className="w-full justify-start border-primary/20 hover:border-primary/40">
                  <Link href="/checkout">
                    <Package className="mr-2 h-4 w-4" />
                    Finalizar Compra ({cartItems.length})
                  </Link>
                </Button>
              )}
              
              <Button asChild variant="outline" className="w-full justify-start border-primary/20 hover:border-primary/40">
                <Link href="/asesoria">
                  <User className="mr-2 h-4 w-4" />
                  Asesoría Personalizada
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Resumen de Estados */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="font-headline text-xl">Resumen de Estados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Confirmados</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {orders.filter(o => o.status === 'CONFIRMADO').length}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">En Proceso</span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {orders.filter(o => o.status === 'PROCESANDO').length}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">En Camino</span>
                <Badge variant="outline" className="bg-purple-50 text-purple-700">
                  {orders.filter(o => o.status === 'EN_CAMINO').length}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pendientes</span>
                <Badge variant="outline" className="bg-amber-50 text-amber-700">
                  {stats.pendingOrders}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}