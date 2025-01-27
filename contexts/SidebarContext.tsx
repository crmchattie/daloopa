"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface SidebarContextType {
  isOpen: boolean
  link: string
  openSidebar: (link: string) => void
  closeSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [link, setLink] = useState("")

  const openSidebar = (link: string) => {
    setLink(link)
    setIsOpen(true)
  }

  const closeSidebar = () => {
    setIsOpen(false)
  }

  return (
    <SidebarContext.Provider value={{ isOpen, link, openSidebar, closeSidebar }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
} 