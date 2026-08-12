import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: {
    inlineCss: true,
    serverActions: {
      bodySizeLimit: '3mb',
    },
    typedEnv: true,
    turbopackRustReactCompiler: true,
  },
  reactCompiler: true,
  typedRoutes: true,

  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/@:username/:path*',
          destination: '/u/:username/:path*',
        },
      ],
    };
  },
};

export default nextConfig;
