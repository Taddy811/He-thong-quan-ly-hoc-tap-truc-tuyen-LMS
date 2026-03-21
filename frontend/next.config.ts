import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // Tự động chuyển mọi lệnh gọi /api/ xuống cổng 5000 của Backend
        source: '/api/:path*', 
        destination: 'http://localhost:5000/api/:path*', 
      },
    ]
  },
};

export default nextConfig;