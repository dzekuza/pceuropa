import type { NextConfig } from "next";

const SUPABASE_HOST = "ybyyxcuvxuzrledbitky.supabase.co";
const isDev = process.env.NODE_ENV !== "production";

// React/Turbopack use eval() in dev mode for debugging (stack reconstruction, HMR)
// but never in production — so 'unsafe-eval' is only needed outside production.
// react-grab (dev-only overlay in app/layout.tsx) loads from unpkg.com and
// pulls its own stylesheet/font/images, so those are also dev-only relaxations.
const scriptSrc = isDev
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com"
  : "script-src 'self' 'unsafe-inline'";
const styleSrc = isDev
  ? "style-src 'self' 'unsafe-inline' https://rsms.me"
  : "style-src 'self' 'unsafe-inline'";
const fontSrc = isDev
  ? "font-src 'self' data: https://rsms.me"
  : "font-src 'self' data:";
const imgSrc = isDev
  ? `img-src 'self' data: https: https://${SUPABASE_HOST}`
  : `img-src 'self' data: https://${SUPABASE_HOST}`;

const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      scriptSrc,
      // browser-image-compression spawns a web worker from a blob: URL; without an
      // explicit worker-src it falls back to script-src and gets blocked.
      "worker-src 'self' blob:",
      styleSrc,
      imgSrc,
      fontSrc,
      `connect-src 'self' https://${SUPABASE_HOST} wss://${SUPABASE_HOST}`,
      "frame-src 'self' https://www.google.com https://maps.google.com",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ybyyxcuvxuzrledbitky.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'ybyyxcuvxuzrledbitky.supabase.co',
        pathname: '/storage/v1/render/image/public/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
