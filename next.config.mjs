/** @type {import('next').NextConfig} */
const nextConfig = {
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
