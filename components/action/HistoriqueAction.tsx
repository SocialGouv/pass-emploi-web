import React, { useState } from 'react'

import InfoAction from 'components/action/InfoAction'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { Action } from 'interfaces/action'
import { toShortDate } from 'utils/date'

interface HistoriqueActionProps {
  action: Action
}

export function HistoriqueAction({ action }: HistoriqueActionProps) {
  const [expanded, setExpanded] = useState<boolean>(false)

  const lastUpdate = toShortDate(action.lastUpdate)
  const creationDate = toShortDate(action.creationDate)

  return (
    <div className='bg-primary_lighten p-6 mt-8 rounded-base shadow-base'>
      <div
        className={`relative flex justify-between cursor-pointer ${
          expanded ? 'mb-5' : ''
        }`}
      >
        <h2 className='text-m-bold text-primary'>Historique</h2>
        <button
          type='button'
          onClick={() => setExpanded(!expanded)}
          aria-controls='historique-action'
          aria-expanded={expanded}
          className='p-2 hover:bg-white hover:rounded-l before:absolute before:inset-0 before:z-10'
        >
          <IconComponent
            name={expanded ? IconName.ChevronUp : IconName.ChevronDown}
            title={`${expanded ? 'Cacher' : 'Voir'} l’historique`}
            className='h-6 w-6 fill-primary'
            focusable={false}
            aria-labelledby='label-action-historique'
          />
          <span id='label-action-historique' className='sr-only'>
            {expanded ? 'Cacher' : 'Voir'} l’historique
          </span>
        </button>
      </div>

      {expanded && (
        <div
          id='historique-action'
          className='bg-white border border-solid border-grey_100 rounded-base p-4 mb-8'
        >
          <h2 className='text-m-bold text-grey_800 mb-6 mt-2'>
            Historique de l’action
          </h2>
          <dl className='grid grid-cols-[auto_1fr] grid-rows-[repeat(4,_auto)]'>
            <InfoAction label="Créateur de l'action" isInline={true}>
              {action.creator}
            </InfoAction>
            <InfoAction label='Date de création' isInline={true}>
              {creationDate}
            </InfoAction>
            <InfoAction label='Date d’actualisation' isInline={true}>
              {lastUpdate}
            </InfoAction>
          </dl>
        </div>
      )}
    </div>
  )
}
