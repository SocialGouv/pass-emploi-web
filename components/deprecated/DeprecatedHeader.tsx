import React from 'react'

import FilAriane from 'components/FilAriane'
import LienRetour from 'components/LienRetour'
import { PAGE_ACTIONS_ROOT_ID } from 'components/PageActionsPortal'

interface HeaderProps {
  currentPath: string
  returnTo?: string
  pageHeader: string
}

export default function DeprecatedHeader({
  currentPath,
  pageHeader,
  returnTo,
}: HeaderProps) {
  return (
    <header className='flex justify-between items-center px-12 py-8 border-b border-solid border-primary_lighten'>
      {!returnTo && (
        <div>
          <FilAriane path={currentPath} />
          <h1 className='text-l-bold text-primary'>{pageHeader}</h1>
        </div>
      )}

      {returnTo && (
        <div>
          <LienRetour returnUrlOrPath={returnTo} />
          <h1 className='text-l-bold text-primary'>{pageHeader}</h1>
        </div>
      )}

      <div id={PAGE_ACTIONS_ROOT_ID} className='flex gap-6' />
    </header>
  )
}
