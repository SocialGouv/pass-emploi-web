import React, { useEffect, useRef, useState } from 'react'

import EmptyStateImage from 'assets/images/illustration-search-grey.svg'
import ActionRow from 'components/action/ActionRow'
import EncartQualificationActions from 'components/action/EncartQualificationActions'
import FiltresStatutsActions from 'components/action/FiltresStatutsActions'
import { TRI } from 'components/action/OngletActions'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import SortIcon from 'components/ui/SortIcon'
import { SpinningLoader } from 'components/ui/SpinningLoader'
import Table from 'components/ui/Table/Table'
import { TBody } from 'components/ui/Table/TBody'
import { TH } from 'components/ui/Table/TH'
import { THead } from 'components/ui/Table/THead'
import TR from 'components/ui/Table/TR'
import { Action, ActionAQualifier, StatutAction } from 'interfaces/action'
import { BaseJeune } from 'interfaces/jeune'

interface TableauActionsJeuneProps {
  jeune: BaseJeune
  actionsFiltrees: Action[]
  isLoading: boolean
  onFiltres: (statuts: StatutAction[]) => void
  onLienExterne: (label: string) => void
  onTri: (tri: TRI) => void
  onQualification: (
    qualificationSNP: boolean,
    actionsSelectionnees: Array<{ idAction: string; codeQualification: string }>
  ) => Promise<void>
  tri: TRI
}

