'use client'

import { cn } from 'lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo } from 'react'

type TypeSwitchProps = {
  techLabel: string
  insideLabel: string
  dailyLabel: string
}

export default function TypeSwitch({
  techLabel,
  insideLabel,
  dailyLabel,
}: TypeSwitchProps) {
  const nowPath = usePathname()
  const blogTypeList = [
    {
      name: techLabel,
      url: '/blog',
    },
    {
      name: insideLabel,
      url: '/blog/inside',
    },
    {
      name: dailyLabel,
      url: '/blog/daily',
    },
  ]

  const isActive = useMemo(() => {
    return (url: string) => nowPath === url
  }, [nowPath])

  return (
    <div className="flex w-fit items-center rounded-[50px] border-[1px] border-white/15 border-solid bg-stone-100 p-[1.5px] dark:bg-black">
      {blogTypeList.map((site) => {
        return (
          <Link
            key={site.name}
            href={site.url}
            prefetch={true}
            className={cn(
              'relative px-1.5 py-0.5',
              isActive(site.url)
                ? 'text-black dark:text-white'
                : 'text-stone-400 dark:text-stone-500'
            )}
          >
            {isActive(site.url) && (
              <div
                className="absolute inset-0 z-10 h-full w-full content-center bg-white dark:bg-stone-800"
                style={{
                  borderRadius: 48.5,
                }}
              />
            )}
            <p className="relative z-20 text-[11px]">{site.name}</p>
          </Link>
        )
      })}
    </div>
  )
}
