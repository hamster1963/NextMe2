import { revalidatePath, revalidateTag } from 'next/cache'
import type { GlobalAfterChangeHook } from 'payload'

export const revalidateSiteSettings: GlobalAfterChangeHook = ({ doc }) => {
  revalidatePath('/', 'layout')
  revalidatePath('/')
  revalidatePath('/blog')
  revalidatePath('/blog/inside')
  revalidatePath('/blog/daily')
  revalidatePath('/sitemap.xml')
  revalidatePath('/robots.txt')
  revalidateTag('site-settings')
  return doc
}
