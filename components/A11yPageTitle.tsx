'use client'

import { usePathname } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

export default function A11yPageTitle() {
  const pathname = usePathname()
  const refContainer = useRef<HTMLDivElement>(null)

  const [pageTitle, setPageTitle] = useState<string>()

  useEffect(() => {
    setPageTitle(document.title)
    refContainer.current?.focus()
  }, [pathname])

  return (
    <div ref={refContainer} tabIndex={-1} className='sr-only'>
      {pageTitle}
    </div>
  )
}
