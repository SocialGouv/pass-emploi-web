'use client'

import { ReactNode } from 'react'

import Sidebar from 'components/Sidebar'
import { useMobileViewport } from 'utils/mobileViewportContext'

export default function LayoutWithSidebar({
  children,
}: {
  children: ReactNode
}) {
  const isMobileViewport = useMobileViewport()

  return (
    <div className='flex h-screen supports-[height:100dvh]:h-dvh w-screen'>
      {!isMobileViewport && <Sidebar />}

      {children}
    </div>
  )
}
