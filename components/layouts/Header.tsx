'use client'

import React from 'react'

import FilAriane from 'components/FilAriane'
import { PAGE_ACTIONS_ROOT_ID } from 'components/PageActionsPortal'
import { PAGE_HEADER_ROOT_ID } from 'components/PageHeaderPortal'
import { PAGE_RETOUR_ROOT_ID } from 'components/PageRetourPortal'

interface HeaderProps {
  currentPath: string
}

export default function Header({ currentPath }: HeaderProps) {
  return (
    <header className='flex justify-between items-center px-12 py-8 border-b border-solid border-primary_lighten'>
      <div>
        <FilAriane currentPath={currentPath} />
        <div id={PAGE_RETOUR_ROOT_ID} />
        <h1 id={PAGE_HEADER_ROOT_ID} className='text-l-bold text-primary' />
      </div>

      <div id={PAGE_ACTIONS_ROOT_ID} className='flex gap-6' />
    </header>
  )
}
