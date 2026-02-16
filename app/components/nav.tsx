'use client'

import { cn } from 'lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useMemo } from 'react'

import {
  BeakerIcon,
  ChatBubbleLeftRightIcon,
  FireIcon,
  FolderOpenIcon,
  HomeIcon,
} from '@heroicons/react/20/solid'

export const siteUrlList = [
  {
    name: '主页',
    url: '/',
    icon: HomeIcon,
  },
  {
    name: '博客',
    url: '/blog',
    icon: FireIcon,
  },
]

export default function Nav() {
  const _nowPath = usePathname()
  const isActive = useMemo(() => {
    return (url: string) =>
      _nowPath === url ||
      (_nowPath.includes('/blog') && url.includes('/blog'))
  }, [_nowPath])

  // 去除滚动显示/隐藏逻辑，始终显示导航与渐变层
  return (
    <div className="fixed inset-x-0 top-0 z-50 flex flex-col items-center">
      {/* 渐变层：始终可见，用于提升顶部文字与背景对比 */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 top-gradient-overlay h-24'
        )}
      />
      {/* 占位（避免内容被覆盖，可按需调整高度） */}
      <div className="pt-1" />
      <nav className="relative mt-2 flex items-center gap-2 px-2 py-1">
        {siteUrlList.map((site) => (
          <Link
            key={site.name}
            href={site.url}
            prefetch={true}
            className={cn(
              'relative-link relative rounded-md px-2.5 py-[8px] font-[600] text-[12px] transition-all duration-200 md:text-[13px]',
              isActive(site.url)
                ? 'text-black dark:text-white'
                : 'text-stone-400 hover:text-stone-700 dark:text-stone-500 dark:hover:text-stone-200'
            )}
          >
            <div className="relative z-30 flex items-center gap-1">
              <site.icon className="h-4 w-4 shrink-0 sm:hidden" />
              <span className="hidden sm:block">{site.name}</span>
            </div>
          </Link>
        ))}
      </nav>
    </div>
  )
}
