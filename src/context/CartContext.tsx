'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { CartItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { usePerfumes } from './PerfumeContext';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (id: string, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// For this prototype, we'll simulate the auth state.
// In a real app, you would use a proper auth provider.
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // This is a mock check. Replace with your actual auth logic.
    const mockAuthCheck = () => {
      const loggedIn = localStorage.getItem('scentalux_auth_status') === 'true';
      const role = localStorage.getItem('scentalux_user_role');
      setIsAuthenticated(loggedIn);
      setUserRole(role);
    };
    mockAuthCheck();
    window.addEventListener('storage', mockAuthCheck);
    return () => window.removeEventListener('storage', mockAuthCheck);
  }, []);
  return { isAuthenticated, userRole };
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();
  const { isAuthenticated, userRole } = useAuth();
  const router = useRouter();
  const { getPerfumeById } = usePerfumes();

  useEffect(() => {
    try {
      if (isAuthenticated) {
        const items = localStorage.getItem('scentalux_cart');
        if (items) {
          setCartItems(JSON.parse(items));
        }
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error('Failed to parse cart from localStorage', error);
      setCartItems([]);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    try {
      if(isAuthenticated) {
        localStorage.setItem('scentalux_cart', JSON.stringify(cartItems));
      } else {
        localStorage.removeItem('scentalux_cart');
      }
    } catch (error) {
      console.error('Failed to save cart to localStorage', error);
    }
  }, [cartItems, isAuthenticated]);

  const addToCart = (id: string, quantity: number = 1) => {
    if (!isAuthenticated) {
      toast({
        title: 'Inicio de Sesión Requerido',
        description: 'Debes iniciar sesión para añadir artículos a tu carrito.',
        variant: 'destructive',
      });
      router.push('/login');
      return;
    }

    if (userRole === 'admin') {
      toast({
        title: 'Acción no permitida',
        description: 'Los administradores no pueden añadir artículos al carrito.',
        variant: 'destructive',
      });
      return;
    }

    const perfume = getPerfumeById(id);
    if (!perfume) return;
    
    const existingItem = cartItems.find((item) => item.id === id);
    const currentQuantityInCart = existingItem ? existingItem.quantity : 0;
    
    if (currentQuantityInCart + quantity > perfume.stock) {
      toast({
        title: 'Stock Insuficiente',
        description: `Solo puedes añadir hasta ${perfume.stock} unidades de ${perfume.name}.`,
        variant: 'destructive',
      });
      return;
    }

    setCartItems((prevItems) => {
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevItems, { id, quantity }];
    });
    toast({
      title: '¡Añadido al carrito!',
      description: 'El perfume ha sido añadido a tu carrito de compras.',
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
    toast({
      title: 'Artículo eliminado',
      description: 'El perfume ha sido eliminado de tu carrito.',
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    const perfume = getPerfumeById(id);
    if (perfume && quantity > perfume.stock) {
      toast({
        title: 'Stock Insuficiente',
        description: `No puedes añadir más de ${perfume.stock} unidades.`,
        variant: 'destructive',
      });
      // Revert to max stock available
      setCartItems((prevItems) =>
        prevItems.map((item) => (item.id === id ? { ...item, quantity: perfume.stock } : item))
      );
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };
  
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
