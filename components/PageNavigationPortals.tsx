'use client'

import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import FilAriane from 'components/FilAriane'
import LienRetour from 'components/LienRetour'

export const PAGE_NAVIGATION_ROOT_ID = 'page-navigation-root'

export function PageRetourPortal({ lien }: { lien: string }) {
  const [isBrowser, setIsBrowser] = useState(false)

  const pageRetourContainer = <LienRetour returnUrlOrPath={lien} />

  useEffect(() => {
    setIsBrowser(true)
  }, [])

  if (isBrowser) {
    const pageRetourRoot = document.getElementById(PAGE_NAVIGATION_ROOT_ID)
    return pageRetourRoot
      ? createPortal(pageRetourContainer, pageRetourRoot)
      : null
  } else {
    return null
  }
}

export function PageFilArianePortal() {
  const [isBrowser, setIsBrowser] = useState(false)

  const pageFilArianeContainer = <FilAriane path={usePathname()!} />

  useEffect(() => {
    setIsBrowser(true)
  }, [])

  if (isBrowser) {
    const pageRetourRoot = document.getElementById(PAGE_NAVIGATION_ROOT_ID)
    return pageRetourRoot
      ? createPortal(pageFilArianeContainer, pageRetourRoot)
      : null
  } else {
    return null
  }
}

export function PageHeaderPortal({ header }: { header: string }) {
  const [isBrowser, setIsBrowser] = useState(false)

  const pageHeaderContainer = (
    <h1 className='text-l-bold text-primary'>{header}</h1>
  )

  useEffect(() => {
    setIsBrowser(true)
  }, [])

  if (isBrowser) {
    const pageHeaderRoot = document.getElementById(PAGE_NAVIGATION_ROOT_ID)
    return pageHeaderRoot
      ? createPortal(pageHeaderContainer, pageHeaderRoot)
      : null
  } else {
    return null
  }
}
