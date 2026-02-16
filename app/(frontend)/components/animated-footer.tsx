'use client'

import { AnimatePresence, m } from 'framer-motion'
import { useUpdateStatus } from 'lib/update-status-context'

export default function AnimatedFooter() {
  const { updateStatus } = useUpdateStatus()

  return (
    <AnimatePresence>
      {updateStatus && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="pointer-events-none fixed z-40 w-full"
        >
          <div className="-bottom-52 fixed right-0 left-0 flex h-[300px] items-center justify-center overflow-hidden blur-[80px] saturate-150">
            <div className="absolute h-[500px] w-[500px] animate-orbit">
              <div className="absolute top-[125px] left-[125px] w-[250px] rounded-full bg-green-800 pb-[250px]" />
            </div>
            <div className="absolute h-[250px] w-[500px] animate-orbit2">
              <div className="absolute top-[50px] left-[125px] w-[200px] rounded-full bg-green-800 pb-[200px]" />
            </div>
            <div className="absolute h-[500px] w-[500px] animate-orbit3">
              <div className="absolute top-[250px] left-[150px] w-[150px] rounded-full bg-green-700 pb-[150px]" />
            </div>
            <div className="absolute h-[500px] w-[250px] animate-orbit4">
              <div className="absolute top-[125px] left-[62.5px] w-[150px] rounded-full bg-green-700 pb-[150px]" />
            </div>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  )
}