export default function TableauActionsJeune({
  jeune,
  actionsFiltrees,
  isLoading,
  onFiltres,
  onLienExterne,
  onTri,
  onQualification,
  tri,
}: TableauActionsJeuneProps) {
  const [statutsValides, setStatutsValides] = useState<StatutAction[]>([])
  const [actionsSelectionnees, setActionsSelectionnees] = useState<
    ActionAQualifier[]
  >([])
  const [actionSansCategorieSelectionnee, setActionSansCategorieSelectionnee] =
    useState<boolean>(false)
  const [actionNonTermineeSelectionnee, setActionNonTermineeSelectionnee] =
    useState<boolean>(false)

  const toutSelectionnerCheckboxRef = useRef<HTMLInputElement | null>(null)

  const boutonsDisabled =
    actionsSelectionnees.length === 0 ||
    actionSansCategorieSelectionnee ||
    actionNonTermineeSelectionnee

  function reinitialiserFiltres() {
    onFiltres([])
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

  const columnHeaderButtonStyle = 'flex items-center w-full h-full p-4'

  function getOrdreTriParDate() {
    return `Trier les actions ordre ${
      getIsSortedDesc() ? 'antéchronologique' : 'chronologique'
    }`
  }

  function filtrerActionsParStatuts(statutsSelectionnes: StatutAction[]) {
    setStatutsValides(statutsSelectionnes)
    onFiltres(statutsSelectionnes)
  }

  function selectionnerToutesLesActions() {
    if (actionsSelectionnees.length === 0) {
      setActionsSelectionnees(
        actionsFiltrees
          .filter((action) => action.status === StatutAction.Terminee)
          .map(({ id, qualification }) => {
            return {
              idAction: id,
              codeQualification: qualification?.code,
            }
          })
      )
    } else {
      setActionsSelectionnees([])
    }
  }

  function selectionnerAction({ id, qualification }: Action) {
    const selection = [...actionsSelectionnees]

    const indexAction = actionsSelectionnees.findIndex(
      ({ idAction }) => id === idAction
    )
    if (indexAction !== -1) selection.splice(indexAction, 1)
    else
      selection.push({ idAction: id, codeQualification: qualification?.code })

    setActionsSelectionnees(selection)
  }

  function selectionContientId(id: string) {
    return actionsSelectionnees.some((action) => action.idAction === id)
  }

  function indiqueSelectionContientActionNonTerminee(): boolean {
    for (const action of actionsSelectionnees) {
      const { status } = actionsFiltrees.find(
        ({ id }) => action.idAction === id
      )!

      if (status !== StatutAction.Terminee) return true
    }

    return false
  }

  useEffect(() => {
    setActionsSelectionnees([])
  }, [actionsFiltrees])

  useEffect(() => {
    setActionSansCategorieSelectionnee(
      actionsSelectionnees.some((action) => !action.codeQualification)
    )

    const aUneActionNonSelectionnee =
      indiqueSelectionContientActionNonTerminee()
    setActionNonTermineeSelectionnee(aUneActionNonSelectionnee)
  }, [actionsSelectionnees])

  useEffect(() => {
    if (!actionsFiltrees.length) return

    const tailleSelection = actionsSelectionnees.length
    const toutSelectionnerCheckbox = toutSelectionnerCheckboxRef.current!
    const isChecked = tailleSelection === actionsFiltrees.length
    const isIndeterminate =
      tailleSelection !== actionsFiltrees.length && tailleSelection > 0

    toutSelectionnerCheckbox.checked = isChecked
    toutSelectionnerCheckbox.indeterminate = isIndeterminate

    if (isChecked) toutSelectionnerCheckbox.ariaChecked = 'true'
    else if (isIndeterminate) toutSelectionnerCheckbox.ariaChecked = 'mixed'
    else toutSelectionnerCheckbox.ariaChecked = 'false'
  }, [actionsFiltrees.length, actionsSelectionnees.length])

  return (
    <>
      {isLoading && <SpinningLoader />}

      {actionsFiltrees.length === 0 && (
        <div className='flex flex-col justify-center'>
          <EmptyStateImage
            focusable='false'
            aria-hidden='true'
            className='m-auto w-[200px] h-[200px]'
          />
          <p className='text-base-bold text-center'>Aucun résultat.</p>
          <p className='text-center'>Modifiez vos filtres.</p>
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

      {actionsFiltrees.length > 0 && (
        <>
          <EncartQualificationActions
            actionsSelectionnees={actionsSelectionnees}
            boutonsDisabled={boutonsDisabled}
            jeune={jeune}
            nombreActionsSelectionnees={actionsSelectionnees.length}
            onLienExterne={onLienExterne}
            onQualification={onQualification}
          />

          <div className='mt-4'>
            {actionSansCategorieSelectionnee && (
              <FailureAlert
                label='Qualification impossible.'
                sub='Vous ne pouvez pas qualifier une ou plusieurs actions sans catégorie. Cliquez sur l’action pour pouvoir la modifier et lui ajouter une catégorie.'
              />
            )}
          </div>

          <Table
            asDiv={true}
            caption={{
              text: `Liste des actions de ${jeune.prenom} ${jeune.nom}`,
            }}
          >
            <THead>
              <TR isHeader={true}>
                <TH estCliquable={true}>
                  <div className='flex justify-center w-full h-full p-4'>
                    <input
                      id='qualification-tout-selectionner'
                      type='checkbox'
                      title='Tout sélectionner'
                      onChange={selectionnerToutesLesActions}
                      className='flex items-center cursor-pointer w-4 h-4 p-4'
                      aria-label='Tout sélectionner'
                      ref={toutSelectionnerCheckboxRef}
                    />
                  </div>
                </TH>
                <TH>Titre de l’action</TH>
                <TH estCliquable={true}>
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
                <TH>Catégorie</TH>
                <TH estCliquable={true}>
                  <FiltresStatutsActions
                    defaultValue={statutsValides}
                    onFiltres={filtrerActionsParStatuts}
                  />
                </TH>
              </TR>
            </THead>

            <TBody>
              {actionsFiltrees.map((action: Action) => (
                <ActionRow
                  key={action.id}
                  action={action}
                  jeuneId={jeune.id}
                  onSelection={selectionnerAction}
                  isChecked={selectionContientId(action.id)}
                />
              ))}
            </TBody>
          </Table>
        </>
      )}
    </>
  )
}
