import { cn } from 'lib/utils'
import { redirect } from 'next/navigation'
import Avatar from './avatar'
import { isPayloadBootstrapped } from './db/bootstrap'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const ready = await isPayloadBootstrapped()
  if (!ready) {
    redirect('/setup')
  }

  const currentYear = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
  }).format(new Date())

  return (
    <main
      className="-my-14 sm:-mt-[85px] sm:-mb-20 flex min-h-dvh flex-col justify-center"
      aria-label="Personal homepage content"
    >
      <div className="sm:mt-16 sm:px-28">
        <Avatar />
        <h1 className="mb-1 font-medium text-xl tracking-tighter">
          Hamster1963
        </h1>
        <p className="prose prose-neutral dark:prose-invert text-[13px]">
          Developer and amateur guitarist.
        </p>
        <section className={'mb-4 pt-10 font-medium text-md'}>
          👋 Hi, I&apos;m Hamster.
          <br />I enjoy writing code and sharing ideas.
          <br />I share posts about technology and random thoughts here.
          <br />
        </section>
      </div>
      <footer className={cn('mb-6 pt-10 sm:px-28')}>
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
    </main>
  )
}
