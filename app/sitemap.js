import { siteOrigin } from "@/lib/site-origin";

export default function sitemap() {
  // These are the core static pages. In the future, dynamic restaurant pages 
  // can be fetched from the database and added to this array.
  return [
    {
      url: siteOrigin,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${siteOrigin}/login`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.8,
    },
    {
      url: `${siteOrigin}/signup`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.8,
    },
    {
      url: `${siteOrigin}/onboarding`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ];
}
