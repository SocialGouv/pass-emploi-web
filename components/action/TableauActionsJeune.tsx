import React, { useState } from 'react'

import EmptyStateImage from 'assets/images/empty_state.svg'
import ActionRow from 'components/action/ActionRow'
import FiltresEtatsQualificationActions from 'components/action/FiltresEtatsQualificationActions'
import FiltresStatutsActions from 'components/action/FiltresStatutsActions'
import { TRI } from 'components/action/OngletActions'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import SortIcon from 'components/ui/SortIcon'
import { HeaderCell } from 'components/ui/Table/HeaderCell'
import TableLayout from 'components/ui/Table/TableLayout'
import {
  Action,
  EtatQualificationAction,
  StatutAction,
} from 'interfaces/action'
import { BaseJeune } from 'interfaces/jeune'

interface TableauActionsJeuneProps {
  afficherFiltresEtatsQualification: boolean
  jeune: BaseJeune
  actions: Action[]
  isLoading: boolean
  onFiltres: (filtres: {
    statuts: StatutAction[]
    etatsQualification: EtatQualificationAction[]
  }) => void
  onTri: (tri: TRI) => void
  tri: TRI
}

export default function TableauActionsJeune({
  afficherFiltresEtatsQualification,
  jeune,
  actions,
  isLoading,
  onFiltres,
  onTri,
  tri,
}: TableauActionsJeuneProps) {
  const [statutsValides, setStatutsValides] = useState<StatutAction[]>([])
  const [etatsQualificationValides, setEtatsQualificationValides] = useState<
    EtatQualificationAction[]
  >([])

  function reinitialiserFiltres() {
    onFiltres({ statuts: [], etatsQualification: [] })
    setStatutsValides([])
    setEtatsQualificationValides([])
  }

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

  function filtrerActionsParStatuts(statutsSelectionnes: StatutAction[]) {
    setStatutsValides(statutsSelectionnes)
    onFiltres({
      statuts: statutsSelectionnes,
      etatsQualification: [],
    })
  }

  function filtrerActionsParEtatsQualification(
    etatsQualificationSelectionnes: EtatQualificationAction[]
  ) {
    setEtatsQualificationValides(etatsQualificationSelectionnes)
    onFiltres({
      etatsQualification: etatsQualificationSelectionnes,
      statuts: [],
    })
  }

  return (
    <>
      {afficherFiltresEtatsQualification && (
        <FiltresEtatsQualificationActions
          defaultValue={etatsQualificationValides}
          onFiltres={filtrerActionsParEtatsQualification}
        />
      )}

      <div className={isLoading ? 'animate-pulse' : ''}>
        <TableLayout
          caption={`Liste des actions de ${jeune.prenom} ${jeune.nom}`}
        >
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
              <FiltresStatutsActions
                style={headerColumnWithButtonHover}
                defaultValue={statutsValides}
                onFiltres={filtrerActionsParStatuts}
              />
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
    </>
  )
}
