'use client'

import { cn } from 'lib/utils'
import { usePathname } from 'next/navigation'

export default function Footer() {
  const pathname = usePathname()

  const currentYear = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
  }).format(new Date())

  return (
    <footer className={cn('pt-20 sm:px-14', pathname === '/' && 'hidden')}>
      <section className="flex flex-col">
        <p className="mt-1 flex gap-1 font-light text-[13px] text-neutral-600/50 tracking-tight dark:text-neutral-300/50">
          Built with{' '}
          <a
            href="https://nextjs.org"
            className="cursor-pointer font-normal underline decoration-2 decoration-yellow-500 underline-offset-2 dark:decoration-yellow-500/50"
          >
            Next.js
          </a>
          &
          <a
            href="https://github.com/hamster1963/NextMe"
            className="cursor-pointer font-normal underline decoration-2 decoration-yellow-500 underline-offset-2 dark:decoration-yellow-500/50"
          >
            NextMe
          </a>{' '}
        </p>
        <section className="mt-1 flex items-center gap-2 font-light text-[13px] text-neutral-600/50 tracking-tight dark:text-neutral-300/50">
          © 2021-{currentYear}{' '}
          <a href={'https://github.com/hamster1963'}>@Hamster1963</a>
        </section>
      </section>
    </footer>
  )
}
