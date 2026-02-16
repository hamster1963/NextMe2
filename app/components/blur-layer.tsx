export default function NewBlurLayer() {
  return (
    <>
      <div className="pointer-events-none fixed top-0 right-0 left-0 z-10 h-[75px] bg-linear-to-t from-transparent via-white/45 to-white sm:h-[100px] dark:hidden" />
      <div className="pointer-events-none fixed top-0 right-0 left-0 z-10 hidden h-[75px] bg-linear-to-t from-transparent via-[#111010]/45 to-[#111010] sm:h-[100px] dark:block" />
    </>
  )
}
