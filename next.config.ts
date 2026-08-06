import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ahora va en la raíz de la configuración
  allowedDevOrigins: ['192.168.1.80', 'localhost:3000'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vxngvenxactastucnfvh.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**', // Permite cualquier imagen pública de tus buckets
      },
    ],
  },
};

export default nextConfig;