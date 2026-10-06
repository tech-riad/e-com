import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      // Local Strapi uploads (http://localhost:1337/uploads/...)
      { protocol: "http", hostname: "localhost", port: "1337", pathname: "/uploads/**" },
      { protocol: "http", hostname: "127.0.0.1", port: "1337", pathname: "/uploads/**" },
      // Add your CDN / storage hostnames here when you start using real product images
      // { protocol: "https", hostname: "cdn.example.com" },
    ],
  },
};

export default nextConfig;
