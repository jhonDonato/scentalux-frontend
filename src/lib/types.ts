export type User = {
  id: string;
  name: string;
  username: string;
  role: 'admin' | 'waiter' | 'kitchen';
};

export type MenuItem = {
  id?: number;
  name: string;
  description: string;
  price: number;
  image?: string;
  stock: number;
  category: 'Entradas' | 'Platos Fuertes' | 'Platos a la Carta' | 'Bebidas' | 'Postres' | 'Ofertas' | 'Promociones';
  published?: boolean;
  isPromo?: boolean;
  discount?: Discount; 
};

export type OrderItem = {
  menuItemId: string | number;
  quantity: number;
};

export type Order = {
  id: string;
  tableId: string;
  items: OrderItem[];
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  createdAt: number;
  lastUpdatedAt: number;
  estimatedDeliveryTime: number; 
  deliveryTimerId?: number;
};

export type TableStatus = 'free' | 'occupied' | 'needs-attention';

export type Table = {
  id: string;
  status: TableStatus;
  orderId?: string;
};

export type Notification = {
  id: string;
  message: string;
  type: 'call' | 'low-stock' | 'order-ready' | 'delivery-due' | 'event-reminder' | 'new-order';
  timestamp: number;
  read: boolean;
  tableId?: string;
};

export type DiscountModality = 'RESTAURANT' | 'DELIVERY' | 'ALL';

export type Discount = {
  id?: number;
  description: string;
  percentage: number;
  startDate: string; 
  endDate: string;   
  modality: DiscountModality;
  active?: boolean;
};

export type OfferRequest = Discount & {
  menuItemIds?: number[]; 
  newPromoItem?: MenuItem; 
};

// Mantenemos Offer por compatibilidad legacy si es necesario
export type Offer = {
  id: string;
  title: string;
  description: string;
  image?: string;
  published: boolean;
};

export type Note = {
    id: string;
    title: string;
    content: string;
    createdAt: number;
}

export type CalendarEvent = {
  id: string;
  title: string;
  description?: string;
  date: Date;
  time: string;
};