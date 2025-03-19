import React from 'react'

import InfoAction from 'components/action/InfoAction'
import Details from 'components/Details'
import { Action } from 'interfaces/action'
import { toShortDate } from 'utils/date'

interface HistoriqueActionProps {
  action: Action
}

export default function HistoriqueAction({ action }: HistoriqueActionProps) {
  const lastUpdate = toShortDate(action.lastUpdate)
  const creationDate = toShortDate(action.creationDate)

  return (
    <Details summary='Historique'>
      <div className='bg-white border border-solid border-grey-100 rounded-base p-4 mb-8'>
        <h3 className='text-m-bold text-grey-800 mb-6 mt-2'>
          Historique de l’action
        </h3>
        <dl className='grid grid-cols-[auto_1fr] grid-rows-[repeat(4,auto)]'>
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
    </Details>
  )
}
