'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export const PAGE_HEADER_ROOT_ID = 'page-header-root'

export default function PageHeaderPortal({ header }: { header: string }) {
  const [isBrowser, setIsBrowser] = useState(false)

  const pageHeaderContainer = <>{header}</>

  useEffect(() => {
    setIsBrowser(true)
  }, [])

  if (isBrowser) {
    const pageHeaderRoot = document.getElementById(PAGE_HEADER_ROOT_ID)
    return pageHeaderRoot
      ? createPortal(pageHeaderContainer, pageHeaderRoot)
      : null
  } else {
    return null
  }
}
