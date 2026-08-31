import type { NextConfig } from "next";

// Falls back to the Supabase Cloud host for local dev; set NEXT_PUBLIC_SUPABASE_URL
// to the self-hosted domain (e.g. https://supabase.pceuropa.lt) in production.
const SUPABASE_HOST = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "ybyyxcuvxuzrledbitky.supabase.co";
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
const styleSrc = "style-src 'self' 'unsafe-inline'";
const fontSrc = "font-src 'self' data:";
const imgSrc = isDev
  ? `img-src 'self' data: https: https://${SUPABASE_HOST}`
  : `img-src 'self' data: https://${SUPABASE_HOST} https://www.googletagmanager.com https://www.google-analytics.com`;

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
    remotePatterns: [
      {
        protocol: 'https',
        hostname: SUPABASE_HOST,
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: SUPABASE_HOST,
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
