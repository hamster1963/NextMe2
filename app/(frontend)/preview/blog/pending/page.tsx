import { requirePreviewAccess } from '../_lib/require-preview-access'

export default async function PendingPreview(props) {
  const searchParams = (await props.searchParams) || {}
  requirePreviewAccess(searchParams)

  return (
    <section className="flex min-h-[50vh] items-center justify-center px-4 py-12 text-center">
      <div className="max-w-md space-y-3">
        <h1 className="font-medium text-xl tracking-tight">
          Live preview is preparing
        </h1>
        <p className="text-neutral-600 text-sm dark:text-neutral-400">
          Save this post once (or wait for autosave), then click Live Preview
          again.
        </p>
      </div>
    </section>
  )
}
