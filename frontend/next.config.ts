import type { NextConfig } from "next";

const backendUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.BACKEND_URL ||
  "https://lms-backend-3wye.onrender.com";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // Tự động chuyển mọi lệnh gọi /api/ xuống cổng 5000 của Backend
        source: '/api/:path*', 
        destination: `${backendUrl.replace(/\/+$/, "")}/api/:path*`, 
      },
    ]
  },
};

export default nextConfig;
