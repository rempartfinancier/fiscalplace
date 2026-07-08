import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // French is the default locale; the bare domain lands on /fr.
      { source: "/", destination: "/fr", permanent: false },
    ];
  },
};

export default nextConfig;
