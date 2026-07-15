import type { NextConfig } from "next";

// A static export keeps Bridge easy to preview and deploy: any static host works.
const nextConfig: NextConfig = { output: "export", trailingSlash: true };

export default nextConfig;
