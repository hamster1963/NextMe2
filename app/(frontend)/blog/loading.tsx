import { Loader } from '../components/loader-spin'

export default function Loading() {
  return (
    <section className="sm:px-14 sm:pt-6">
      <h1 className="mb-2 font-medium text-2xl tracking-tighter">Blog</h1>
      <p className="prose prose-neutral dark:prose-invert mb-2 text-sm">
        A collection of posts.
      </p>
      <Loader visible={true} />
    </section>
  )
}
