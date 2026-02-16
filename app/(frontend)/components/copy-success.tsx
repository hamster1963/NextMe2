'use client'

import { CheckCircleIcon } from '@heroicons/react/20/solid'
import { AnimatePresence, m } from 'framer-motion'
import { useState } from 'react'

export default function CopySuccess({
  text,
  herf,
}: {
  text: string
  herf: string
}) {
  const [visible, setVisible] = useState(false)

  const copyText = () => {
    navigator.clipboard.writeText(herf)
    setVisible(true)
    setTimeout(() => {
      setVisible(false)
    }, 2000)
  }

  return (
    <>
      <p
        className="cursor-pointer font-medium text-xs"
        onClick={copyText}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            copyText()
          }
        }}
      >
        {' '}
        {text}{' '}
      </p>
      <AnimatePresence>
        {visible && (
          <m.div
            initial={{ opacity: 0, filter: 'blur(10px)', scale: 0.8 }}
            animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
            exit={{ opacity: 0, filter: 'blur(10px)', scale: 0.8 }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="-translate-x-1/2 fixed inset-shadow-2xs inset-shadow-white/20 top-[70px] left-1/2 z-[999] flex min-h-[38px] min-w-[210px] items-center justify-between overflow-hidden rounded-[50px] border-[1px] border-neutral-900 bg-gradient-to-b from-neutral-700 to-neutral-800 px-2 pt-[7px] pb-1.5 shadow-black/15 shadow-xl transition-colors duration-150 dark:from-neutral-800 dark:to-neutral-900"
          >
            <div className="flex h-full min-h-[24px] w-full items-center justify-center gap-1 text-white [text-shadow:_0_1px_0_rgb(0_0_0_/_20%)]">
              <p className="font-semibold text-[13px]">
                RSS 链接已复制到剪贴板
              </p>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  )
}
