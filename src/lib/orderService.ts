const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export interface CreateOrderDTO {
  items: {
    perfumeId: number;
    quantity: number;
  }[];
  paymentMethod: string;
  customerName: string;
  shippingAddress: string;
  city: string;
  postalCode: string;
  phone?: string;
}

export interface OrderDTO {
  id: number;
  orderNumber: string;
  customerName: string;
  orderDate: string;
  subtotal: number;
  taxes: number;
  total: number;
  status: string;
  paymentMethod: string;
  receiptImageUrl?: string;
  shippingAddress: string;
  city: string;
  postalCode: string;
  items: OrderItemDTO[];
}

export interface OrderItemDTO {
  perfumeId: number;
  perfumeName: string;
  brand: string;
  imageUrl: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// Función para obtener el token de forma segura
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const token = localStorage.getItem('token');
  console.log('🔐 Token obtenido:', token ? 'Presente' : 'Ausente');
  
  if (!token) {
    console.warn('❌ No hay token disponible');
    return null;
  }

  // Verificar formato básico del token
  if (typeof token !== 'string' || token.split('.').length !== 3) {
    console.error('❌ Token con formato inválido:', token);
    localStorage.removeItem('token');
    localStorage.removeItem('scentalux_auth_status');
    localStorage.removeItem('scentalux_user_role');
    localStorage.removeItem('username');
    return null;
  }

  return token;
};

// Función para manejar errores de autenticación
const handleAuthError = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('scentalux_auth_status');
  localStorage.removeItem('scentalux_user_role');
  localStorage.removeItem('username');
  window.dispatchEvent(new Event('storage'));
  window.location.href = '/login';
};

export async function createOrder(orderData: CreateOrderDTO): Promise<OrderDTO> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No estás autenticado. Por favor, inicia sesión nuevamente.');
  }

  console.log('📦 Creando orden con datos:', orderData);

  try {
    const res = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });

    if (!res.ok) {
      if (res.status === 401) {
        handleAuthError();
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
      
      const errorText = await res.text();
      console.error('❌ Error del servidor:', errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error || errorData.message || 'Error al crear el pedido');
      } catch {
        throw new Error(errorText || 'Error al crear el pedido');
      }
    }

    const responseData = await res.json();
    console.log('✅ Orden creada exitosamente:', responseData);
    return responseData;

  } catch (error: any) {
    console.error('❌ Error en createOrder:', error);
    if (error.message.includes('Sesión expirada') || error.message.includes('autenticado')) {
      handleAuthError();
    }
    throw error;
  }
}

export async function getUserOrders(): Promise<OrderDTO[]> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No estás autenticado. Por favor, inicia sesión nuevamente.');
  }

  console.log('📋 Obteniendo órdenes del usuario');

  try {
    const res = await fetch(`${API_URL}/orders/my-orders`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      if (res.status === 401) {
        handleAuthError();
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
      
      const errorText = await res.text();
      console.error('❌ Error del servidor:', errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error || errorData.message || 'Error al obtener los pedidos');
      } catch {
        throw new Error(errorText || 'Error al obtener los pedidos');
      }
    }

    const orders = await res.json();
    console.log('✅ Órdenes obtenidas:', orders.length);
    return orders;

  } catch (error: any) {
    console.error('❌ Error en getUserOrders:', error);
    if (error.message.includes('Sesión expirada') || error.message.includes('autenticado')) {
      handleAuthError();
    }
    throw error;
  }
}

export async function getAllOrders(): Promise<OrderDTO[]> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No estás autenticado. Por favor, inicia sesión nuevamente.');
  }

  console.log('📋 Obteniendo todas las órdenes (admin)');

  try {
    const res = await fetch(`${API_URL}/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      if (res.status === 401) {
        handleAuthError();
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
      
      const errorText = await res.text();
      console.error('❌ Error del servidor:', errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error || errorData.message || 'Error al obtener las órdenes');
      } catch {
        throw new Error(errorText || 'Error al obtener las órdenes');
      }
    }

    const orders = await res.json();
    console.log('✅ Órdenes obtenidas (admin):', orders.length);
    return orders;

  } catch (error: any) {
    console.error('❌ Error en getAllOrders:', error);
    if (error.message.includes('Sesión expirada') || error.message.includes('autenticado')) {
      handleAuthError();
    }
    throw error;
  }
}

export async function uploadReceipt(orderId: number, imageUrl: string): Promise<OrderDTO> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No estás autenticado. Por favor, inicia sesión nuevamente.');
  }

  try {
    const res = await fetch(`${API_URL}/orders/${orderId}/receipt`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ receiptImageUrl: imageUrl })
    });

    if (!res.ok) {
      if (res.status === 401) {
        handleAuthError();
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
      
      const errorText = await res.text();
      console.error('❌ Error del servidor:', errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error || errorData.message || 'Error al subir el comprobante');
      } catch {
        throw new Error(errorText || 'Error al subir el comprobante');
      }
    }

    const updatedOrder = await res.json();
    console.log('✅ Comprobante subido exitosamente:', updatedOrder);
    return updatedOrder;

  } catch (error: any) {
    console.error('❌ Error en uploadReceipt:', error);
    if (error.message.includes('Sesión expirada') || error.message.includes('autenticado')) {
      handleAuthError();
    }
    throw error;
  }
}

export async function updateOrderStatus(orderId: number, status: string): Promise<OrderDTO> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No estás autenticado. Por favor, inicia sesión nuevamente.');
  }

  try {
    const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });

    if (!res.ok) {
      if (res.status === 401) {
        handleAuthError();
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
      
      const errorText = await res.text();
      console.error('❌ Error del servidor:', errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error || errorData.message || 'Error al actualizar el estado');
      } catch {
        throw new Error(errorText || 'Error al actualizar el estado');
      }
    }

    const updatedOrder = await res.json();
    console.log('✅ Estado actualizado:', updatedOrder);
    return updatedOrder;

  } catch (error: any) {
    console.error('❌ Error en updateOrderStatus:', error);
    if (error.message.includes('Sesión expirada') || error.message.includes('autenticado')) {
      handleAuthError();
    }
    throw error;
  }
}

export async function uploadReceiptFile(file: File): Promise<{url: string}> {
  console.log('📤 Subiendo archivo de comprobante:', file.name);

  const token = getAuthToken();
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch(`${API_URL}/api/upload/receipt`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ Error subiendo archivo:', errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error || errorData.message || 'Error al subir el archivo');
      } catch {
        throw new Error(errorText || 'Error al subir el archivo');
      }
    }

    const result = await res.json();
    console.log('✅ Archivo subido exitosamente:', result);
    
    // Asegurarse de que la URL sea completa
    let imageUrl = result.url || result.imageUrl;
    if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
      imageUrl = `${API_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
    }
    
    return { url: imageUrl };

  } catch (error: any) {
    console.error('❌ Error en uploadReceiptFile:', error);
    throw error;
  }
}