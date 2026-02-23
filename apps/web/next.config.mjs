import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@watergis/maplibre-gl-terradraw'],
  webpack(config) {
    config.resolve.alias['@watergis/maplibre-gl-terradraw/dist/maplibre-gl-terradraw.css'] =
      join(__dirname, 'node_modules', '@watergis', 'maplibre-gl-terradraw', 'dist', 'maplibre-gl-terradraw.css');
    return config;
  },
};

export default nextConfig;
