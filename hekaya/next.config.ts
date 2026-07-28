import type { NextConfig } from "next";
import path from "path";

// Baseline security headers for every route (see docs/05_SECURITY_AUTH.md).
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
];

// Allow next/image to optimize images served from Supabase Storage
// (admin-uploaded product photos). Derived from the Supabase URL so it keeps
// working if the project ref changes.
const supabaseHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").hostname;
  } catch {
    return undefined;
  }
})();

const supabaseOrigin = supabaseHost ? `https://${supabaseHost}` : "";
const supabaseWs = supabaseHost ? `wss://${supabaseHost}` : "";
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' https://accounts.google.com",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob:${supabaseOrigin ? ` ${supabaseOrigin}` : ""}`,
  "font-src 'self' data:",
  `connect-src 'self' https://accounts.google.com${
    supabaseOrigin ? ` ${supabaseOrigin} ${supabaseWs}` : ""
  }`,
  "frame-src https://accounts.google.com",
  "frame-ancestors 'none'",
  "form-action 'self'",
  // No plugins, and no <base> hijacking of relative URLs.
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  // Tell Next.js that THIS project folder is the workspace root,
  // silencing the "multiple lockfiles" warning.
  outputFileTracingRoot: path.join(__dirname),
  images: supabaseHost
    ? {
        remotePatterns: [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/**",
          },
        ],
      }
    : undefined,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          ...securityHeaders,
          { key: "Content-Security-Policy", value: csp },
        ],
      },
    ];
  },
};

export default nextConfig;
