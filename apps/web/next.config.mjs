import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  transpilePackages: ['@watergis/maplibre-gl-terradraw'],
  async rewrites() {
    const apiTarget = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    return [
      {
        source: '/api/:path*',
        destination: `${apiTarget}/:path*`,
      },
    ];
  },
  webpack(config) {
    config.resolve.alias['@watergis/maplibre-gl-terradraw/dist/maplibre-gl-terradraw.css'] =
      join(__dirname, 'node_modules', '@watergis', 'maplibre-gl-terradraw', 'dist', 'maplibre-gl-terradraw.css');
    return config;
  },
};

export default nextConfig;
