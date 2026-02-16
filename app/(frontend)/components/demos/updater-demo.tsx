'use client'

import { ArrowPathIcon } from '@heroicons/react/20/solid'
import { AnimatePresence, m } from 'framer-motion'
import { Info } from 'lucide-react'
import React, { useState, useImperativeHandle, forwardRef, useRef } from 'react'
import ConfettiAction from '../confetti'
import { LoadingSpinner } from '../loader-spin'

export default function UpdaterDemoClient() {
  const updaterRef = useRef(null)

  const handleRestart = () => {
    if (updaterRef.current) {
      // @ts-expect-error Call UpdaterDemo restart method
      updaterRef.current.restartAnimation() // Trigger restart animation
    }
  }

  return (
    <div className="relative flex h-32 w-full flex-col items-center justify-center rounded-lg border-[1px] border-stone-200 bg-stone-100 dark:border-stone-800 dark:bg-stone-900">
      <button
        type="button"
        onClick={handleRestart}
        className="absolute top-1.5 right-2 cursor-pointer font-medium text-xs"
      >
        <ArrowPathIcon className="h-4 w-4 text-stone-400 dark:text-stone-500" />
      </button>
      {/* @ts-ignore */}
      <UpdaterDemo ref={updaterRef} />
    </div>
  )
}

const UpdaterDemo = forwardRef((_props, ref) => {
  const [loading, setLoading] = useState(false)
  const [key, setKey] = useState(0) // Key used to restart animation

  const handleUpdate = () => {
    setLoading(true)
    setTimeout(() => {
      ConfettiAction()
    }, 100)
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  const restartAnimation = () => {
    setKey((prevKey) => prevKey + 1) // Update key to restart animation
  }

  // Expose restartAnimation to parent component
  useImperativeHandle(ref, () => ({
    restartAnimation,
  }))

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <AnimatePresence mode="wait">
        <m.div
          key={key} // Use key to control re-animation
          initial={{ opacity: 0, filter: 'blur(10px)', scale: 0.8 }}
          animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
          exit={{ opacity: 0, filter: 'blur(10px)', scale: 0.8 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className="flex h-[36px] items-center justify-between gap-4 rounded-[50px] border-green-800 border-solid bg-green-800 px-2 py-1.5 dark:border-[1px] dark:bg-green-900"
        >
          <section className="flex items-center gap-1.5">
            <Info className="h-4 w-4 shrink-0 text-white" />
            <p className="font-medium text-[12.5px] text-white">
              New blog version available
            </p>
          </section>
          <section className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={loading}
              className="cursor-pointer rounded-full bg-green-700 px-2 py-1 font-medium text-white text-xs shadow-none hover:bg-green-700 dark:bg-green-700"
              onClick={handleUpdate}
            >
              {loading ? <LoadingSpinner /> : 'Update'}
            </button>
          </section>
        </m.div>
      </AnimatePresence>
    </div>
  )
})

UpdaterDemo.displayName = 'UpdaterDemo'
