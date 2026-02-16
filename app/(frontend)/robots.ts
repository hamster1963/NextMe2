import { getSiteSettings, toAbsoluteUrl } from './db/site-settings'

export const dynamic = 'force-dynamic'

export default async function robots() {
  const { siteUrl } = await getSiteSettings()

  return {
    rules: [
      {
        userAgent: '*',
      },
    ],
    sitemap: toAbsoluteUrl('/sitemap.xml', siteUrl),
    host: siteUrl,
  }
}
