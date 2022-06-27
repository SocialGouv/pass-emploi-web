import React, { Fragment, useState } from 'react'

import ActionRow from 'components/action/ActionRow'
import { Action, StatutAction } from 'interfaces/action'
import { BaseJeune } from 'interfaces/jeune'

interface TableauActionsJeuneProps {
  jeune: BaseJeune
  actions: Action[]
  isLoading: boolean
}

export const TableauActionsJeune = ({
  jeune,
  actions,
  isLoading,
}: TableauActionsJeuneProps) => {
  const [afficherStatut, setAfficherStatut] = useState<boolean>(false)

  return (
    <div className={isLoading ? 'animate-pulse' : ''}>
      {actions.length === 0 && (
        <p className='text-md mb-2'>
          {jeune.prenom} {jeune.nom} n’a pas encore d’action
        </p>
      )}

      {actions.length > 0 && (
        <div
          role='table'
          className='table w-full'
          aria-label={`Liste des actions de ${jeune.prenom} ${jeune.nom}`}
        >
          <div role='rowgroup' className='table-header-group '>
            <div role='row' className='table-row text-s-regular'>
              <div role='columnheader' className={`table-cell pl-4 py-4`}>
                Intitulé de l&apos;action
              </div>
              <div role='columnheader' className={`table-cell`}>
                Créée le
              </div>
              <div
                role='columnheader'
                className='table-cell relative'
                onClick={() => setAfficherStatut(!afficherStatut)}
                aria-controls='filtres-statut'
                aria-expanded={afficherStatut}
              >
                Statut
                {afficherStatut && (
                  <form
                    className='absolute z-10 bg-blanc rounded-medium shadow-s'
                    id='filtres-statut'
                    onBlur={() => console.log('laal')}
                  >
                    <fieldset className='flex flex-col'>
                      <legend className='sr-only'>
                        Choisir un statut à filtrer
                      </legend>
                      <label htmlFor='statut-commencee'>
                        <input
                          type='checkbox'
                          value={StatutAction.Commencee}
                          id='statut-commencee'
                        />
                        Commencée
                      </label>
                      <label htmlFor='statut-a-realiser'>
                        <input
                          type='checkbox'
                          value={StatutAction.ARealiser}
                          id='statut-a-realiser'
                        />
                        À réaliser
                      </label>
                      <label htmlFor='statut-terminee'>
                        <input
                          type='checkbox'
                          value={StatutAction.Terminee}
                          id='statut-terminee'
                        />
                        Terminée
                      </label>
                      <label htmlFor='statut-annulee'>
                        <input
                          type='checkbox'
                          value={StatutAction.Annulee}
                          id='statut-annulee'
                        />
                        Annulée
                      </label>
                    </fieldset>
                  </form>
                )}
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
    </div>
  )
}
