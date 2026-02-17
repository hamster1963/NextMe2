import { getSiteSettings, toAbsoluteUrl } from './db/site-settings'

export const revalidate = 3600

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
