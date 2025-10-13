'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { loginUser } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [loading, setLoading] = useState(false);

  // En tu handleLogin, después del login exitoso:
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const data = await loginUser({ correo, contrasena });
    
    // 🔥 GUARDAR ESTADO DE AUTENTICACIÓN MANUALMENTE 🔥
    localStorage.setItem("scentalux_auth_status", "true");
    
    const rol = data.roles?.[0] ?? 'CLIENTE';

    toast({
      title: 'Bienvenido',
      description: `Has iniciado sesión como ${rol}.`,
    });

    // Forzar actualización del estado de autenticación
    window.dispatchEvent(new Event('storage'));

    if (rol === 'ADMIN') {
      router.push('/admin/estadisticas');
    } else {
      router.push('/');
    }
  } catch (err: any) {
    toast({
      title: 'Error',
      description: err.message || 'No se pudo iniciar sesión',
      variant: 'destructive',
    });
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Iniciar Sesión</CardTitle>
          <CardDescription>Ingresa tus credenciales para acceder a tu cuenta</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="correo">Correo Electrónico</Label>
                <Input
                  id="correo"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Cargando...' : 'Iniciar Sesión'}
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            ¿No tienes una cuenta?{' '}
            <Link href="/register" className="underline">
              Regístrate
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
