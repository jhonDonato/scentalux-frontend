/**
 * API real que se conecta al backend Spring Boot
 * Mantiene simulaciones para módulos aún no desarrollados en Backend (Mesas, Notificaciones)
 */
import type { 
  MenuItem, 
  Order, 
  Table, 
  Note, 
  CalendarEvent, 
  OrderItem, 
  TableStatus, 
  Notification, 
  OfferRequest, 
  Discount 
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9090';
// --- HELPERS ---

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  console.log(`DEBUG [API]: Petición a ${endpoint}`, { hasToken: !!token });
  
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) (headers as any)['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

  if (response.status === 401) {
    console.error(`DEBUG [API]: Error 401 en ${endpoint}. Token inválido o expirado.`);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?expired=true';
      }
    }
    throw new Error("No autorizado");
  }

  console.log(`DEBUG [API]: Respuesta exitosa (${response.status}) de ${endpoint}`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  if (response.status === 204) return null;
  return response.json();
}

async function uploadFile(endpoint: string, file: File, fieldName = 'file') {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
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

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
}

// SIMULACIÓN (Base de datos temporal para UI)
let db = {
  menuItems: [] as MenuItem[], 
  orders: [] as Order[],
  tables: Array.from({ length: 12 }, (_, i) => ({ id: (i + 1).toString(), status: 'free' })) as Table[],
  notifications: [] as Notification[],
};

const LATENCY = 100;
const wait = () => new Promise(resolve => setTimeout(resolve, LATENCY));


// --- MENU ITEMS (REAL + Cache Local para Simulación) ---

export async function getMenuItems(): Promise<MenuItem[]> {
  try {
    const data = await fetchWithAuth('/api/menu-items');
    const items = data.map((item: any) => ({ ...item, id: Number(item.id) }));
    db.menuItems = items; 
    return items;
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return [];
  }
}

export async function getMenuItem(id: string | number): Promise<MenuItem | undefined> {
  try {
    return await fetchWithAuth(`/api/menu-items/${id}`);
  } catch (error) {
    return undefined;
  }
}

export async function createMenuItem(itemData: Omit<MenuItem, 'id'>): Promise<MenuItem> {
  return fetchWithAuth('/api/menu-items', {
    method: 'POST',
    body: JSON.stringify(itemData)
  });
}

