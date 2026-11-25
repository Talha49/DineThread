// Set SITE_URL when the project has a custom domain.
const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
const defaultUrl = vercelHost ? `https://${vercelHost}` : `http://127.0.0.1:${process.env.PORT || 3000}`;

export const siteOrigin = new URL(process.env.SITE_URL || defaultUrl).origin;
