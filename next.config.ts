import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static site — emit plain HTML/CSS/JS to out/ for nginx to serve.
  output: "export",
  async rewrites() {
    // In production, Nginx proxies /api/* directly to the backend, so this
    // never applies there. Locally there's no reverse proxy in front of the
    // Next.js dev server (frontend :3001, backend :8000), so relative
    // /api/* calls from the browser need to be forwarded to the backend.
    // Also proxy /widget/*, /demo, and /widget.js which are served by the
    // backend (not Next.js) — needed for the Test AI console iframe.
    if (process.env.NODE_ENV === "production") return [];
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8000/api/:path*",
      },
      {
        source: "/widget/:path*",
        destination: "http://localhost:8000/widget/:path*",
      },
      {
        source: "/demo",
        destination: "http://localhost:8000/demo",
      },
      {
        source: "/widget.js",
        destination: "http://localhost:8000/widget.js",
      },
    ];
  },
};

export default nextConfig;
