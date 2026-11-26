import { fileURLToPath } from 'node:url';
/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: fileURLToPath(new URL('.', import.meta.url)),
  // Separate local research builds avoid overwriting a running comparison.
  distDir: process.env.RESEARCH_DIST_DIR || '.next',
  reactProductionProfiling: process.env.THEME_PROFILE_BUILD === '1',
  // d3-delaunay (Voronoi Mosaic layout) and its deps ship ESM-only - this
  // also makes next/jest transform them in tests instead of blanket-ignoring
  // all of node_modules.
  transpilePackages: [
    'd3-delaunay', 'delaunator', 'robust-predicates',
    // The MongoDB driver imports the OS module dynamically during its handshake.
    // Let next/jest compile that import for its CommonJS test environment.
    ...(process.env.NODE_ENV === 'test' ? ['mongodb'] : []),
  ],
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
