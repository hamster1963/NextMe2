import BlogContent from 'app/blog/inside/[slug]/blog-content'
import PreviewLock from '../../_components/preview-lock'
import {
  buildLockedPreviewPath,
  getPreviewDocId,
  getPreviewTitle,
  requirePreviewAccess,
} from '../../_lib/require-preview-access'

export default async function InsidePreview(props) {
  const params = await props.params
  const searchParams = (await props.searchParams) || {}
  const previewDocId = getPreviewDocId(searchParams)
  const previewTitle = getPreviewTitle(searchParams)

  requirePreviewAccess(searchParams)
  const lockedPreviewPath = buildLockedPreviewPath({
    section: 'inside',
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
        previewTitle={previewTitle}
        previewReloadPath={lockedPreviewPath}
      />
    </section>
  )
}
