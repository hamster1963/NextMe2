'use client'
import { useDrag } from '@use-gesture/react'
import avatar from 'app/avatar.webp'
import { type MotionProps, m as motion, useSpring } from 'framer-motion'
import Image from 'next/image'
import { useRef } from 'react'

type AvatarProps = {
  name?: string
  avatarUrl?: string
  avatarAlt?: string
}

export default function Avatar({
  name = 'Profile',
  avatarUrl,
  avatarAlt,
}: AvatarProps) {
  const avatarRef = useRef<HTMLDivElement>(null)
  const x = useSpring(0, {
    stiffness: 400,
    damping: 30,
  })
  const y = useSpring(0, {
    stiffness: 400,
    damping: 30,
  })

  const bind = useDrag(
    ({ movement: [mx, my], down }) => {
      x.set(down ? mx : 0)
      y.set(down ? my : 0)
    },
    {
      bounds: {
        left: -200,
        right: 200,
        top: -200,
        bottom: 200,
      },
      filterTaps: true,
      rubberband: true,
      from: [0, 0],
      pointer: { touch: true },
      preventScroll: true,
    }
  )

  return (
    <div className="relative mb-6">
      <motion.div
        ref={avatarRef}
        {...(bind() as MotionProps)}
        style={{
          x,
          y,
          touchAction: 'none',
        }}
        whileTap={{ scale: 1.1 }}
        className="relative z-50 h-14 w-14 cursor-grab overflow-hidden rounded-full border-[1px] border-neutral-200 transition-opacity active:cursor-grabbing dark:border-none dark:brightness-90"
      >
        {avatarUrl ? (
          <img
            alt={avatarAlt || `${name} avatar`}
            src={avatarUrl}
            height={64}
            width={64}
            className="h-full w-full object-cover"
            draggable={false}
          />
        ) : (
          <Image
            alt={avatarAlt || `${name} avatar`}
            src={avatar}
            height={64}
            width={64}
            sizes="33vw"
            placeholder="blur"
            priority
            draggable={false}
          />
        )}
      </motion.div>
    </div>
  )
}
