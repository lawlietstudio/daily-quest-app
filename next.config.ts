import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Export a fully static site
  output: "export",
  // If you host under a path like https://username.github.io/repo-name,
  // set `basePath` and `assetPrefix` to `/repo-name`.
  // basePath: '/REPO_NAME',
  // assetPrefix: '/REPO_NAME/',
};

export default nextConfig;
