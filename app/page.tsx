import { cn } from 'lib/utils'
import Avatar from './avatar'

export default function Page() {
  const currentYear = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
  }).format(new Date())

  return (
    <main
      className="-my-14 sm:-mt-[85px] sm:-mb-20 flex min-h-dvh flex-col justify-center"
      aria-label="个人主页内容"
    >
      <div className="sm:mt-16 sm:px-28">
        <Avatar />
        <h1 className="mb-1 font-medium text-xl tracking-tighter">
          Hamster1963
        </h1>
        <p className="prose prose-neutral dark:prose-invert text-[13px]">
          开发者、业余吉他手。
        </p>
        <section className={'mb-4 pt-10 font-medium text-md'}>
          👋 大家好，我是Hamster。
          <br />
          喜欢写代码，也喜欢写文章。
          <br />
          我会在这里分享一些技术相关的东西/一些想法。
          <br />
        </section>
      </div>
      <footer className={cn('mb-6 pt-10 sm:px-28')}>
        <section className="flex flex-col">
          <p className="mt-1 flex gap-1 font-light text-[13px] text-neutral-600/50 tracking-tight dark:text-neutral-300/50">
            使用{' '}
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
            构建
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
