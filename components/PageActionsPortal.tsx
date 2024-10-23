'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { PAGE_ACTIONS_ROOT_ID } from 'components/globals'
import { ElementsOnly } from 'types/components'

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
