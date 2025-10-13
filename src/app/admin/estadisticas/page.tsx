'use client';

import { useState, useMemo } from 'react';
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Line, 
  LineChart, 
  ResponsiveContainer, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell,
  Area,
  AreaChart,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  DollarSign, 
  Package, 
  Eye, 
  AlertTriangle, 
  ShoppingCart, 
  TrendingUp,
  Users,
  Star,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { usePerfumes } from '@/context/PerfumeContext';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { getAllOrders } from '@/lib/orderService';
import { useEffect } from 'react';

// Colores para las gráficas
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
const CATEGORY_COLORS = {
  'Para Ella': '#EC4899',
  'Para Él': '#3B82F6', 
  'Unisex': '#10B981'
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border p-3 rounded-lg shadow-lg">
        <p className="font-semibold text-foreground">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value} {entry.dataKey === 'count' ? 'productos' : `$${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function StatisticsPage() {
  const { perfumes, statistics } = usePerfumes();
  const [activeTab, setActiveTab] = useState('overview');
  const [confirmedOrders, setConfirmedOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar órdenes confirmadas para las gráficas de ventas
  useEffect(() => {
    const loadConfirmedOrders = async () => {
      try {
        setLoading(true);
        const orders = await getAllOrders();
        
        // Filtrar solo órdenes confirmadas (aprobadas por admin)
        const confirmed = orders.filter(order => 
          order.status === 'CONFIRMADO' || 
          order.status === 'PROCESANDO' || 
          order.status === 'EN_CAMINO' ||
          order.status === 'ENTREGADO'
        );
        
        setConfirmedOrders(confirmed);
      } catch (error) {
        console.error('Error loading confirmed orders:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConfirmedOrders();
  }, []);

  // Datos mejorados para gráficas
  const categoryData = statistics.categoryDistribution;
  const priceRangeData = statistics.priceRangeDistribution;

  // Datos para gráfica de radar (análisis de categorías)
  const radarData = categoryData.map(item => ({
    subject: item.category,
    A: item.count * 10, // Escalar para mejor visualización
    fullMark: Math.max(...categoryData.map(c => c.count)) * 10,
  }));

  // Datos para gráfica de ventas confirmadas por mes
  const salesTrendData = useMemo(() => {
    const monthlySales: { [key: string]: { month: string; sales: number; revenue: number } } = {};
    
    confirmedOrders.forEach(order => {
      const date = new Date(order.orderDate);
      const monthKey = date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
      
      if (!monthlySales[monthKey]) {
        monthlySales[monthKey] = {
          month: monthKey,
          sales: 0,
          revenue: 0
        };
      }
      
      monthlySales[monthKey].sales += 1;
      monthlySales[monthKey].revenue += order.total;
    });
    
    return Object.values(monthlySales).sort((a, b) => {
      const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
      const aMonth = a.month.split(' ')[0].toLowerCase();
      const bMonth = b.month.split(' ')[0].toLowerCase();
      return months.indexOf(aMonth) - months.indexOf(bMonth);
    });
  }, [confirmedOrders]);

  // Calcular métricas adicionales
  const metrics = useMemo(() => {
    const avgPrice = perfumes.length > 0 
      ? perfumes.reduce((sum, p) => sum + p.price, 0) / perfumes.length 
      : 0;
    
    const totalStockValue = perfumes.reduce((sum, p) => sum + (p.price * p.stock), 0);
    const publishedPercentage = (statistics.publishedProducts / statistics.totalProducts) * 100;

    // Métricas de ventas reales
    const totalConfirmedSales = confirmedOrders.length;
    const totalConfirmedRevenue = confirmedOrders.reduce((sum, order) => sum + order.total, 0);
    const avgOrderValue = totalConfirmedSales > 0 ? totalConfirmedRevenue / totalConfirmedSales : 0;

    return {
      avgPrice,
      totalStockValue,
      publishedPercentage,
      totalConfirmedSales,
      totalConfirmedRevenue,
      avgOrderValue
    };
  }, [perfumes, statistics, confirmedOrders]);

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Categoría,Cantidad,Porcentaje\n" 
      + categoryData.map(e => `${e.category},${e.count},${((e.count / statistics.publishedProducts) * 100).toFixed(1)}%`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "analiticas_categorias.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const publishedPerfumes = perfumes.filter(p => p.published);

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header Mejorado */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Analytics Dashboard
          </h2>
          <p className="text-muted-foreground mt-2">
            Insights y métricas en tiempo real basadas en ventas confirmadas
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="border-primary/20">
            <Calendar className="mr-2 h-4 w-4" />
            Datos en Tiempo Real
          </Button>
          <Button onClick={handleExport} className="bg-gradient-to-r from-primary to-purple-600">
            <Download className="mr-2 h-4 w-4" />
            Exportar Reporte
          </Button>
        </div>
      </div>

      {/* Navegación por Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Ventas
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4" />
            Categorías
          </TabsTrigger>
        </TabsList>

        {/* Tab de Resumen */}
        <TabsContent value="overview" className="space-y-6">
          {/* Tarjetas de Métricas Principales */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-background to-primary/5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor Total del Inventario</CardTitle>
                <DollarSign className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${metrics.totalStockValue.toFixed(2)}</div>
                <Progress value={75} className="mt-2 h-1" />
                <p className="text-xs text-muted-foreground mt-2">
                  Basado en precios actuales y stock
                </p>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden border-green-200 bg-gradient-to-br from-background to-green-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ventas Confirmadas</CardTitle>
                <ShoppingCart className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalConfirmedSales}</div>
                <Progress value={(metrics.totalConfirmedSales / Math.max(metrics.totalConfirmedSales, 1)) * 100} className="mt-2 h-1" />
                <p className="text-xs text-muted-foreground mt-2">
                  Órdenes aprobadas por admin
                </p>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden border-orange-200 bg-gradient-to-br from-background to-orange-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ingresos por Ventas</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${metrics.totalConfirmedRevenue.toFixed(2)}</div>
                <Progress value={85} className="mt-2 h-1" />
                <p className="text-xs text-muted-foreground mt-2">
                  Total de ventas confirmadas
                </p>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden border-blue-200 bg-gradient-to-br from-background to-blue-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
                <Star className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${metrics.avgOrderValue.toFixed(2)}</div>
                <Progress value={70} className="mt-2 h-1" />
                <p className="text-xs text-muted-foreground mt-2">
                  Valor promedio por orden
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráficas Principales */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Tendencia de Ventas Confirmadas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Tendencia de Ventas Confirmadas
                </CardTitle>
                <CardDescription>Evolución mensual de ventas aprobadas</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-80">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-muted-foreground">Cargando datos de ventas...</p>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={salesTrendData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="sales" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        name="Ventas"
                        dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: '#10B981' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        name="Ingresos ($)"
                        dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: '#3B82F6' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Análisis de Categorías */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-purple-600" />
                  Análisis por Categoría
                </CardTitle>
                <CardDescription>Distribución y performance por tipo</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis />
                    <Radar
                      name="Productos"
                      dataKey="A"
                      stroke="#8B5CF6"
                      fill="#8B5CF6"
                      fillOpacity={0.6}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab de Ventas */}
        <TabsContent value="sales" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Resumen de Ventas Confirmadas</CardTitle>
                <CardDescription>Datos reales de órdenes aprobadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm font-medium text-green-800">Total Ventas</p>
                      <p className="text-2xl font-bold text-green-900">{metrics.totalConfirmedSales}</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm font-medium text-blue-800">Ingresos Totales</p>
                      <p className="text-2xl font-bold text-blue-900">${metrics.totalConfirmedRevenue.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <p className="text-sm font-medium text-gray-800">Ticket Promedio</p>
                    <p className="text-2xl font-bold text-gray-900">${metrics.avgOrderValue.toFixed(2)}</p>
                    <p className="text-xs text-gray-600 mt-1">Valor promedio por orden confirmada</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ventas por Rango de Precio</CardTitle>
                <CardDescription>Distribución de productos por precio</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={priceRangeData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="count" 
                      radius={[4, 4, 0, 0]}
                      animationBegin={0}
                      animationDuration={1500}
                    >
                      {priceRangeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab de Categorías */}
        <TabsContent value="categories" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Categoría</CardTitle>
                <CardDescription>Productos publicados por tipo de fragancia</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, count, percent }) => 
                        `${category}: ${count} (${(percent * 100).toFixed(1)}%)`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                      animationBegin={0}
                      animationDuration={1000}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={CATEGORY_COLORS[entry.category as keyof typeof CATEGORY_COLORS] || COLORS[index % COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métricas por Categoría</CardTitle>
                <CardDescription>Análisis detallado por tipo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryData.map((category, index) => {
                    const percentage = (category.count / statistics.publishedProducts) * 100;
                    return (
                      <div key={category.category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ 
                                backgroundColor: CATEGORY_COLORS[category.category as keyof typeof CATEGORY_COLORS] || COLORS[index % COLORS.length] 
                              }}
                            />
                            <span className="font-medium">{category.category}</span>
                          </div>
                          <span className="font-semibold">{category.count} productos</span>
                        </div>
                        <Progress 
                          value={percentage} 
                          className="h-2"
                          style={{
                            backgroundColor: `${CATEGORY_COLORS[category.category as keyof typeof CATEGORY_COLORS] || COLORS[index % COLORS.length]}20`
                          }}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{percentage.toFixed(1)}% del total</span>
                          <span>${(statistics.totalRevenue * (percentage / 100)).toFixed(2)} estimado</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}