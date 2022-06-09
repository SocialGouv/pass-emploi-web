import React from 'react'

import ActionRow from './ActionRow'

import { Action } from 'interfaces/action'
import { Jeune } from 'interfaces/jeune'

interface TableauActionsJeuneProps {
  jeune: Jeune
  actions: Action[]
  hideTableHead?: boolean
}

export const TableauActionsJeune = ({
  jeune,
  actions,
  hideTableHead = false,
}: TableauActionsJeuneProps) => {
  const borderStyle = 'border-solid border-0 border-b-2 border-b-grey_700'

  return (
    <>
      {actions.length === 0 && (
        <p className='text-md mb-2'>
          {jeune.firstName} n’a pas encore d’action
        </p>
      )}

      {actions.length > 0 && (
        <div
          role='table'
          className='table w-full'
          aria-label={`Liste des actions de ${jeune.firstName} ${jeune.lastName}`}
        >
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
            {actions.map((action: Action) => (
              <ActionRow
                key={action.id}
                action={action}
                jeuneId={jeune.id}
                borderStyle={borderStyle}
              />
            ))}
          </div>
        </div>
      )}
    </>
  )
}
