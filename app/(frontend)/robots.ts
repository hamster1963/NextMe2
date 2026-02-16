export const dynamic = 'force-static'

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
      },
    ],
    sitemap: 'https://buycoffee.top/sitemap.xml',
    host: 'https://buycoffee.top',
  }
}
