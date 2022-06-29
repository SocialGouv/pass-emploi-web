import React, {
  ChangeEvent,
  FormEvent,
  Fragment,
  useEffect,
  useState,
} from 'react'

import ActionRow from 'components/action/ActionRow'
import propsStatutsActions from 'components/action/propsStatutsActions'
import Button from 'components/ui/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { Action, StatutAction } from 'interfaces/action'
import { BaseJeune } from 'interfaces/jeune'

interface TableauActionsJeuneProps {
  jeune: BaseJeune
  actions: Action[]
  isLoading: boolean
  filtrerActions: (statutsSelectionnes: StatutAction[]) => void
}

export const TableauActionsJeune = ({
  jeune,
  actions,
  isLoading,
  filtrerActions,
}: TableauActionsJeuneProps) => {
  const [afficherStatut, setAfficherStatut] = useState<boolean>(false)
  const [statutsSelectionnes, setStatutsSelectionnes] = useState<
    StatutAction[]
  >([])
  const [statutsValides, setStatutsValides] = useState<StatutAction[]>([])

  function actionnerStatut(e: ChangeEvent<HTMLInputElement>) {
    const statut = e.target.value as StatutAction
    if (statutsSelectionnes.includes(statut)) {
      setStatutsSelectionnes(statutsSelectionnes.filter((s) => s !== statut))
    } else {
      setStatutsSelectionnes(
        statutsSelectionnes.concat(e.target.value as StatutAction)
      )
    }
  }

  function submitFiltres(e: FormEvent) {
    e.preventDefault()
    filtrerActions(statutsSelectionnes)

    setAfficherStatut(false)
    setStatutsValides(statutsSelectionnes)
  }

  function renderStatutInput(statut: StatutAction): JSX.Element {
    const id = `statut-${statut.toLowerCase()}`
    return (
      <label key={id} htmlFor={id} className='flex pb-8'>
        <input
          type='checkbox'
          value={statut}
          id={id}
          className='h-5 w-5'
          checked={statutsSelectionnes.includes(statut)}
          onChange={actionnerStatut}
        />
        <span className='pl-5'>{propsStatutsActions[statut].label}</span>
      </label>
    )
  }

  useEffect(() => {
    setStatutsSelectionnes(statutsValides)
  }, [afficherStatut, statutsValides])

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
              <div role='columnheader' className='table-cell relative'>
                <button
                  aria-controls='filtres-statut'
                  aria-expanded={afficherStatut}
                  onClick={() => setAfficherStatut(!afficherStatut)}
                  className='w-full flex items-center'
                >
                  Statut
                  <IconComponent
                    name={IconName.ChevronDown}
                    className={`h-4 w-4 fill-primary ${
                      afficherStatut ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {afficherStatut && (
                  <form
                    className='absolute z-10 bg-blanc rounded-medium shadow-s p-4 text-base-regular'
                    id='filtres-statut'
                    onSubmit={submitFiltres}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <fieldset className='flex flex-col p-2'>
                      <legend className='sr-only'>
                        Choisir un statut à filtrer
                      </legend>
                      {Object.keys(StatutAction).map((statut) =>
                        renderStatutInput(statut as StatutAction)
                      )}
                    </fieldset>
                    <Button className='w-full justify-center' type='submit'>
                      Valider
                    </Button>
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