export async function updateMenuItem(id: string | number, updates: Partial<MenuItem>): Promise<MenuItem | null> {
  return fetchWithAuth(`/api/menu-items/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  });
}

export async function updateMenuItemStock(id: string | number, newStock: number): Promise<MenuItem | null> {
  return fetchWithAuth(`/api/menu-items/${id}/stock?stock=${newStock}`, {
    method: 'PATCH'
  });
}

export async function deleteMenuItem(id: string | number): Promise<boolean> {
  try {
    await fetchWithAuth(`/api/menu-items/${id}`, { method: 'DELETE' });
    return true;
  } catch (error) {
    return false;
  }
}


// --- OFFERS / DISCOUNTS (REAL) ---

export async function getOffers(): Promise<Discount[]> {
  try {
    return await fetchWithAuth('/api/discounts');
  } catch (error) {
    console.error('Error fetching discounts:', error);
    return [];
  }
}

export async function createOffer(offerData: OfferRequest): Promise<Discount> {
  return fetchWithAuth('/api/discounts', {
    method: 'POST',
    body: JSON.stringify(offerData),
  });
}

export async function updateOffer(id: string | number, updates: Partial<Discount>): Promise<Discount | null> {
   console.warn("Update Offer no implementado en backend todavía.");
   return null; 
}

export async function deleteOffer(id: number): Promise<boolean> {
  try {
    await fetchWithAuth(`/api/discounts/${id}`, { method: 'DELETE' });
    return true;
  } catch (error) {
    return false;
  }
}


// --- TABLES (SIMULACIÓN COMPLETA) ---

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
    if (status === 'free') db.tables[index].orderId = undefined;
    return db.tables[index];
}

export async function addTable(): Promise<Table | null> {
    await wait();
    const newId = (db.tables.length > 0 ? Math.max(...db.tables.map(t => parseInt(t.id))) : 0) + 1;
    const newTable: Table = { id: newId.toString(), status: 'free' };
    db.tables.push(newTable);
    return newTable;
}

export async function removeTable(): Promise<boolean> {
    await wait();
    if(db.tables.length <= 0) return false;
    const lastTable = db.tables[db.tables.length - 1];
    if (lastTable.status !== 'free') return false;
    db.tables.pop();
    return true;
}


// --- ORDERS (SIMULACIÓN COMPLETA) ---

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
    
    // Validación de stock usando la caché local de platos reales
    for (const item of orderData.items) {
        const menuItem = db.menuItems.find(mi => mi.id == item.menuItemId); 
        if (!menuItem || menuItem.stock < item.quantity) return null; 
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

    // Actualizar mesa a ocupada
    const tableIndex = db.tables.findIndex(t => t.id === orderData.tableId);
    if (tableIndex !== -1) {
        db.tables[tableIndex].status = 'occupied';
        db.tables[tableIndex].orderId = newOrder.id;
    }
    
    createNotification({
      message: `Pedido nuevo mesa ${newOrder.tableId}.`,
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
           message: `Pedido Mesa ${order.tableId} listo.`,
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

    // Restaurar stock original (simulado)
    for (const item of originalOrder.items) {
        const menuItem = db.menuItems.find(mi => mi.id == item.menuItemId);
        if (menuItem) menuItem.stock += item.quantity;
    }

    // Validar y descontar nuevo stock (simulado)
    for (const item of newItems) {
        const menuItem = db.menuItems.find(mi => mi.id == item.menuItemId);
        if (!menuItem || menuItem.stock < item.quantity) {
             // Revertir
             for (const item of originalOrder.items) {
                const menuItem = db.menuItems.find(mi => mi.id == item.menuItemId);
                if (menuItem) menuItem.stock -= item.quantity;
            }
            return null;
        }
        menuItem.stock -= item.quantity;
    }

    db.orders[orderIndex].items = newItems;
    db.orders[orderIndex].lastUpdatedAt = Date.now();
    
    createNotification({
        message: `Pedido Mesa ${originalOrder.tableId} modificado.`,
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

    // Restaurar stock (simulado)
    for (const item of order.items) {
        const menuItem = db.menuItems.find(mi => mi.id == item.menuItemId);
        if (menuItem) menuItem.stock += item.quantity;
    }

    // Liberar mesa
    const tableIndex = db.tables.findIndex(t => t.id === order.tableId);
    if (tableIndex !== -1) {
        db.tables[tableIndex].status = 'free';
        db.tables[tableIndex].orderId = undefined;
    }
    
    // Eliminar orden
    db.orders.splice(orderIndex, 1);
    
    return true;
}


// --- NOTIFICATIONS & WAITER CALLS (SIMULACIÓN COMPLETA) ---

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

export async function dismissNotification(notificationId: string): Promise<void> {
    await wait();
    db.notifications = db.notifications.filter(n => n.id !== notificationId);
}

export async function callWaiter(tableId: string): Promise<void> {
    await wait();
    const tableIndex = db.tables.findIndex(t => t.id === tableId);
    if (tableIndex !== -1) {
        db.tables[tableIndex].status = 'needs-attention';
    }
    createNotification({
        message: `¡Mesa ${tableId} llama al mesero!`,
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
    await dismissNotification(notificationId);
}


// --- ARCHIVOS (REAL) ---

export async function uploadImage(file: File): Promise<{ url: string }> {
  return uploadFile('/api/upload/image', file);
}

export async function uploadReceipt(file: File): Promise<{ url: string }> {
  return uploadFile('/api/upload/receipt', file);
}