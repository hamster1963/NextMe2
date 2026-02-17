'use client'

import { useEffect } from 'react'

function withReloadQuery(path: string) {
  const url = new URL(path, window.location.origin)
  url.searchParams.set('previewReloadAt', Date.now().toString())
  return `${url.pathname}${url.search}`
}

function shouldAllowAnchor(anchor: HTMLAnchorElement, href: string) {
  if (!href) {
    return true
  }

  if (
    href.startsWith('#') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:')
  ) {
    return true
  }

  if (anchor.target === '_blank' || anchor.hasAttribute('download')) {
    return true
  }

  return false
}

type PreviewLockProps = {
  lockedPath: string
}

export default function PreviewLock({ lockedPath }: PreviewLockProps) {
  useEffect(() => {
    const forceReloadToLockedPath = () => {
      window.location.replace(withReloadQuery(lockedPath))
    }

    const onClickCapture = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      const anchor = target?.closest?.('a[href]') as HTMLAnchorElement | null
      if (!anchor) {
        return
      }

      const href = anchor.getAttribute('href') || ''
      if (shouldAllowAnchor(anchor, href)) {
        return
      }

      const absoluteURL = new URL(anchor.href, window.location.origin)
      if (absoluteURL.origin !== window.location.origin) {
        return
      }

      event.preventDefault()
      forceReloadToLockedPath()
    }

    const onPopState = () => {
      forceReloadToLockedPath()
    }

    document.addEventListener('click', onClickCapture, true)
    window.addEventListener('popstate', onPopState)

    return () => {
      document.removeEventListener('click', onClickCapture, true)
      window.removeEventListener('popstate', onPopState)
    }
  }, [lockedPath])

  return null
}
