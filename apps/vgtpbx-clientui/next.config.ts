import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@vgtpbx/db"],
  async rewrites() {
    return [
      {
        source: "/__/auth/:path*",
        destination:
          "https://dev-vgtpbx.firebaseapp.com/__/auth/:path*",
      },
      {
        source: "/__/firebase/:path*",
        destination:
          "https://dev-vgtpbx.firebaseapp.com/__/firebase/:path*",
      },
    ];
  },
};

export default nextConfig;
