'use client'

import { usePathname } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

import { ID_CHAT, ID_CONTENU, ID_MENU } from 'components/ids'

export default function LiensEvitement() {
  const pathname = usePathname()
  const refContainer = useRef<HTMLDivElement>(null)

  const [pageHasChatAside, setPageHasChatAside] = useState<boolean>(false)

  useEffect(() => {
    if (refContainer.current) {
      refContainer.current.focus()
    }
  }, [pathname])

  useEffect(() => {
    setPageHasChatAside(Boolean(document.getElementById(ID_CHAT)))
  }, [pathname])

  return (
    <>
      <div ref={refContainer} tabIndex={-1} className='sr-only' />
      <ul className='sr-only focus-within:not-sr-only'>
        <li>
          <a
            href={`#${ID_CONTENU}`}
            className='text-primary_darken hover:text-primary'
          >
            Aller au contenu
          </a>
        </li>
        <li>
          <a
            href={`#${ID_MENU}`}
            className='text-primary_darken hover:text-primary'
          >
            Aller au menu
          </a>
        </li>
        {pageHasChatAside && (
          <li>
            <a
              href={`#${ID_CHAT}`}
              className='text-primary_darken hover:text-primary'
            >
              Aller aux conversations
            </a>
          </li>
        )}
      </ul>
    </>
  )
}
