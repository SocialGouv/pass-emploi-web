import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react'

import TableLayout from '../ui/Table/TableLayout'

import EmptyStateImage from 'assets/images/empty_state.svg'
import ActionRow from 'components/action/ActionRow'
import { TRI } from 'components/action/OngletActions'
import propsStatutsActions from 'components/action/propsStatutsActions'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import SortIcon from 'components/ui/SortIcon'
import { HeaderCell } from 'components/ui/Table/HeaderCell'
import { Action, StatutAction } from 'interfaces/action'
import { BaseJeune } from 'interfaces/jeune'

interface TableauActionsJeuneProps {
  jeune: BaseJeune
  actions: Action[]
  isLoading: boolean
  onFiltres: (statutsSelectionnes: StatutAction[]) => void
  onTri: (tri: TRI) => void
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
      setStatutsSelectionnes(statutsSelectionnes.concat(statut))
    }
  }

  function submitFiltres(e: FormEvent) {
    e.preventDefault()
    onFiltres(statutsSelectionnes)

    setStatutsValides(statutsSelectionnes)
    setAfficherStatut(false)
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

  function getIsSortedByCreationDate(): boolean {
    return tri === TRI.dateCroissante || tri === TRI.dateDecroissante
  }

  function getIsSortedByDateEcheance(): boolean {
    return (
      tri === TRI.dateEcheanceCroissante || tri === TRI.dateEcheanceDecroissante
    )
  }

  function getIsSortedDesc(): boolean {
    return tri === TRI.dateEcheanceDecroissante || tri === TRI.dateDecroissante
  }

  function trierParDateCreation() {
    let nouveauTri: TRI = TRI.dateDecroissante
    if (getIsSortedByCreationDate() && getIsSortedDesc()) {
      nouveauTri = TRI.dateCroissante
    }
    onTri(nouveauTri)
  }

  function trierParDateEcheance() {
    let nouveauTri: TRI = TRI.dateEcheanceDecroissante
    if (getIsSortedByDateEcheance() && getIsSortedDesc()) {
      nouveauTri = TRI.dateEcheanceCroissante
    }
    onTri(nouveauTri)
  }
  const headerColumnWithButtonHover = 'rounded-medium hover:bg-primary_lighten'

  return (
    <div className={isLoading ? 'animate-pulse' : ''}>
      <TableLayout describedBy='table-caption'>
        <div id='table-caption' className='sr-only'>
          {`Liste des actions de ${jeune.prenom} ${jeune.nom}`}
        </div>
        <div role='rowgroup' className='table-header-group '>
          <div role='row' className='table-row text-base-regular'>
            <HeaderCell>Intitulé de l’action</HeaderCell>
            <HeaderCell className={headerColumnWithButtonHover}>
              <button
                onClick={trierParDateCreation}
                aria-label='Créée le - trier les actions'
                className='flex items-center'
              >
                Créée le
                <SortIcon
                  isSorted={getIsSortedByCreationDate()}
                  isDesc={getIsSortedDesc()}
                />
              </button>
            </HeaderCell>
            <HeaderCell className={headerColumnWithButtonHover}>
              <button
                onClick={trierParDateEcheance}
                aria-label='Échéance - trier les actions'
                className='flex items-center'
              >
                Échéance
                <SortIcon
                  isSorted={getIsSortedByDateEcheance()}
                  isDesc={getIsSortedDesc()}
                />
              </button>
            </HeaderCell>
            <HeaderCell className={`relative ${headerColumnWithButtonHover}`}>
              <button
                aria-controls='filtres-statut'
                aria-expanded={afficherStatut}
                onClick={() => setAfficherStatut(!afficherStatut)}
                aria-label='Statut - Filtrer les actions'
                className='flex items-center'
              >
                Statut
                <IconComponent
                  name={IconName.ChevronDown}
                  className={`h-4 w-4 ml-2 fill-primary ${
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
                      Choisir un ou plusieurs statuts à filtrer
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
            </HeaderCell>
          </div>
        </div>

        {actions.length === 0 && (
          <div
            role='rowgroup'
            className='table-caption text-center'
            style={{ captionSide: 'bottom' }}
          >
            <div role='row'>
              <div role='cell' aria-colspan={4}>
                <EmptyStateImage
                  focusable='false'
                  aria-hidden='true'
                  className='m-auto w-[200px] h-[200px]'
                />
                <p className='text-base-bold text-center'>
                  Aucune action ne correspondant aux filtres.
                </p>
                <Button
                  type='button'
                  style={ButtonStyle.PRIMARY}
                  onClick={reinitialiserFiltres}
                  className='m-auto mt-8'
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            </div>
          </div>
        )}

        {actions.length > 0 && (
          <div role='rowgroup' className='table-row-group'>
            {actions.map((action: Action) => (
              <ActionRow key={action.id} action={action} jeuneId={jeune.id} />
            ))}
          </div>
        )}
      </TableLayout>
    </div>
  )
}
