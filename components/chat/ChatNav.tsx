import React, { Dispatch, SetStateAction, useEffect, useRef } from 'react'

import NavLinks, { NavItem } from 'components/NavLinks'
import IconComponent, { IconName } from 'components/ui/IconComponent'

export default function ChatNav({
  menuState: [showMenu, setShowMenu],
}: {
  menuState: [boolean, Dispatch<SetStateAction<boolean>>]
}) {
  const closeMenuRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (showMenu) {
      closeMenuRef.current!.focus()
    }
  }, [showMenu])

  return (
    <nav
      role='navigation'
      id='menu-mobile'
      className='absolute top-0 bottom-0 left-0 right-0 flex flex-col bg-primary px-6 py-3 z-10 layout_s:hidden'
    >
      <button
        ref={closeMenuRef}
        type='button'
        aria-controls='menu-mobile'
        onClick={() => setShowMenu(false)}
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
  )
}
