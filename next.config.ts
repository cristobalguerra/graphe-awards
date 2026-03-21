import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/graphe-awards",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
