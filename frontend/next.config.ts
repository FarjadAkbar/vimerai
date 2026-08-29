import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async redirects() {
    return [
      {
        source: "/brand-kits",
        destination: "/studio/business-dna",
        permanent: false,
      },
      {
        source: "/brand-kits/:path*",
        destination: "/studio/business-dna",
        permanent: false,
      },
      {
        source: "/studio/posts",
        destination: "/studio/blitz",
        permanent: false,
      },
      {
        source: "/products",
        destination: "/studio/library",
        permanent: false,
      },
      {
        source: "/generations",
        destination: "/studio/library",
        permanent: false,
      },
      {
        source: "/generations/:path*",
        destination: "/studio/library",
        permanent: false,
      },
      {
        source: "/my-videos",
        destination: "/studio/library",
        permanent: false,
      },
      {
        source: "/editor/:path*",
        destination: "/studio/library",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
