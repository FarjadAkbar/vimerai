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
    ];
  },
};

export default nextConfig;
