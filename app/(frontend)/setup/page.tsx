import Link from 'next/link'
import { redirect } from 'next/navigation'
import { isPayloadBootstrapped } from '../db/bootstrap'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Setup',
}

export default async function SetupPage() {
  const ready = await isPayloadBootstrapped()
  if (ready) {
    redirect('/')
  }

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-xl flex-col justify-center gap-5 sm:px-6">
      <h1 className="font-semibold text-2xl tracking-tight">首次部署初始化</h1>
      <p className="text-neutral-600 text-sm dark:text-neutral-300">
        检测到后台还未初始化。请先进入 Payload 后台创建第一个管理员账号，然后到
        Globals 里的 Site Settings 配置站点地址，完成后即可编辑和发布博客内容。
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin"
          className="rounded-md bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black"
        >
          进入后台初始化
        </Link>
        <Link
          href="/setup"
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm dark:border-neutral-700"
        >
          我已完成，刷新状态
        </Link>
      </div>
      <p className="text-neutral-500 text-xs dark:text-neutral-400">
        后台地址: <code>/admin</code>
      </p>
    </section>
  )
}
