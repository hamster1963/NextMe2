import BlogContent from 'app/blog/tech/[slug]/blog-content'
import PreviewLock from '../../_components/preview-lock'
import {
  buildLockedPreviewPath,
  getPreviewDocId,
  requirePreviewAccess,
} from '../../_lib/require-preview-access'

export default async function TechPreview(props) {
  const params = await props.params
  const searchParams = (await props.searchParams) || {}
  const previewDocId = getPreviewDocId(searchParams)

  requirePreviewAccess(searchParams)
  const lockedPreviewPath = buildLockedPreviewPath({
    section: 'tech',
    slug: params.slug,
    searchParams,
  })

  return (
    <section className="sm:px-14 sm:pt-6">
      <PreviewLock lockedPath={lockedPreviewPath} />
      <BlogContent
        slug={params.slug}
        includeDraft
        previewDocId={previewDocId}
        previewReloadPath={lockedPreviewPath}
      />
    </section>
  )
}
