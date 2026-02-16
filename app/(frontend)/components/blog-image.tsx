'use client'
import { AnimatePresence, m } from 'framer-motion'
import { cn } from 'lib/utils'
import { useEffect, useRef, useState } from 'react'

export default function BlogImage({
  src,
  alt,
  width,
  height,
  hex,
  loading = 'lazy',
}: {
  src: string
  alt: string
  width: number
  height: number
  hex: string
  loading?: 'lazy' | 'eager'
}) {
  const [isLoading, setIsLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [shouldLoad, setShouldLoad] = useState(loading === 'eager')
  const containerRef = useRef<HTMLDivElement | null>(null)
  const aspectRatio = width && height ? `${width} / ${height}` : undefined

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (loading === 'eager') {
      setShouldLoad(true)
      return
    }

    if (!containerRef.current) {
      return
    }

    if (!('IntersectionObserver' in window)) {
      setShouldLoad(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true)
          observer.disconnect()
        }
      },
      { rootMargin: '0px', threshold: 0.1 }
    )

    observer.observe(containerRef.current)

    return () => observer.disconnect()
  }, [loading])

  return (
    <>
      <div
        ref={containerRef}
        className={cn('relative w-full', !isMobile && 'cursor-zoom-in')}
        style={aspectRatio ? { aspectRatio } : undefined}
        onClick={() => !isMobile && setIsExpanded(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            setIsExpanded(true)
          }
        }}
      >
        <div
          className="absolute inset-0 rounded-xl"
          style={{ backgroundColor: hex }}
        />
        <img
          className={cn(
            'absolute inset-0 h-full w-full rounded-xl object-cover transition-all duration-500 dark:brightness-75 dark:hover:brightness-100',
            isLoading ? 'opacity-0 blur-lg' : 'opacity-100 blur-0'
          )}
          width={width}
          height={height}
          alt={alt}
          decoding="async"
          loading={loading}
          src={shouldLoad ? src : undefined}
          onLoad={() => setIsLoading(false)}
        />
        <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-gray-900/10 ring-inset dark:ring-white/10" />
      </div>

      <AnimatePresence>
        {isExpanded && !isMobile && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center backdrop-blur-md"
            onClick={() => setIsExpanded(false)}
          >
            <div className="relative">
              <m.img
                src={src}
                alt={alt}
                className="max-h-[80vh] max-w-[80vw] rounded-lg object-contain"
              />
              <div className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-gray-900/10 ring-inset dark:ring-white/10" />
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  )
}
