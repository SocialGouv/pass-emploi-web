import { useRouter } from 'next/router'
import React, { useEffect, useRef } from 'react'

import styles from 'styles/components/Layouts.module.css'

export default function LienEvitement() {
  const router = useRouter()
  const refContainer = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (refContainer.current) {
      refContainer.current.focus()
    }
  }, [router.pathname])

  return (
    <>
      <div ref={refContainer} tabIndex={-1} />
      <div className='h-0 overflow-hidden focus-within:h-auto focus-within:bg-blanc '>
        <a
          href='#contenu'
          title='Aller au contenu'
          className='text-primary_darken hover:text-primary'
        >
          Aller au contenu
        </a>
      </div>
    </>
  )
}
