import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  output: "export",
  basePath: '/routine',
  assetPrefix: '/routine/',
  trailingSlash: true,
};

export default nextConfig;
