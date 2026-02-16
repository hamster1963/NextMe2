'use client'

import React, {
  type ReactNode,
  createContext,
  useContext,
  useState,
} from 'react'

interface UpdateStatusContextType {
  updateStatus: boolean
  setUpdateStatus: (status: boolean) => void
}

const UpdateStatusContext = createContext<UpdateStatusContextType | undefined>(
  undefined
)

export function UpdateStatusProvider({ children }: { children: ReactNode }) {
  const [updateStatus, setUpdateStatus] = useState<boolean>(false)

  return (
    <UpdateStatusContext.Provider value={{ updateStatus, setUpdateStatus }}>
      {children}
    </UpdateStatusContext.Provider>
  )
}

export function useUpdateStatus() {
  const context = useContext(UpdateStatusContext)
  if (context === undefined) {
    throw new Error(
      'useUpdateStatus must be used within a UpdateStatusProvider'
    )
  }
  return context
}
