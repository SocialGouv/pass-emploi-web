import React, { Fragment } from 'react'

import ActionRow from './ActionRow'

import { Action } from 'interfaces/action'
import { Jeune } from 'interfaces/jeune'

interface TableauActionsJeuneProps {
  jeune: Jeune
  actions: Action[]
}

export const TableauActionsJeune = ({
  jeune,
  actions,
}: TableauActionsJeuneProps) => {
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
          <div role='rowgroup' className='table-header-group '>
            <div role='row' className='table-row text-s-regular'>
              <div role='columnheader' className={`table-cell pl-4 py-4`}>
                Intitulé de l&apos;action
              </div>
              <div role='columnheader' className={`table-cell`}>
                Créée le
              </div>
              <div role='columnheader' className={`table-cell`}>
                Statut
              </div>
            </div>
          </div>

          <div role='rowgroup' className='table-row-group'>
            {actions.map((action: Action) => (
              <Fragment key={action.id}>
                <ActionRow action={action} jeuneId={jeune.id} />
                <div className='mb-2' />
              </Fragment>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
