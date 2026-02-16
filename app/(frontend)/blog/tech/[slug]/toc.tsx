'use client'

import { QueueListIcon } from '@heroicons/react/20/solid'
import { m } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'

const scrollToHeading = (text: string) => {
  const headingTag = document.getElementById(decodeURI(text))
  if (headingTag) {
    window.scrollTo({
      behavior: 'smooth',
      top: headingTag.offsetTop - 100,
    })
  }
}

// TOC component
export default function TOC({ headings }) {
  const [activeId, setActiveId] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const [progress, setProgress] = useState(0)

  // Close TOC when clicking outside
  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (
        isVisible &&
        !target.closest('.toc-content') &&
        !target.closest('.toc-button')
      ) {
        setIsVisible(false)
      }
    },
    [isVisible]
  )

  useEffect(() => {
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [handleClickOutside])

  useEffect(() => {
    const calculateProgress = () => {
      const windowHeight = window.innerHeight
      const documentHeight =
        document.documentElement.scrollHeight - windowHeight
      const scrollTop = window.scrollY
      const progress = (scrollTop / documentHeight) * 100
      setProgress(Math.min(Math.round(progress), 100))
    }

    window.addEventListener('scroll', calculateProgress)
    calculateProgress() // Initial calculation

    return () => window.removeEventListener('scroll', calculateProgress)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-50px 0px -50% 0px' }
    )

    for (const heading of headings) {
      const element = document.getElementById(decodeURI(heading.id))
      if (element) observer.observe(element)
    }

    return () => observer.disconnect()
  }, [headings])

  return (
    <>
      {/* Desktop button */}
      <div className="fixed top-[15%] left-2 z-40 hidden items-center lg:flex">
        <button
          type="button"
          onClick={() => setIsVisible(!isVisible)}
          className="toc-button cursor-pointer rounded-full p-2 text-neutral-500 text-sm transition-colors hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
        >
          <QueueListIcon className="h-4 w-4" />
        </button>
        <span className="text-neutral-500 text-xs dark:text-neutral-400">
          {progress}%
        </span>
      </div>

      {/* Mobile floating button */}
      <div className="fixed right-5 bottom-6 z-40 flex items-center gap-1 lg:hidden">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setIsVisible(!isVisible)
          }}
          className="cursor-pointer rounded-full bg-white/80 px-2 py-1 font-medium text-neutral-500 text-xs backdrop-blur-sm dark:bg-black/80 dark:text-neutral-400"
        >
          {progress}%
        </button>
      </div>

      {/* TOC content */}
      <m.div
        className={`toc-content fixed z-30 overflow-y-auto ${
          isVisible
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        } ${
          // Full screen on mobile; keep default on desktop
          'lg:top-[18%] lg:left-0 lg:max-h-[75vh] lg:w-fit lg:bg-transparent lg:p-4 lg:backdrop-blur-none lg:dark:bg-transparent ' +
          'top-0 left-0 h-full w-full bg-white/95 p-8 backdrop-blur-sm dark:bg-black/95'
        }`}
        initial={{ opacity: 0, x: -20 }}
        animate={{
          opacity: isVisible ? 1 : 0,
          x: isVisible ? 0 : -20,
        }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <ul className="text-left">
          <div className="mb-8 lg:hidden" />
          <div className="hidden lg:block">
            <m.a
              href={'#'}
              onClick={(e) => {
                e.preventDefault()
                setActiveId('')
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="font-medium text-[13px] text-neutral-400 transition-colors hover:text-neutral-800 dark:text-neutral-600 dark:hover:text-neutral-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Back to top
            </m.a>
          </div>
          {headings.map((heading) => (
            <m.li
              key={heading.id}
              className={`${getIndentClass(heading.level)} mt-2`}
            >
              <a
                onClick={(e) => {
                  e.stopPropagation()
                  scrollToHeading(heading.id)
                  if (window.innerWidth < 1024) {
                    // Close TOC after click on mobile
                    setIsVisible(false)
                  }
                }}
                className={`block cursor-pointer font-medium text-[12px] transition-colors hover:text-neutral-800 dark:hover:text-neutral-400 ${
                  activeId === heading.id
                    ? 'text-neutral-800 dark:text-neutral-400'
                    : 'text-neutral-400 dark:text-neutral-600'
                }`}
              >
                {heading.text}
              </a>
            </m.li>
          ))}
        </ul>
      </m.div>
    </>
  )
}

// Helper to compute indentation classes by heading level
function getIndentClass(level: number): string {
  switch (level) {
    case 2:
      return 'ml-0'
    case 3:
      return 'ml-2'
    case 4:
      return 'ml-4'
    case 5:
      return 'ml-6'
    default:
      return 'ml-8'
  }
}
