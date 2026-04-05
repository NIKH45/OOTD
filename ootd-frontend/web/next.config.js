const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep trace root explicit in this monorepo to avoid lockfile-root warnings.
  outputFileTracingRoot: path.join(__dirname, "../.."),
  // Accept common local origins in dev to prevent localhost/127.0.0.1 blocking.
  allowedDevOrigins: ["localhost", "127.0.0.1", "[::1]"],
};

module.exports = nextConfig;
