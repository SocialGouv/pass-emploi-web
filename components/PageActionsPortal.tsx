'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { ElementsOnly } from 'types/components'

export const PAGE_ACTIONS_ROOT_ID = 'page-actions-root'

type PageActionsPortalProps = {
  children: ElementsOnly
}

export default function PageActionsPortal({
  children,
}: PageActionsPortalProps) {
  const [isBrowser, setIsBrowser] = useState(false)

  const pageActionsContainer = <>{children}</>

  useEffect(() => {
    setIsBrowser(true)
  }, [])

  if (isBrowser) {
    const pageActionsRoot = document.getElementById(PAGE_ACTIONS_ROOT_ID)
    return pageActionsRoot
      ? createPortal(pageActionsContainer, pageActionsRoot)
      : null
  } else {
    return null
  }
}
