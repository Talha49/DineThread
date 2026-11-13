import { fileURLToPath } from 'node:url';
/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: fileURLToPath(new URL('.', import.meta.url)),
  // Separate local research builds avoid overwriting a running comparison.
  distDir: process.env.RESEARCH_DIST_DIR || '.next',
  // d3-delaunay (Voronoi Mosaic layout) and its deps ship ESM-only - this
  // also makes next/jest transform them in tests instead of blanket-ignoring
  // all of node_modules.
  transpilePackages: ['d3-delaunay', 'delaunator', 'robust-predicates'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
};

export default nextConfig;
