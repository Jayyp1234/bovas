import type { NextConfig } from "next";

/** Sent with every page and route handler. The API sends its own. */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Nothing in BOVAS is meant to be framed by another site.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  // Browsers only honour this over HTTPS, so it has no effect on http://localhost.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  experimental: {
    serverActions: {
      // Uploads pass through server actions: loading program CSVs up to 1 MB and profile
      // pictures up to 2 MB (bovas-api ProgramImporter / StaffService), plus form overhead.
      bodySizeLimit: "3mb",
    },
  },
};

export default nextConfig;
