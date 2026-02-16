import DailyContent from 'app/blog/daily/[slug]/blog-content'
import { requirePreviewAccess } from '../../_lib/require-preview-access'

export default async function DailyPreview(props) {
  const params = await props.params
  const searchParams = (await props.searchParams) || {}

  requirePreviewAccess(searchParams)

  return (
    <section className="sm:px-14 sm:pt-6">
      <DailyContent slug={params.slug} includeDraft />
    </section>
  )
}
