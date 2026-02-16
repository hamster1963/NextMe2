export function TopBlur() {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `<div class="pointer-events-none fixed -mt-40 top-0  left-1/2 isolate z-40 h-44 w-[600px] -translate-x-1/2 translate-y-24">
      <div class="absolute inset-0 rotate-180 [mask-image:radial-gradient(closest-side,black,transparent)] [mask-position:bottom,center] [mask-repeat:no-repeat]" style="backdrop-filter: blur(0.5px); -webkit-backdrop-filter: blur(0.5px); transform: translateZ(0); will-change: transform; opacity: 1;"></div>
      <div class="absolute inset-0 rotate-180 [mask-image:radial-gradient(closest-side,black,transparent)] [mask-position:bottom,center] [mask-repeat:no-repeat]" style="backdrop-filter: blur(1px); -webkit-backdrop-filter: blur(1px); transform: translateZ(0); will-change: transform; opacity: 1;"></div>
      <div class="absolute inset-0 rotate-180 [mask-image:radial-gradient(closest-side,black,transparent)] [mask-position:bottom,center] [mask-repeat:no-repeat]" style="backdrop-filter: blur(2px); -webkit-backdrop-filter: blur(2px); transform: translateZ(0); will-change: transform; opacity: 1;"></div>
      <div class="absolute inset-0 rotate-180 [mask-image:radial-gradient(closest-side,black,transparent)] [mask-position:bottom,center] [mask-repeat:no-repeat]" style="backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); transform: translateZ(0); will-change: transform; opacity: 1;"></div>
      <div class="absolute inset-0 rotate-180 [mask-image:radial-gradient(closest-side,black,transparent)] [mask-position:bottom,center] [mask-repeat:no-repeat]" style="backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); transform: translateZ(0); will-change: transform; opacity: 1;"></div>
    </div>`,
      }}
    />
  )
}

export function BottomBlur() {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `<div class="pointer-events-none fixed bottom-0 left-1/2 isolate z-50 h-64 w-[800px] -translate-x-1/2 translate-y-24">
      <div class="absolute inset-0 rotate-180 [mask-image:radial-gradient(closest-side,black,transparent)] [mask-position:bottom,center] [mask-repeat:no-repeat]" style="backdrop-filter: blur(0.5px); -webkit-backdrop-filter: blur(0.5px); transform: translateZ(0); will-change: transform; opacity: 1;"></div>
      <div class="absolute inset-0 rotate-180 [mask-image:radial-gradient(closest-side,black,transparent)] [mask-position:bottom,center] [mask-repeat:no-repeat]" style="backdrop-filter: blur(1px); -webkit-backdrop-filter: blur(1px); transform: translateZ(0); will-change: transform; opacity: 1;"></div>
      <div class="absolute inset-0 rotate-180 [mask-image:radial-gradient(closest-side,black,transparent)] [mask-position:bottom,center] [mask-repeat:no-repeat]" style="backdrop-filter: blur(2px); -webkit-backdrop-filter: blur(2px); transform: translateZ(0); will-change: transform; opacity: 1;"></div>
      <div class="absolute inset-0 rotate-180 [mask-image:radial-gradient(closest-side,black,transparent)] [mask-position:bottom,center] [mask-repeat:no-repeat]" style="backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); transform: translateZ(0); will-change: transform; opacity: 1;"></div>
      <div class="absolute inset-0 rotate-180 [mask-image:radial-gradient(closest-side,black,transparent)] [mask-position:bottom,center] [mask-repeat:no-repeat]" style="backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); transform: translateZ(0); will-change: transform; opacity: 1;"></div>
    </div>`,
      }}
    />
  )
}
