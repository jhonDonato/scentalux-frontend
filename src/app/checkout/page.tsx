'use client';

import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { usePerfumes } from '@/context/PerfumeContext';
import Image from 'next/image';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { File, Loader2 } from 'lucide-react';
import { createOrder, uploadReceiptFile, uploadReceipt, CreateOrderDTO } from '@/lib/orderService';
import { ImageUpload } from '@/components/ui/image-upload'; // Asegúrate de tener este componente

export default function CheckoutPage() {
  const { cartItems, clearCart } = useCart();
  const { getPerfumeById } = usePerfumes();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('YAPE');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string>('');

  useEffect(() => {
    if (cartItems.length === 0) {
      router.replace('/');
    }
  }, [cartItems, router]);

  const detailedCartItems = cartItems.map(item => {
    const perfume = getPerfumeById(item.id);
    return perfume ? { ...item, perfume } : null;
  }).filter(Boolean);

  const subtotal = detailedCartItems.reduce((total, item) => {
    if (!item) return total;
    return total + item.perfume.price * item.quantity;
  }, 0);

  const taxes = subtotal * 0.08;
  const total = subtotal + taxes;

  const handleImageChange = (file: File | null, previewUrl: string) => {
    setReceiptFile(file);
    setReceiptPreview(previewUrl);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      
      // Crear el objeto de orden
      const orderData: CreateOrderDTO = {
        items: detailedCartItems.map(item => ({
          perfumeId: parseInt(item!.id),
          quantity: item!.quantity
        })),
        paymentMethod: selectedPaymentMethod,
        customerName: formData.get('name') as string,
        shippingAddress: formData.get('address') as string,
        city: formData.get('city') as string,
        postalCode: formData.get('zip') as string,
        phone: formData.get('phone') as string || ''
      };

      console.log('📦 Creando orden...');
      
      // 1. Crear la orden en el backend
      const order = await createOrder(orderData);
      
      let receiptImageUrl = '';
      
      // 2. Subir comprobante si existe
      if (receiptFile) {
        try {
          console.log('📤 Subiendo comprobante...');
          const uploadResult = await uploadReceiptFile(receiptFile);
          receiptImageUrl = uploadResult.url;
          
          // 3. Actualizar la orden con el comprobante
          console.log('🔄 Actualizando orden con comprobante...');
          await uploadReceipt(order.id, receiptImageUrl);
          
          console.log('✅ Comprobante subido exitosamente');
        } catch (uploadError) {
          console.error('❌ Error subiendo comprobante:', uploadError);
          // Aún así continuamos con la orden creada
          toast({
            title: 'Orden creada - Error en comprobante',
            description: 'La orden se creó pero hubo un error al subir el comprobante. Puedes subirlo más tarde.',
            variant: 'destructive',
          });
        }
      } else {
        console.log('⚠️ No hay comprobante para subir');
      }

      toast({
        title: '¡Pedido Realizado!',
        description: `Tu pedido #${order.orderNumber} ha sido creado exitosamente.`,
      });
      
      clearCart();
      router.push('/profile');
      
    } catch (error: any) {
      console.error('❌ Error creating order:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo realizar el pedido',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (cartItems.length === 0) {
    return null; 
  }

  return (
    <div className="container mx-auto max-w-6xl py-12">
      <h1 className="mb-8 text-center font-headline text-4xl">Finalizar Compra</h1>
      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Información de Envío</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre Completo *</Label>
                <Input 
                  id="name" 
                  name="name"
                  placeholder="Tu Nombre Completo" 
                  required 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input 
                  id="phone" 
                  name="phone"
                  placeholder="+51 987 654 321" 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Dirección *</Label>
                <Input 
                  id="address" 
                  name="address"
                  placeholder="Av. Principal 123, Distrito" 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="city">Ciudad *</Label>
                  <Input 
                    id="city" 
                    name="city"
                    placeholder="Lima" 
                    required 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="zip">Código Postal *</Label>
                  <Input 
                    id="zip" 
                    name="zip"
                    placeholder="15001" 
                    required 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Método de Pago</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs 
                value={selectedPaymentMethod} 
                onValueChange={setSelectedPaymentMethod}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="YAPE">Yape</TabsTrigger>
                  <TabsTrigger value="PLIN">Plin</TabsTrigger>
                </TabsList>
                <TabsContent value="YAPE">
                  <div className="mt-4 flex flex-col items-center gap-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      Realiza el pago mediante Yape y adjunta el comprobante
                    </p>
                    <div className="bg-white p-4 rounded-lg border-2 border-dashed border-green-200">
                      <Image
                        src="/api/placeholder/200/200"
                        alt="Código QR de Yape"
                        width={200}
                        height={200}
                        className="rounded-md mx-auto"
                      />
                    </div>
                    <p className="font-semibold">
                      Número Yape: <span className="text-primary">987 654 321</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      A nombre de: <strong>Scenta Lux</strong>
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="PLIN">
                  <div className="mt-4 flex flex-col items-center gap-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      Realiza el pago mediante Plin y adjunta el comprobante
                    </p>
                    <div className="bg-white p-4 rounded-lg border-2 border-dashed border-blue-200">
                      <Image
                        src="/api/placeholder/200/200"
                        alt="Código QR de Plin"
                        width={200}
                        height={200}
                        className="rounded-md mx-auto"
                      />
                    </div>
                    <p className="font-semibold">
                      Número Plin: <span className="text-primary">912 345 678</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      A nombre de: <strong>Scenta Lux</strong>
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              <Separator className="my-6" />
              
              <div className="grid w-full items-center gap-2">
                <Label className="flex items-center gap-2 font-semibold">
                  <File className="h-4 w-4" />
                  Comprobante de Pago {receiptFile && '✅'}
                </Label>
                
                {/* USANDO EL COMPONENTE ImageUpload MEJORADO */}
                <ImageUpload 
                  onImageChange={handleImageChange}
                  currentImage={receiptPreview}
                />
                
                <Alert className="mt-4">
                  <AlertTitle>Importante</AlertTitle>
                  <AlertDescription>
                    Una vez realizado el pago, adjunta una captura de pantalla o foto del comprobante. 
                    Tu pedido será procesado una vez verifiquemos el pago.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {detailedCartItems.map(item => item && (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Image 
                      src={item.perfume.imageUrl} 
                      alt={item.perfume.name} 
                      width={48} 
                      height={48} 
                      className="rounded-md"
                    />
                    <div>
                      <p className="font-medium">{item.perfume.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} × ${item.perfume.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold">
                    ${(item.perfume.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Impuestos (8%)</span>
                  <span>${taxes.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button 
            type="submit" 
            size="lg" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando Pedido...
              </>
            ) : (
              'Realizar Pedido'
            )}
          </Button>

          <Alert>
            <AlertDescription className="text-sm">
              Al realizar el pedido, aceptas nuestros términos y condiciones. 
              Te contactaremos para confirmar el envío una vez verificado el pago.
            </AlertDescription>
          </Alert>
        </div>
      </form>
    </div>
  );
}