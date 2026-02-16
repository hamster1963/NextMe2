'use client'

import React, {
  type ReactNode,
  createContext,
  useContext,
  useState,
} from 'react'

interface StatusContextType {
  status: boolean
  setStatus: (status: boolean) => void
}

const StatusContext = createContext<StatusContextType | undefined>(undefined)

export function StatusProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<boolean>(false)

  return (
    <StatusContext.Provider value={{ status, setStatus }}>
      {children}
    </StatusContext.Provider>
  )
}

export function useStatus() {
  const context = useContext(StatusContext)
  if (context === undefined) {
    throw new Error('useStatus must be used within a StatusProvider')
  }
  return context
}
