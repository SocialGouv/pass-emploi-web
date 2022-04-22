import React from 'react'
import { ActionJeune } from 'interfaces/action'
import ActionRow from './ActionRow'
import { Jeune } from 'interfaces/jeune'

interface TableauActionsJeuneProps {
  jeune: Jeune
  actions: ActionJeune[]
  hideTableHead?: boolean
}

export const TableauActionsJeune = ({
  jeune,
  actions,
  hideTableHead = false,
}: TableauActionsJeuneProps) => {
  const borderStyle = 'border-solid border-0 border-b-2 border-b-grey_700'

  return (
    <div role='table' className='table w-full' aria-describedby='table-caption'>
      <span id='table-caption' className='sr-only'>
        Liste des actions de {jeune.firstName} {jeune.lastName}
      </span>
      <div
        role='rowgroup'
        className={`table-header-group ${hideTableHead ? 'sr-only' : ''}`}
      >
        <div role='row' className='table-row text-xs-medium text-grey_800'>
          <div
            role='columnheader'
            className={`table-cell pl-4 py-4 ${borderStyle}`}
          >
            Intitulé de l&apos;action
          </div>
          <div role='columnheader' className={`table-cell ${borderStyle}`}>
            Créée le
          </div>
          <div role='columnheader' className={`table-cell ${borderStyle}`}>
            Statut
          </div>
        </div>
      </div>

      <div role='rowgroup' className='table-row-group'>
        {actions.map((action: ActionJeune) => (
          <ActionRow
            key={action.id}
            action={action}
            jeuneId={jeune.id}
            borderStyle={borderStyle}
          />
        ))}
      </div>
    </div>
  )
}
