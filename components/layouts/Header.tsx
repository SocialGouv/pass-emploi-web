import React from 'react'

import { PAGE_ACTIONS_ROOT_ID } from 'components/PageActionsPortal'
import { PAGE_HEADER_ROOT_ID } from 'components/PageHeaderPortal'
import { PAGE_NAVIGATION_ROOT_ID } from 'components/PageNavigationPortals'

export default function Header() {
  return (
    <header className='flex justify-between items-center px-12 py-8 border-b border-solid border-primary_lighten'>
      <div>
        <nav id={PAGE_NAVIGATION_ROOT_ID} aria-label="Fil d'ariane" />
        <h1 id={PAGE_HEADER_ROOT_ID} className='text-l-bold text-primary' />
      </div>

      <div id={PAGE_ACTIONS_ROOT_ID} className='flex gap-6' />
    </header>
  )
}
