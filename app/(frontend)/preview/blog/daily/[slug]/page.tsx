import DailyContent from 'app/blog/daily/[slug]/blog-content'
import PreviewLock from '../../_components/preview-lock'
import {
  buildLockedPreviewPath,
  requirePreviewAccess,
} from '../../_lib/require-preview-access'

export default async function DailyPreview(props) {
  const params = await props.params
  const searchParams = (await props.searchParams) || {}

  requirePreviewAccess(searchParams)
  const lockedPreviewPath = buildLockedPreviewPath({
    section: 'daily',
    slug: params.slug,
    searchParams,
  })

  return (
    <section className="sm:px-14 sm:pt-6">
      <PreviewLock lockedPath={lockedPreviewPath} />
      <DailyContent
        slug={params.slug}
        includeDraft
        previewReloadPath={lockedPreviewPath}
      />
    </section>
  )
}
