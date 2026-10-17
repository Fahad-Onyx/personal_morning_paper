import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // better-sqlite3 is a native Node module; keep it out of the bundler and
  // load it from node_modules at runtime on the server.
  serverExternalPackages: ["better-sqlite3", "jsdom", "playwright"],
};

export default nextConfig;
