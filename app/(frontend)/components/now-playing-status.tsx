'use client'

import { useEffect, useState } from 'react'
import AnimateCountClient from './animated-count'
import AnimatedShinyText from './animated-shiny-text'
import PercentBar from './percent-bar'
import { RenderedTimeAgo } from './rendered-time-age'

export default function NowPlayingStatus({
  play_state,
  play_percent,
  timestamp,
  dateLocale = 'en-US',
  timeZone = 'UTC',
}: {
  play_state: boolean
  play_percent: number
  timestamp: number
  dateLocale?: string
  timeZone?: string
}) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient)
    return (
      <div className={'flex h-6 items-center justify-between'}>
        <div className="flex flex-row items-center gap-x-1.5 pl-1">
          <span className="relative flex h-2 w-2">
            <span className="relative inline-flex h-2 w-2 rounded-full bg-neutral-200 dark:bg-neutral-700" />
          </span>
          <div className="h-2 w-36 rounded-md bg-neutral-200 dark:bg-neutral-700" />
        </div>
        <div className="mr-1 h-2 w-9 rounded-md bg-neutral-200 dark:bg-neutral-700" />
      </div>
    )

  let lastPlayedString = ''
  let isExpired = false
  if (timestamp) {
    const now = new Date()
    const timestampInMs = timestamp * 1000
    const lastPlayedDate = new Date(timestampInMs)
    const diff = now.getTime() - timestampInMs

    isExpired = diff >= 60 * 1000

    if (isExpired) {
      const formattedDate = lastPlayedDate.toLocaleDateString(dateLocale, {
        weekday: 'short',
        hour: 'numeric',
        minute: 'numeric',
        timeZone,
        hour12: true,
      })
      lastPlayedString = ` ${formattedDate}`
    }
  }

  if (isExpired) {
    return (
      <div className={'flex items-center justify-between'}>
        <div className="flex flex-row items-center gap-x-1.5 pl-1">
          <span className="relative flex h-2 w-2">
            <span className="relative inline-flex h-2 w-2 rounded-full bg-neutral-200 dark:bg-neutral-700" />
          </span>
          <div className="text-xs opacity-40">
            Last played:{lastPlayedString}
          </div>
        </div>
        <RenderedTimeAgo timestamp={timestamp * 1000} />
      </div>
    )
  }

  return (
    <>
      <div className={'flex h-6 items-center justify-between'}>
        <div className="flex flex-row items-center gap-x-1.5 pl-1">
          {play_state && (
            <>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-600 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-600" />
              </span>
              <AnimatedShinyText className={'text-xs'}>
                Listening now
              </AnimatedShinyText>
            </>
          )}
          {!play_state && (
            <>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-400" />
              </span>
              <div className="text-xs opacity-30">Paused</div>
            </>
          )}
        </div>
        <div className="mb-0.5 flex flex-col pr-1">
          <div className="flex items-center justify-end gap-[1px] text-[9px]">
            <AnimateCountClient
              className="font-medium opacity-60"
              count={Number(play_percent.toFixed(0))}
            />
            <p className="opacity-30">%</p>
          </div>
          <PercentBar playing={true} value={play_percent} />
        </div>
      </div>
    </>
  )
}
