import React, { useState } from 'react'

import InfoAction from 'components/action/InfoAction'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { Action } from 'interfaces/action'
import { toShortDate } from 'utils/date'

interface HistoriqueActionProps {
  action: Action
}

export function HistoriqueAction({ action }: HistoriqueActionProps) {
  const [collapsed, setCollapsed] = useState<boolean>(true)

  const lastUpdate = toShortDate(action.lastUpdate)
  const creationDate = toShortDate(action.creationDate)

  return (
    <div className='bg-primary_lighten p-6 mt-8 rounded-base shadow-base'>
      <div
        className={`flex justify-between cursor-pointer ${
          collapsed ? '' : 'mb-5'
        }`}
        onClick={() => setCollapsed(!collapsed)}
      >
        <h2 className='text-m-bold text-primary'>Historique</h2>
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation()
            setCollapsed(!collapsed)
          }}
          aria-expanded={collapsed}
          className='p-2 hover:bg-white hover:rounded-l'
        >
          <IconComponent
            name={collapsed ? IconName.ChevronDown : IconName.ChevronUp}
            title={`${collapsed ? 'Voir' : 'Cacher'} l’historique`}
            className='h-6 w-6 fill-primary'
            focusable={false}
          />
          <span className='sr-only'>
            {collapsed ? 'Voir' : 'Cacher'} l’historique
          </span>
        </button>
      </div>

      <div
        className={`bg-white border border-solid border-grey_100 rounded-base p-4 ${
          collapsed ? 'hidden' : 'mb-8'
        }`}
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
    </div>
  )
}
