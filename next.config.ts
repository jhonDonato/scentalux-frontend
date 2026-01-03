import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  images: {
    remotePatterns: [
      // 1. Tu backend Spring Boot
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9090',
        pathname: '/**',
      },
      
      // 2. Unsplash (para imágenes de fondo)
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      
      // 3. Picsum (para placeholders)
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
      
      // 4. Placehold.co
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
      
      // 5. Otros dominios comunes
      {
        protocol: 'https',
        hostname: 'example.com',
        pathname: '/**',
      },
      
      // 6. Para desarrollo, puedes agregar esto (pero cuidado en producción):
      {
        protocol: 'https',
        hostname: '**', // CUALQUIER dominio HTTPS
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '**', // CUALQUIER dominio HTTP (solo desarrollo)
        pathname: '/**',
      },
    ],
    
    // OPCIONAL: Configuración adicional
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

export default nextConfig;