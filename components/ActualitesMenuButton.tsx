import React from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import { Conseiller, estPoleEmploi } from 'interfaces/conseiller'

interface ActualitesMenuButtonProps {
  conseiller: Conseiller
  onClick: () => void
}

function ActualitesMenuButton({
  conseiller,
  onClick,
}: ActualitesMenuButtonProps) {
  const widgetId = estPoleEmploi(conseiller)
    ? process.env.LEANBE_PE_WIDGET_ID
    : process.env.LEANBE_MILO_WIDGET_ID
  const classWidget = `SGBF-open-${widgetId} w-full`
  const classMenu =
    'flex p-2 mb-6 items-center layout_base:justify-center rounded-l layout_s:justify-start layout_l:justify-start hover:cursor-pointer hover:bg-primary_darken'
  return (
    <>
      <div
        className={`${classWidget} ${classMenu}`}
        /* leanbe surcharge la classe p-2 et mb-6 */
        style={{
          padding: '0.5rem',
          marginBottom: '1.5rem',
        }}
        onClick={onClick}
      >
        <IconComponent
          focusable='false'
          aria-hidden='true'
          className='inline mr-0 w-4 h-4 layout_base:w-6 layout_base:h-6 layout_l:mr-2 fill-blanc'
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
