'use client'

import { usePathname } from 'next/navigation'
import React, { useEffect, useRef } from 'react'

import { ID_CONTENU } from 'components/ids'

export default function LienEvitement() {
  const pathname = usePathname()
  const refContainer = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (refContainer.current) {
      refContainer.current.focus()
    }
  }, [pathname])

  return (
    <>
      <div ref={refContainer} tabIndex={-1} className='sr-only' />
      <div className='sr-only focus-within:not-sr-only'>
        <a
          href={`#${ID_CONTENU}`}
          title='Aller au contenu'
          className='text-primary_darken hover:text-primary'
        >
          Aller au contenu
        </a>
      </div>
    </>
  )
}
