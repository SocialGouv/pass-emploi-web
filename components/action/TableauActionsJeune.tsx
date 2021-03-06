import React, {
  ChangeEvent,
  FormEvent,
  Fragment,
  useEffect,
  useState,
} from 'react'

import EmptyStateImage from 'assets/images/empty_state.svg'
import ActionRow from 'components/action/ActionRow'
import { TRI } from 'components/action/OngletActions'
import propsStatutsActions from 'components/action/propsStatutsActions'
import Button, { ButtonStyle } from 'components/ui/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { Action, StatutAction } from 'interfaces/action'
import { BaseJeune } from 'interfaces/jeune'

interface TableauActionsJeuneProps {
  jeune: BaseJeune
  actions: Action[]
  isLoading: boolean
  onFiltres: (statutsSelectionnes: StatutAction[]) => void
  onTri: () => void
  tri: TRI
}

export default function TableauActionsJeune({
  jeune,
  actions,
  isLoading,
  onFiltres,
  onTri,
  tri,
}: TableauActionsJeuneProps) {
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
    onFiltres(statutsSelectionnes)

    setAfficherStatut(false)
    setStatutsValides(statutsSelectionnes)
  }

  function reinitialiserFiltres() {
    onFiltres([])
    setStatutsValides([])
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
      <div
        role='table'
        className='table w-full'
        aria-label={`Liste des actions de ${jeune.prenom} ${jeune.nom}`}
      >
        <div role='rowgroup' className='table-header-group '>
          <div role='row' className='table-row text-s-regular'>
            <div role='columnheader' className='table-cell pl-4 py-4'>
              Intitul?? de l&apos;action
            </div>
            <div role='columnheader' className='table-cell relative'>
              <button
                onClick={onTri}
                aria-label='Cr????e le - trier les actions'
                className='w-full flex items-center'
              >
                Cr????e le
                <IconComponent
                  name={IconName.ChevronDown}
                  className={`h-4 w-4 fill-primary ${
                    tri === TRI.dateDecroissante ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>
            <div role='columnheader' className='table-cell relative'>
              <button
                aria-controls='filtres-statut'
                aria-expanded={afficherStatut}
                onClick={() => setAfficherStatut(!afficherStatut)}
                aria-label='Statut - Filtrer les actions'
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
                >
                  <fieldset className='flex flex-col p-2'>
                    <legend className='sr-only'>
                      Choisir un statut ?? filtrer
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

        {actions.length === 0 && (
          <div
            role='rowgroup'
            className='table-caption text-center'
            style={{ captionSide: 'bottom' }}
          >
            <div role='row'>
              <div role='cell' aria-colspan={3}>
                <EmptyStateImage
                  focusable='false'
                  aria-hidden='true'
                  className='m-auto w-[200px] h-[200px]'
                />
                <p className='text-md-semi text-center'>
                  Aucune action ne correspondant aux filtres.
                </p>
                <Button
                  type='button'
                  style={ButtonStyle.PRIMARY}
                  onClick={reinitialiserFiltres}
                  className='m-auto mt-8'
                >
                  R??initialiser les filtres
                </Button>
              </div>
            </div>
          </div>
        )}

        {actions.length > 0 && (
          <div role='rowgroup' className='table-row-group'>
            {actions.map((action: Action) => (
              <Fragment key={action.id}>
                <ActionRow action={action} jeuneId={jeune.id} />
                <div className='mb-2' />
              </Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
