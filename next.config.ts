import type { NextConfig } from "next";

const SUPABASE_HOST = "ybyyxcuvxuzrledbitky.supabase.co";
const isDev = process.env.NODE_ENV !== "production";

// React/Turbopack use eval() in dev mode for debugging (stack reconstruction, HMR)
// but never in production — so 'unsafe-eval' is only needed outside production.
// react-grab (dev-only overlay in app/layout.tsx) loads from unpkg.com and
// pulls its own stylesheet/font/images, so those are also dev-only relaxations.
// GA4 (gtag.js) loads its script from googletagmanager.com and sends hits to
// google-analytics.com; googletagmanager.com also serves the noscript pixel.
const scriptSrc = isDev
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://www.googletagmanager.com"
  : "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com";
// @measured/puck's bundled CSS (admin Puck editor pages) @imports Inter from
// rsms.me in both dev and production, so these aren't dev-only relaxations.
const styleSrc = "style-src 'self' 'unsafe-inline' https://rsms.me";
const fontSrc = "font-src 'self' data: https://rsms.me";
// Supabase Storage host removed — Storage-served images now come from our
// own same-origin /api/storage route (see lib/storage/MIGRATION_NOTES.md).
// Deploy this alongside Phase 6's DB cutover: existing DB rows still hold
// Supabase Storage URLs until that cutover rewrites them.
const imgSrc = isDev
  ? "img-src 'self' data: https:"
  : "img-src 'self' data: https://www.googletagmanager.com https://www.google-analytics.com";

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
      // *.google-analytics.com covers GA4's regional collection subdomains (region1, region2, ...)
      `connect-src 'self' https://${SUPABASE_HOST} wss://${SUPABASE_HOST} https://*.google-analytics.com https://www.googletagmanager.com`,
      "frame-src 'self' https://www.google.com https://maps.google.com",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "standalone",
  images: {
    // Supabase Storage remote patterns removed — images now served from our
    // own same-origin /api/storage route, which needs no remotePatterns
    // entry (only required for foreign origins). See
    // lib/storage/MIGRATION_NOTES.md.
    remotePatterns: [],
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
