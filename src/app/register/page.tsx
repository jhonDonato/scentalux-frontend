'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { registerUser } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await registerUser({ nombre, apellido, correo, contrasena });

      toast({
        title: 'Registro exitoso',
        description: 'Tu cuenta ha sido creada correctamente. Ahora inicia sesión.',
      });

      router.push('/login');
    } catch (err: any) {
      toast({
        title: 'Error al registrar',
        description: err.message || 'No se pudo crear la cuenta',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl font-headline">Regístrate</CardTitle>
          <CardDescription>Ingresa tu información para crear una cuenta</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister}>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="first-name">Nombre</Label>
                  <Input id="first-name" placeholder="Max" required value={nombre} onChange={(e) => setNombre(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="last-name">Apellido</Label>
                  <Input id="last-name" placeholder="Robinson" required value={apellido} onChange={(e) => setApellido(e.target.value)} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input id="email" type="email" placeholder="m@example.com" required value={correo} onChange={(e) => setCorreo(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" type="password" required value={contrasena} onChange={(e) => setContrasena(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Registrando...' : 'Crear cuenta'}
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login" className="underline">
              Iniciar Sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
