/** App-wide metadata and brand constants. */
export const siteConfig = {
  name: "BOVAS & Company",
  shortName: "BOVAS",
  tagline: "Logistics Dashboard",
  description:
    "Fuel logistics and loading-ticket management platform for BOVAS & Company.",
} as const;

export type SiteConfig = typeof siteConfig;
