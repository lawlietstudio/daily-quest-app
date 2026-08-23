import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Export a fully static site
  output: "export",
  // If you host under a path like https://username.github.io/repo-name,
  // set `basePath` and `assetPrefix` to `/repo-name`.
  // Serving from GitHub Pages under a repo path
  basePath: "/daily-quest-app",
  assetPrefix: "/daily-quest-app/",
};

export default nextConfig;
