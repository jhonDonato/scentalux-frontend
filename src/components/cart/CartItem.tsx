'use client';

import Image from 'next/image';
import { Minus, Plus, X, Trash2 } from 'lucide-react';

import type { CartItem as CartItemType, Perfume } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CartItemProps {
  item: CartItemType & { perfume: Perfume };
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(item.id);
    } else {
      updateQuantity(item.id, newQuantity);
    }
  };

  const totalPrice = item.perfume.price * item.quantity;

  return (
    <div className="flex gap-4 p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow group">
      {/* Imagen del producto */}
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border">
        <Image
          src={item.perfume.imageUrl}
          alt={item.perfume.name}
          fill
          className="object-cover"
          sizes="80px"
        />
        {item.quantity > 1 && (
          <Badge 
            variant="secondary" 
            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs min-w-0 bg-primary text-primary-foreground"
          >
            {item.quantity}
          </Badge>
        )}
      </div>

      {/* Información del producto */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{item.perfume.name}</h3>
            <p className="text-xs text-muted-foreground truncate">{item.perfume.brand}</p>
            <p className="text-sm font-medium text-primary mt-1">
              ${item.perfume.price.toFixed(2)}
            </p>
          </div>
          
          {/* Botón eliminar */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => removeFromCart(item.id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>

        {/* Controles de cantidad y precio total */}
        <div className="flex items-center justify-between mt-3">
          {/* Selector de cantidad */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={item.quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            
            <div className="w-12 text-center">
              <span className="text-sm font-medium">{item.quantity}</span>
            </div>
            
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={item.quantity >= item.perfume.stock}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {/* Precio total */}
          <div className="text-right">
            <p className="text-sm font-semibold">${totalPrice.toFixed(2)}</p>
            {item.quantity > 1 && (
              <p className="text-xs text-muted-foreground">
                ${item.perfume.price.toFixed(2)} c/u
              </p>
            )}
          </div>
        </div>

        {/* Stock disponible */}
        {item.perfume.stock < 10 && (
          <div className="mt-2">
            <Badge 
              variant={item.perfume.stock === 0 ? "destructive" : "outline"}
              className={cn(
                "text-xs",
                item.perfume.stock === 0 && "bg-red-50 text-red-700 border-red-200",
                item.perfume.stock > 0 && item.perfume.stock < 5 && "bg-amber-50 text-amber-700 border-amber-200",
                item.perfume.stock >= 5 && item.perfume.stock < 10 && "bg-blue-50 text-blue-700 border-blue-200"
              )}
            >
              {item.perfume.stock === 0 ? 'Agotado' : `${item.perfume.stock} en stock`}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}