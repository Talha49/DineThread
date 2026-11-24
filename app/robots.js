export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/api/'], // Prevent crawling of private dashboards and raw APIs
    },
    sitemap: 'https://davoriq.com/sitemap.xml',
  };
}
