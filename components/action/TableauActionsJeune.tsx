import React, { useState } from 'react'

import EmptyStateImage from 'assets/images/illustration-search-grey.svg'
import ActionRow from 'components/action/ActionRow'
import FiltresStatutsActions from 'components/action/FiltresStatutsActions'
import { TRI } from 'components/action/OngletActions'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import SortIcon from 'components/ui/SortIcon'
import { SpinningLoader } from 'components/ui/SpinningLoader'
import Table from 'components/ui/Table/Table'
import { TBody } from 'components/ui/Table/TBody'
import { TH } from 'components/ui/Table/TH'
import { THead } from 'components/ui/Table/THead'
import TR from 'components/ui/Table/TR'
import {
  Action,
  EtatQualificationAction,
  StatutAction,
} from 'interfaces/action'
import { BaseJeune } from 'interfaces/jeune'

interface TableauActionsJeuneProps {
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
  jeune,
  actions,
  isLoading,
  onFiltres,
  onTri,
  tri,
}: TableauActionsJeuneProps) {
  const [statutsValides, setStatutsValides] = useState<StatutAction[]>([])

  function reinitialiserFiltres() {
    onFiltres({ statuts: [], etatsQualification: [] })
    setStatutsValides([])
  }

  function getIsSortedByDateEcheance(): boolean {
    return (
      tri === TRI.dateEcheanceCroissante || tri === TRI.dateEcheanceDecroissante
    )
  }

  function getIsSortedDesc(): boolean {
    return tri === TRI.dateEcheanceDecroissante || tri === TRI.dateDecroissante
  }

  function trierParDateEcheance() {
    let nouveauTri: TRI = TRI.dateEcheanceDecroissante
    if (getIsSortedByDateEcheance() && getIsSortedDesc()) {
      nouveauTri = TRI.dateEcheanceCroissante
    }
    onTri(nouveauTri)
  }

  const headerColumnWithButtonHover = 'rounded-base hover:bg-primary_lighten'
  const columnHeaderButtonStyle = 'flex items-center w-full h-full p-4'

  function getOrdreTriParDate() {
    return `Trier les actions ordre ${
      getIsSortedDesc() ? 'antéchronologique' : 'chronologique'
    }`
  }

  function filtrerActionsParStatuts(statutsSelectionnes: StatutAction[]) {
    setStatutsValides(statutsSelectionnes)
    onFiltres({
      statuts: statutsSelectionnes,
      etatsQualification: [],
    })
  }

  return (
    <>
      {isLoading && <SpinningLoader />}

      {actions.length === 0 && (
        <div className='flex flex-col justify-center'>
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
            className='mx-auto mt-8'
          >
            Réinitialiser les filtres
          </Button>
        </div>
      )}

      {actions.length > 0 && (
        <Table
          asDiv={true}
          caption={{
            text: `Liste des actions de ${jeune.prenom} ${jeune.nom}`,
          }}
        >
          <THead>
            <TR isHeader={true}>
              <TH>Titre de l’action</TH>
              <TH className={headerColumnWithButtonHover} estCliquable={true}>
                <button
                  onClick={trierParDateEcheance}
                  aria-label={`Date de l’action - ${getOrdreTriParDate()}`}
                  title={getOrdreTriParDate()}
                  className={columnHeaderButtonStyle}
                >
                  Date de l’action
                  <SortIcon
                    isSorted={getIsSortedByDateEcheance()}
                    isDesc={getIsSortedDesc()}
                  />
                </button>
              </TH>
              <TH className={headerColumnWithButtonHover} estCliquable={true}>
                <FiltresStatutsActions
                  defaultValue={statutsValides}
                  onFiltres={filtrerActionsParStatuts}
                />
              </TH>
            </TR>
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
