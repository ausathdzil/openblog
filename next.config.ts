import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: {
    inlineCss: true,
    typedEnv: true,
  },
  reactCompiler: true,
  typescript: {
    ignoreBuildErrors: true,
  },
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
