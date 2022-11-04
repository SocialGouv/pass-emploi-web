import React from 'react'

import { StructureConseiller } from '../interfaces/conseiller'

import IconComponent, { IconName } from './ui/IconComponent'

import { LeanBe } from 'utils/hooks/useLeanBeWidget'

interface ActualitesMenuButtonProps {
  structure: StructureConseiller | undefined
}

function ActualitesMenuButton({ structure }: ActualitesMenuButtonProps) {
  const widgetId =
    structure === StructureConseiller.POLE_EMPLOI
      ? LeanBe.PE_WIDGET_ID
      : LeanBe.MILO_WIDGET_ID
  const classWidget = `SGBF-open-${widgetId} w-full`
  const classMenu =
    'flex p-2 mb-6 items-center layout_base:justify-center rounded-medium layout_s:justify-start layout_l:justify-start hover:bg-primary_darken'
  return (
    <>
      <div
        className={`${classWidget} ${classMenu}`}
        /* leanbe surcharge la classe p-2 et mb-6 */
        style={{
          padding: '0.5rem',
          marginBottom: '1.5rem',
        }}
      >
        <IconComponent
          focusable='false'
          aria-hidden='true'
          className='mr-0 w-4 h-4 layout_base:w-6 layout_base:h-6 layout_l:mr-2 fill-blanc'
          name={IconName.InfoOutline}
        />
        <span className='text-md text-left sr-only layout_l:not-sr-only break-words text-blanc'>
          Actualités
        </span>
      </div>
    </>
  )
}

export default ActualitesMenuButton
