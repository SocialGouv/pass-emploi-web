import React, { useState } from 'react'

import EmptyStateImage from 'assets/images/empty_state.svg'
import ActionRow from 'components/action/ActionRow'
import FiltresEtatsQualificationActions from 'components/action/FiltresEtatsQualificationActions'
import FiltresStatutsActions from 'components/action/FiltresStatutsActions'
import { TRI } from 'components/action/OngletActions'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import SortIcon from 'components/ui/SortIcon'
import { SpinningLoader } from 'components/ui/SpinningLoader'
import Table from 'components/ui/Table/Table'
import { TBody } from 'components/ui/Table/TBody'
import { TH } from 'components/ui/Table/TH'
import { THead } from 'components/ui/Table/THead'
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

      {isLoading && <SpinningLoader />}

      {actions.length === 0 && (
        <>
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
        </>
      )}

      {actions.length > 0 && (
        <Table
          asDiv={true}
          caption={`Liste des actions de ${jeune.prenom} ${jeune.nom}`}
        >
          <THead>
            <TH>Intitulé de l’action</TH>
            <TH className={headerColumnWithButtonHover}>
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
            </TH>
            <TH className={headerColumnWithButtonHover}>
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
            </TH>
            <TH className={headerColumnWithButtonHover}>
              <FiltresStatutsActions
                defaultValue={statutsValides}
                onFiltres={filtrerActionsParStatuts}
              />
            </TH>
          </THead>

          <TBody>
            {actions.map((action: Action) => (
              <ActionRow key={action.id} action={action} jeuneId={jeune.id} />
            ))}
          </TBody>
        </Table>
      )}
    </>
  )
}
