'use client'

import { AnimatePresence, m } from 'framer-motion'
import { cn } from 'lib/utils'
import { InfoIcon } from './Icon'
import { Loader } from './loader-spin'

type TopCommitBarProps = {
  handleSubmit: () => Promise<void>
  handleCancel: () => void
  disabled: boolean
  loading: boolean
  isSuccess: boolean
}

export default function TopCommitBar({
  handleSubmit,
  handleCancel,
  disabled,
  loading,
  isSuccess,
}: TopCommitBarProps) {
  return (
    <div className="flex flex-col items-center justify-center">
      <m.div
        initial={{ y: -50, opacity: 0, filter: 'blur(5px)' }}
        animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
        exit={{ y: -50, opacity: 0, filter: 'blur(5px)' }}
        transition={{ type: 'spring', duration: 0.7 }}
        className={cn(
          'fixed inset-shadow-2xs inset-shadow-white/20 top-[70px] z-[999] min-h-[38px] min-w-[210px] overflow-hidden rounded-[50px] border-[1px] border-neutral-900 bg-gradient-to-b from-neutral-700 to-neutral-800 px-2 pt-[7px] pb-1.5 shadow-black/15 shadow-xl transition-colors duration-150 dark:from-neutral-800 dark:to-neutral-900',
          {
            'border-blue-600 bg-gradient-to-b from-blue-500 to-blue-600 shadow-blue-500/20 dark:from-blue-600 dark:to-blue-700':
              !loading && isSuccess,
          }
        )}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <m.div
            key={!loading && isSuccess ? 'success' : 'error'}
            initial={{ y: -10, opacity: 0.8, filter: 'blur(5px)' }}
            animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
            exit={{ y: 20, opacity: 0, filter: 'blur(5px)' }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-between gap-4 overflow-hidden"
          >
            {!loading && isSuccess ? (
              <div className="flex h-full min-h-[24px] w-full items-center justify-center gap-1 text-white [text-shadow:_0_1px_0_rgb(0_0_0_/_20%)]">
                <p className="font-semibold text-[13px]">评论已提交成功</p>
              </div>
            ) : (
              <>
                <section className="ml-[2px] flex items-center gap-1 text-white">
                  <InfoIcon />
                  <p className="font-medium text-[12px]">未提交的评论</p>
                </section>
                <section className="flex items-center gap-1.5">
                  <button
                    type="button"
                    className="cursor-pointer rounded-full bg-red-600 px-2 py-1 font-medium text-white text-xs shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition-colors hover:bg-red-600/80 hover:shadow-[inset_0_1px_0_rgba(0,0,0,0.2)]"
                    onClick={handleCancel}
                  >
                    <p className="[text-shadow:_0_1px_0_rgb(0_0_0_/_20%)]">
                      取消
                    </p>
                  </button>
                  <button
                    type="button"
                    disabled={disabled}
                    className="flex min-h-[24px] min-w-[40px] cursor-pointer items-center justify-center overflow-hidden rounded-full bg-green-600 px-2 py-1 font-medium text-white text-xs shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition-colors hover:bg-green-600/80 hover:shadow-[inset_0_1px_0_rgba(0,0,0,0.2)]"
                    onClick={handleSubmit}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      <m.div
                        key={disabled ? 'loading' : 'submit'}
                        initial={{ y: -18 }}
                        animate={{ y: 0 }}
                        exit={{ y: 18 }}
                        transition={{ duration: 0.05 }}
                        className="[text-shadow:_0_1px_0_rgb(0_0_0_/_20%)]"
                      >
                        {loading ? (
                          <Loader className="bg-white" visible={true} />
                        ) : (
                          '提交'
                        )}
                      </m.div>
                    </AnimatePresence>
                  </button>
                </section>
              </>
            )}
          </m.div>
        </AnimatePresence>
      </m.div>
    </div>
  )
}
