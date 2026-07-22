import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ahora va en la raíz de la configuración
  allowedDevOrigins: ['192.168.1.80', 'localhost:3000'],
};

export default nextConfig;