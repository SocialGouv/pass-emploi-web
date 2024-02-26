import React from 'react'

import { PAGE_ACTIONS_ROOT_ID, PAGE_NAVIGATION_ROOT_ID } from 'components/ids'

export default function Header() {
  return (
    <header
      role='banner'
      className='flex justify-between items-center px-12 py-8 border-b border-solid border-primary_lighten'
    >
      <div id={PAGE_NAVIGATION_ROOT_ID} />
      <div id={PAGE_ACTIONS_ROOT_ID} className='flex gap-6' />
    </header>
  )
}
