import React, { useEffect, useRef } from 'react'

import { ID_CONTENU, MIN_DESKTOP_WIDTH } from 'components/globals'
import ModalContainer, { ModalHandles } from 'components/ModalContainer'
import NavLinks, { NavItem } from 'components/NavLinks'
import IconComponent, { IconName } from 'components/ui/IconComponent'

export default function ChatNav({ onClose }: { onClose: () => void }) {
  const modalContainerRef = useRef<ModalHandles>(null)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= MIN_DESKTOP_WIDTH) {
        onClose()
        document.getElementById(ID_CONTENU)!.focus()
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <ModalContainer
      ref={modalContainerRef}
      onClose={onClose}
      label={{ value: 'Menu de navigation' }}
    >
      <nav
        role='navigation'
        id='menu-mobile'
        className='h-full w-full flex flex-col bg-primary px-6 py-3'
      >
        <button
          type='button'
          aria-controls='menu-mobile'
          onClick={(e) => modalContainerRef.current!.closeModal(e)}
          aria-expanded={true}
          className='w-fit p-1 -ml-4 mb-6 hover:bg-primary_darken hover:rounded-full'
          title='Fermer le menu principal'
        >
          <IconComponent
            name={IconName.Close}
            className='w-10 h-10 fill-white'
            aria-hidden={true}
            focusable={false}
          />
          <span className='sr-only'>Fermer le menu principal</span>
        </button>
        <div className='grow flex flex-col justify-between'>
          <NavLinks
            showLabelsOnSmallScreen={true}
            items={[NavItem.Messagerie, NavItem.Raccourci, NavItem.Aide]}
          />
        </div>
      </nav>
    </ModalContainer>
  )
}
