import React from 'react'

import InfoAction from 'components/action/InfoAction'
import { Action } from 'interfaces/action'
import { formatDayDate } from 'utils/date'

interface HistoriqueActionProps {
  action: Action
}

export function HistoriqueAction({ action }: HistoriqueActionProps) {
  return (
    <div className='border border-solid border-grey_100 rounded-medium p-4 mb-5'>
      <h2 className='text-m-bold text-content_color mb-6 mt-2'>
        Historique de l’action
      </h2>
      <dl className='grid grid-cols-[auto_1fr] grid-rows-[repeat(4,_auto)]'>
        <InfoAction label='Date d’actualisation' isInline={true}>
          {formatDayDate(new Date(action.lastUpdate))}
        </InfoAction>
        <InfoAction label='Date de création' isInline={true}>
          {formatDayDate(new Date(action.creationDate))}
        </InfoAction>
        <InfoAction label="Créateur de l'action" isInline={true}>
          {action.creator}
        </InfoAction>
      </dl>
    </div>
  )
}
