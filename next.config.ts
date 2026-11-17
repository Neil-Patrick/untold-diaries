import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This folder is the project root (there's a stray lockfile in the parent folder).
  outputFileTracingRoot: path.join(__dirname),
  // The Turso/libSQL client uses native bindings for local .db files, so it
  // must be loaded by Node at runtime rather than bundled.
  serverExternalPackages: ["@libsql/client", "libsql"],
};

export default nextConfig;
