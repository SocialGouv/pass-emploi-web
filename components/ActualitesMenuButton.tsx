import React from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import { Conseiller } from 'interfaces/conseiller'
import { getWidgetId } from 'utils/hooks/useLeanBeWidget'

interface ActualitesMenuButtonProps {
  conseiller: Conseiller
  onClick: () => void
}

function ActualitesMenuButton({
  conseiller,
  onClick,
}: ActualitesMenuButtonProps) {
  const classWidget = `SGBF-open-${getWidgetId(conseiller.structure)} w-full`

  const classMenu =
    'flex p-2 mb-6 items-center layout_base:justify-center rounded-base layout_s:justify-start layout_l:justify-start border-2 border-primary transition-all hover:cursor-pointer hover:border-blanc'
  return (
    <>
      <li>
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
            name={IconName.Info}
          />
          <span className='text-md text-left sr-only layout_l:not-sr-only break-words text-blanc'>
            Actualités
          </span>
        </div>
      </li>
    </>
  )
}

export default ActualitesMenuButton
