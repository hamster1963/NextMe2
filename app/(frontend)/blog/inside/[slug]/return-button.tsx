'use client'

import { BackIconSmall } from 'app/components/Icon'
import { cn } from 'lib/utils'
import { useRouter } from 'next/navigation'

function withReloadQuery(path: string) {
  const url = new URL(path, window.location.origin)
  url.searchParams.set('previewReloadAt', Date.now().toString())
  return `${url.pathname}${url.search}`
}

export default function ReturnButton({
  title,
  className,
  reloadPreviewPath,
}: { title?: string; className?: string; reloadPreviewPath?: string }) {
  const router = useRouter()

  const goBack = () => {
    if (reloadPreviewPath) {
      window.location.replace(withReloadQuery(reloadPreviewPath))
      return
    }

    if (sessionStorage.getItem('fromBlogPage')) {
      router.back()
    } else {
      router.push('/blog/inside')
    }
  }

  return (
    <div
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          goBack()
        }
      }}
      onClick={goBack}
      className={cn(
        'flex cursor-pointer items-center justify-start',
        className
      )}
    >
      <BackIconSmall />
      {title}
    </div>
  )
}
