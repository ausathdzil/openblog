import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    inlineCss: true,
    typedEnv: true,
  },
  reactCompiler: true,

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
