'use client'

import { m } from 'framer-motion'

export default function TopBlurLayer() {
  return (
    <>
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ type: 'spring', duration: 0.8 }}
        className="fixed top-0 right-0 left-0 z-10 h-24 backdrop-blur-sm"
        style={{
          maskImage:
            'linear-gradient(to top, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%)',
          WebkitMaskImage:
            'linear-gradient(to top, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%)',
        }}
      />
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ type: 'spring', duration: 0.8 }}
        className="fixed top-0 right-0 left-0 z-20 h-24 backdrop-blur-sm"
        style={{
          maskImage:
            'linear-gradient(to top, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%)',
          WebkitMaskImage:
            'linear-gradient(to top, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%)',
        }}
      />
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ type: 'spring', duration: 0.8 }}
        className="fixed top-0 right-0 left-0 z-30 h-24 backdrop-blur-sm"
        style={{
          maskImage:
            'linear-gradient(to top, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%)',
          WebkitMaskImage:
            'linear-gradient(to top, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%)',
        }}
      />
    </>
  )
}
