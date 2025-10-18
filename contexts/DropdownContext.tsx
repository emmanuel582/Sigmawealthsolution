"use client"
import React, { createContext, useContext, useState } from 'react'

interface DropdownContextType {
  isFeaturesOpen: boolean
  setIsFeaturesOpen: (open: boolean) => void
}

const DropdownContext = createContext<DropdownContextType | undefined>(undefined)

export function DropdownProvider({ children }: { children: React.ReactNode }) {
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false)

  return (
    <DropdownContext.Provider value={{ isFeaturesOpen, setIsFeaturesOpen }}>
      {children}
    </DropdownContext.Provider>
  )
}

export function useDropdown() {
  const context = useContext(DropdownContext)
  if (context === undefined) {
    // Return default values instead of throwing error
    return {
      isFeaturesOpen: false,
      setIsFeaturesOpen: () => {}
    }
  }
  return context
}
