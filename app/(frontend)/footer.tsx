'use client'

import { cn } from 'lib/utils'
import { usePathname } from 'next/navigation'

type FooterProps = {
  showOnHome: boolean
  timeZone: string
  builtWithText: string
  primaryLinkLabel: string
  primaryLinkUrl: string
  secondaryLinkLabel: string
  secondaryLinkUrl: string
  ownerLabel: string
  ownerUrl: string
  copyrightStartYear: number
}

export default function Footer({
  showOnHome,
  timeZone,
  builtWithText,
  primaryLinkLabel,
  primaryLinkUrl,
  secondaryLinkLabel,
  secondaryLinkUrl,
  ownerLabel,
  ownerUrl,
  copyrightStartYear,
}: FooterProps) {
  const pathname = usePathname()

  const currentYear = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
  }).format(new Date())

  const shouldHide = pathname === '/' && !showOnHome

  return (
    <footer className={cn('pt-20 sm:px-14', shouldHide && 'hidden')}>
      <section className="flex flex-col">
        <p className="mt-1 flex gap-1 font-light text-[13px] text-neutral-600/50 tracking-tight dark:text-neutral-300/50">
          {builtWithText}{' '}
          <a
            href={primaryLinkUrl}
            className="cursor-pointer font-normal underline decoration-2 decoration-yellow-500 underline-offset-2 dark:decoration-yellow-500/50"
          >
            {primaryLinkLabel}
          </a>
          &
          <a
            href={secondaryLinkUrl}
            className="cursor-pointer font-normal underline decoration-2 decoration-yellow-500 underline-offset-2 dark:decoration-yellow-500/50"
          >
            {secondaryLinkLabel}
          </a>{' '}
        </p>
        <section className="mt-1 flex items-center gap-2 font-light text-[13px] text-neutral-600/50 tracking-tight dark:text-neutral-300/50">
          © {copyrightStartYear}-{currentYear}{' '}
          <a href={ownerUrl}>{ownerLabel}</a>
        </section>
      </section>
    </footer>
  )
}
