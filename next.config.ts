import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "deskxp.com",
      },
    ],
  },
};

export default nextConfig;
