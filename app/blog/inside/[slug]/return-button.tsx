'use client'

import { BackIconSmall } from 'app/components/Icon'
import { cn } from 'lib/utils'
import { useRouter } from 'next/navigation'

export default function ReturnButton({
  title,
  className,
}: { title?: string; className?: string }) {
  const router = useRouter()
  return (
    <div
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          if (sessionStorage.getItem('fromBlogPage')) {
            router.back()
          } else {
            router.push('/blog/inside')
          }
        }
      }}
      onClick={() => {
        if (sessionStorage.getItem('fromBlogPage')) {
          router.back()
        } else {
          router.push('/blog/inside')
        }
      }}
      className={cn(
        'flex cursor-pointer items-center justify-start',
        className
      )}
    >
      <BackIconSmall />
      {title}
    </div>
  )
}
