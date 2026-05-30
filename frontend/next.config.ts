import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // Tự động chuyển mọi lệnh gọi /api/ xuống cổng 5000 của Backend
        source: '/api/:path*', 
        destination: 'https://lms-backend-3wye.onrender.com/api/:path*', 
      },
    ]
  },
};

export default nextConfig;