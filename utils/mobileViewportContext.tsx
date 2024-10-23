'use client'

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'

import { MIN_DESKTOP_WIDTH } from 'components/globals'

const MobileViewportContext = createContext<boolean | undefined>(undefined)

export function MobileViewportProvider({ children }: { children: ReactNode }) {
  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(true)

  useEffect(() => {
    const handleResize = () =>
      setIsMobileViewport(window.innerWidth < MIN_DESKTOP_WIDTH)

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <MobileViewportContext.Provider value={isMobileViewport}>
      {children}
    </MobileViewportContext.Provider>
  )
}

export function useMobileViewport(): boolean {
  const mobileViewportContext = useContext(MobileViewportContext)
  if (mobileViewportContext === undefined) {
    throw new Error(
      'useMobileViewport must be used within MobileViewportProvider'
    )
  }

  return mobileViewportContext
}
