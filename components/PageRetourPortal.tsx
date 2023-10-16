'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import LienRetour from 'components/LienRetour'

export const PAGE_RETOUR_ROOT_ID = 'page-retour-root'

export default function PageRetourPortal({ lien }: { lien: string }) {
  const [isBrowser, setIsBrowser] = useState(false)

  const pageRetourContainer = <LienRetour returnUrlOrPath={lien} />

  useEffect(() => {
    setIsBrowser(true)
  }, [])

  if (isBrowser) {
    const pageRetourRoot = document.getElementById(PAGE_RETOUR_ROOT_ID)
    return pageRetourRoot
      ? createPortal(pageRetourContainer, pageRetourRoot)
      : null
  } else {
    return null
  }
}
