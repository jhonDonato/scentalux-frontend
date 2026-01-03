/**
 * API real que se conecta al backend Spring Boot
 */
import type { MenuItem, Order, Table, Offer, Note, CalendarEvent, OrderItem, TableStatus, Notification } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9090';

// Helper para hacer fetch con token
async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('auth_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as any)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Helper para subida de archivos
async function uploadFile(endpoint: string, file: File, fieldName = 'file') {
  const token = localStorage.getItem('auth_token');
  const formData = new FormData();
  formData.append(fieldName, file);

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// --- API FUNCTIONS ---

// TODO: Necesitarás crear estos endpoints en tu backend Spring Boot
// Por ahora, mantengo la simulación pero puedes ir reemplazando gradualmente

let db = {
  menuItems: [] as MenuItem[],
  orders: [] as Order[],
  tables: Array.from({ length: 12 }, (_, i) => ({ id: (i + 1).toString(), status: 'free' })) as Table[],
  offers: [] as Offer[],
  notes: [] as Note[],
  calendarEvents: [] as CalendarEvent[],
  notifications: [] as Notification[],
};

const LATENCY = 100; // ms
const wait = () => new Promise(resolve => setTimeout(resolve, LATENCY));

// --- FUNCIONES TEMPORALES (SIMULACIÓN) ---

// Menu Items (Backend real)
export async function getMenuItems(): Promise<MenuItem[]> {
  try {
    const response = await fetch(`${API_URL}/api/menu-items`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // Mapear los datos del backend al formato del frontend
    return data.map((item: any) => ({
      id: item.id.toString(), // Convertir a string para compatibilidad
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image || '',
      stock: item.stock,
      category: item.category as MenuItem['category'],
      published: item.published
    }));
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return [];
  }
}

export async function getMenuItem(id: string): Promise<MenuItem | undefined> {
  try {
    const response = await fetch(`${API_URL}/api/menu-items/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const item = await response.json();
    
    return {
      id: item.id.toString(),
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image || '',
      stock: item.stock,
      category: item.category as MenuItem['category'],
      published: item.published
    };
  } catch (error) {
    console.error('Error fetching menu item:', error);
    return undefined;
  }
}

export async function createMenuItem(itemData: Omit<MenuItem, 'id'>): Promise<MenuItem> {
  try {
    // Convertir al formato del backend
    const backendData = {
      name: itemData.name,
      description: itemData.description,
      price: itemData.price,
      image: itemData.image || '',
      stock: itemData.stock,
      category: itemData.category,
      published: itemData.published !== undefined ? itemData.published : true
    };
    
    const response = await fetchWithAuth('/api/menu-items', {
      method: 'POST',
      body: JSON.stringify(backendData)
    });
    
    const item = response;
    
    return {
      id: item.id.toString(),
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image || '',
      stock: item.stock,
      category: item.category as MenuItem['category'],
      published: item.published
    };
  } catch (error) {
    console.error('Error creating menu item:', error);
    throw error;
  }
}

export async function updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem | null> {
  try {
    // Primero obtener el item actual
    const currentItem = await getMenuItem(id);
    if (!currentItem) return null;
    
    // Combinar updates
    const updatedItem = { ...currentItem, ...updates };
    
    // Convertir al formato del backend
    const backendData = {
      name: updatedItem.name,
      description: updatedItem.description,
      price: updatedItem.price,
      image: updatedItem.image || '',
      stock: updatedItem.stock,
      category: updatedItem.category,
      published: updatedItem.published
    };
    
    const response = await fetchWithAuth(`/api/menu-items/${parseInt(id)}`, {
      method: 'PUT',
      body: JSON.stringify(backendData)
    });
    
    const item = response;
    
    return {
      id: item.id.toString(),
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image || '',
      stock: item.stock,
      category: item.category as MenuItem['category'],
      published: item.published
    };
  } catch (error) {
    console.error('Error updating menu item:', error);
    return null;
  }
}

export async function updateMenuItemStock(id: string, newStock: number): Promise<MenuItem | null> {
  try {
    const response = await fetchWithAuth(`/api/menu-items/${parseInt(id)}/stock?stock=${newStock}`, {
      method: 'PATCH'
    });
    
    const item = response;
    
    return {
      id: item.id.toString(),
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image || '',
      stock: item.stock,
      category: item.category as MenuItem['category'],
      published: item.published
    };
  } catch (error) {
    console.error('Error updating menu item stock:', error);
    return null;
  }
}

export async function deleteMenuItem(id: string): Promise<boolean> {
  try {
    await fetchWithAuth(`/api/menu-items/${parseInt(id)}`, {
      method: 'DELETE'
    });
    return true;
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return false;
  }
}

// Offers (Temporal - simulación)
export async function getOffers(): Promise<Offer[]> {
  await wait();
  return [...db.offers];
}

export async function createOffer(offerData: Omit<Offer, 'id'>): Promise<Offer> {
    await wait();
    const newOffer: Offer = { ...offerData, id: `offer-${Date.now()}` };
    db.offers.push(newOffer);
    return newOffer;
}

export async function updateOffer(id: string, updates: Partial<Offer>): Promise<Offer | null> {
    await wait();
    const index = db.offers.findIndex(offer => offer.id === id);
    if (index === -1) return null;
    const updatedOffer = { ...db.offers[index], ...updates };
    db.offers[index] = updatedOffer;
    return updatedOffer;
}

export async function deleteOffer(id: string): Promise<boolean> {
    await wait();
    const initialLength = db.offers.length;
    db.offers = db.offers.filter(offer => offer.id !== id);
    return db.offers.length < initialLength;
}

// Tables (Temporal - simulación)
export async function getTables(): Promise<Table[]> {
  await wait();
  return [...db.tables];
}

export async function getTableById(id: string): Promise<Table | undefined> {
    await wait();
    return db.tables.find(t => t.id === id);
}

export async function updateTableStatus(tableId: string, status: TableStatus): Promise<Table | null> {
    await wait();
    const index = db.tables.findIndex(t => t.id === tableId);
    if (index === -1) return null;
    db.tables[index].status = status;
    if (status === 'free') {
        db.tables[index].orderId = undefined;
    }
    return db.tables[index];
}

export async function addTable(): Promise<Table | null> {
    await wait();
    if(db.tables.length >= 15) return null;
    const newId = (db.tables.length > 0 ? Math.max(...db.tables.map(t => parseInt(t.id))) : 0) + 1;
    const newTable: Table = { id: newId.toString(), status: 'free' };
    db.tables.push(newTable);
    return newTable;
}

export async function removeTable(): Promise<boolean> {
    await wait();
    if(db.tables.length <= 8) return false;
    const lastTable = db.tables[db.tables.length - 1];
    if (lastTable.status !== 'free') return false;
    db.tables.pop();
    return true;
}

// Orders (Temporal - simulación)
export async function getOrders(): Promise<Order[]> {
  await wait();
  return [...db.orders];
}

export async function getOrderByTableId(tableId: string): Promise<Order | null> {
    await wait();
    const table = db.tables.find(t => t.id === tableId);
    if (!table || !table.orderId) return null;
    return db.orders.find(o => o.id === table.orderId) || null;
}

export async function createOrder(orderData: { tableId: string, items: OrderItem[], estimatedDeliveryTime: number }): Promise<Order | null> {
    await wait();
    
    // Check stock
    for (const item of orderData.items) {
        const menuItem = db.menuItems.find(mi => mi.id === item.menuItemId);
        if (!menuItem || menuItem.stock < item.quantity) {
            return null; // Stock not available
        }
    }

    // Deduct stock
    for (const item of orderData.items) {
        const menuItem = db.menuItems.find(mi => mi.id === item.menuItemId);
        if (menuItem) {
            menuItem.stock -= item.quantity;
        }
    }

    const newOrder: Order = {
        id: `order-${Date.now()}`,
        tableId: orderData.tableId,
        items: orderData.items,
        status: 'pending',
        createdAt: Date.now(),
        lastUpdatedAt: Date.now(),
        estimatedDeliveryTime: orderData.estimatedDeliveryTime
    };
    db.orders.push(newOrder);

    // Update table
    const tableIndex = db.tables.findIndex(t => t.id === orderData.tableId);
    if (tableIndex !== -1) {
        db.tables[tableIndex].status = 'occupied';
        db.tables[tableIndex].orderId = newOrder.id;
    }
    
    // Create notification
    createNotification({
      message: `Tienes un pedido para la mesa ${newOrder.tableId}.`,
      type: 'new-order',
      tableId: newOrder.tableId,
    });

    return newOrder;
}

export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<Order | null> {
    await wait();
    const index = db.orders.findIndex(o => o.id === orderId);
    if (index === -1) return null;

    db.orders[index].status = status;
    db.orders[index].lastUpdatedAt = Date.now();

    const order = db.orders[index];

    if (status === 'ready') {
        createNotification({
            message: `El pedido de la Mesa ${order.tableId} está listo para entregar.`,
            type: 'order-ready',
            tableId: order.tableId
        });
    }

    return db.orders[index];
}

export async function editOrder(orderId: string, newItems: OrderItem[]): Promise<Order | null> {
    await wait();
    const orderIndex = db.orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return null;

    const originalOrder = db.orders[orderIndex];

    // Return original items to stock
    for (const item of originalOrder.items) {
        const menuItem = db.menuItems.find(mi => mi.id === item.menuItemId);
        if (menuItem) menuItem.stock += item.quantity;
    }

    // Check new stock and deduct
    for (const item of newItems) {
        const menuItem = db.menuItems.find(mi => mi.id === item.menuItemId);
        if (!menuItem || menuItem.stock < item.quantity) {
             // Re-add original items to stock since transaction failed
             for (const item of originalOrder.items) {
                const menuItem = db.menuItems.find(mi => mi.id === item.menuItemId);
                if (menuItem) menuItem.stock -= item.quantity;
            }
            return null;
        }
        menuItem.stock -= item.quantity;
    }

    db.orders[orderIndex].items = newItems;
    db.orders[orderIndex].lastUpdatedAt = Date.now();
    
    createNotification({
        message: `El pedido de la Mesa ${originalOrder.tableId} fue modificado.`,
        type: 'new-order',
        tableId: originalOrder.tableId,
    });
    
    return db.orders[orderIndex];
}

export async function cancelOrder(orderId: string): Promise<boolean> {
    await wait();
    const orderIndex = db.orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return false;

    const order = db.orders[orderIndex];

    // Return stock
    for (const item of order.items) {
        const menuItem = db.menuItems.find(mi => mi.id === item.menuItemId);
        if (menuItem) menuItem.stock += item.quantity;
    }

    // Update table
    const tableIndex = db.tables.findIndex(t => t.id === order.tableId);
    if (tableIndex !== -1) {
        db.tables[tableIndex].status = 'free';
        db.tables[tableIndex].orderId = undefined;
    }
    
    // Remove order
    db.orders.splice(orderIndex, 1);
    
    return true;
}

// Notifications (Temporal - simulación)
export async function getNotifications(): Promise<Notification[]> {
    await wait();
    return [...db.notifications];
}

async function createNotification(data: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
    const newNotif: Notification = {
        ...data,
        id: `notif-${Date.now()}`,
        timestamp: Date.now(),
        read: false
    };
    db.notifications.unshift(newNotif);
}

export async function callWaiter(tableId: string): Promise<void> {
    await wait();
    const tableIndex = db.tables.findIndex(t => t.id === tableId);
    if (tableIndex !== -1) {
        db.tables[tableIndex].status = 'needs-attention';
    }
    createNotification({
        message: `Mesa ${tableId} necesita atención!`,
        type: 'call',
        tableId
    });
}

export async function acceptCall(tableId: string, notificationId: string): Promise<void> {
    await wait();
    const tableIndex = db.tables.findIndex(t => t.id === tableId);
    if (tableIndex !== -1 && db.tables[tableIndex].status === 'needs-attention') {
        db.tables[tableIndex].status = 'occupied';
    }
    dismissNotification(notificationId);
}

export async function dismissNotification(notificationId: string): Promise<void> {
    await wait();
    db.notifications = db.notifications.filter(n => n.id !== notificationId);
}

// --- FUNCIONES REALES PARA SUBIDA DE ARCHIVOS ---
// Estas sí se conectan al backend real

export async function uploadImage(file: File): Promise<{ url: string }> {
  return uploadFile('/api/upload/image', file);
}

export async function uploadReceipt(file: File): Promise<{ url: string }> {
  return uploadFile('/api/upload/receipt', file);
}