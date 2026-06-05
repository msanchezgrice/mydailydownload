import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root to this app so Next doesn't pick up a parent
  // lockfile (there are sibling package-lock.json files higher up the tree).
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
