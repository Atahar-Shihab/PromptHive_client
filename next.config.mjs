import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverUrl = process.env.NEXT_PUBLIC_API_URL || "";
let serverHostname = "";

try {
  serverHostname = new URL(serverUrl).hostname;
} catch {
  serverHostname = "";
}

const nextConfig = {
  outputFileTracingRoot: __dirname,
  experimental: {
    devtoolSegmentExplorer: false
  },
  async rewrites() {
    if (!serverUrl) return [];

    return [
      {
        source: "/api/auth/:path*",
        destination: `${serverUrl}/api/auth/:path*`
      }
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "http", hostname: "localhost" },
      ...(serverHostname
        ? [{ protocol: serverUrl.startsWith("https") ? "https" : "http", hostname: serverHostname }]
        : [])
    ]
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  }
};

export default nextConfig;
