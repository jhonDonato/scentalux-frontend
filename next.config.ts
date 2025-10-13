import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'example.com', // Para tus imágenes de prueba
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost', // Para desarrollo local
        port: '9090',
        pathname: '/**',
      },
      // Agrega estos también para mayor flexibilidad:
      {
        protocol: 'https',
        hostname: '**', // Permite cualquier dominio HTTPS (cuidado en producción)
      },
      {
        protocol: 'http',
        hostname: '**', // Permite cualquier dominio HTTP (solo desarrollo)
      },
    ],
    // Opcional: deshabilitar optimización de imágenes para dominios no configurados
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;