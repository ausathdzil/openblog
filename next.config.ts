import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    authInterrupts: true,
    inlineCss: true,
  },
  reactCompiler: true,
  typedRoutes: true,
};

export default nextConfig;
