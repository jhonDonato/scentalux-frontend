export interface Perfume {
  id: string;
  name: string;
  brand: string;
  price: number;
  stock: number;
  imageUrl: string;
  description: string;
  category: 'Para Él' | 'Para Ella' | 'Unisex';
  published: boolean; // ✅ Agrega esta propiedad
  notes: string[];
  createdAt: string; // ✅ Agrega esta propiedad
}

export interface CartItem {
  id: string;
  quantity: number;
}