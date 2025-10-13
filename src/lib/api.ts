const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Registro de usuario
export async function registerUser(data: {
  nombre: string;
  apellido: string;
  correo: string;
  contrasena: string;
}) {
  const body = {
    username: data.correo, 
    password: data.contrasena,
    enabled: true
  };

  const res = await fetch(`${API_URL}/usuarios`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Error al registrar usuario");
  }

  return await res.json();
}

// Login de usuario
export async function loginUser(data: { correo: string; contrasena: string }) {
  const body = {
    username: data.correo,
    password: data.contrasena,
  };

  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const responseData = await res.json();

  if (!res.ok) {
    throw new Error(responseData?.message || "Credenciales inválidas");
  }

  console.log('✅ Response completa del login:', responseData);
  console.log('👤 Roles recibidos:', responseData.roles);

  // 🔥 CORRECIÓN: El token viene como "access_token" en lugar de "token"
  if (responseData.access_token) {
    console.log('🔐 Token recibido (access_token):', responseData.access_token);
    localStorage.setItem("token", responseData.access_token);
  } 
  // Por si acaso también verificamos si viene como "token"
  else if (responseData.token) {
    console.log('🔐 Token recibido (token):', responseData.token);
    localStorage.setItem("token", responseData.token);
  }
  else {
    console.error('❌ No se recibió token en la respuesta');
    console.log('📋 Respuesta completa:', responseData);
    throw new Error('No se pudo obtener el token de autenticación');
  }
  
  if (responseData.roles && responseData.roles.length > 0) {
    const role = responseData.roles[0]; // Mantener el caso original (ADMIN)
    console.log('💾 Rol a guardar:', role);
    localStorage.setItem("scentalux_user_role", role);
  }
  
  localStorage.setItem("username", responseData.username);
  localStorage.setItem("scentalux_auth_status", "true");

  // Verificar que todo se guardó correctamente
  console.log('💾 Estado después del login:');
  console.log('  - Token guardado:', localStorage.getItem('token') ? '✅' : '❌');
  console.log('  - Auth status:', localStorage.getItem('scentalux_auth_status'));
  console.log('  - User role:', localStorage.getItem('scentalux_user_role'));
  console.log('  - Username:', localStorage.getItem('username'));

  // Disparar eventos para actualizar componentes
  window.dispatchEvent(new Event('storage'));

  return responseData;
}