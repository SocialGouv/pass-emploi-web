import React, { useEffect, useRef, useState } from 'react'

import ActionBeneficiaireRow from 'components/action/ActionBeneficiaireRow'
import EncartQualificationActions from 'components/action/EncartQualificationActions'
import FiltresCategories, {
  Categorie,
} from 'components/action/FiltresCategories'
import FiltresStatuts from 'components/action/FiltresStatuts'
import { TRI } from 'components/action/OngletActions'
import propsStatutsActions from 'components/action/propsStatutsActions'
import EmptyState from 'components/EmptyState'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import SortIcon from 'components/ui/SortIcon'
import SpinningLoader from 'components/ui/SpinningLoader'
import Table from 'components/ui/Table/Table'
import { TH } from 'components/ui/Table/TH'
import TR from 'components/ui/Table/TR'
import {
  Action,
  ActionAQualifier,
  SituationNonProfessionnelle,
  StatutAction,
} from 'interfaces/action'
import { BaseBeneficiaire } from 'interfaces/beneficiaire'

interface TableauActionsBeneficiaireProps {
  jeune: BaseBeneficiaire
  categories: SituationNonProfessionnelle[]
  actionsFiltrees: Action[]
  isLoading: boolean
  onFiltres: (filtres: Record<'categories' | 'statuts', string[]>) => void
  tri: TRI
  onTri: (tri: TRI) => void
  avecQualification?: {
    onQualification: (
      qualificationSNP: boolean,
      actionsSelectionnees: Array<{
        idAction: string
        codeQualification: string
      }>
    ) => Promise<void>
    onLienExterne: (label: string) => void
  }
}

export default function TableauActionsBeneficiaire({
  jeune,
  categories,
  actionsFiltrees,
  isLoading,
  onFiltres,
  onTri,
  tri,
  avecQualification,
}: TableauActionsBeneficiaireProps) {
  const listeActionsRef = useRef<HTMLTableElement>(null)
  const filtresStatutRef = useRef<HTMLButtonElement>(null)
  const filtresCategoriesRef = useRef<HTMLButtonElement>(null)

  const statutsSansQualification = [
    StatutAction.AFaire,
    StatutAction.Terminee,
    StatutAction.Annulee,
  ]
  const statutsAvecQualification = [
    StatutAction.AFaire,
    StatutAction.TermineeAQualifier,
    StatutAction.TermineeQualifiee,
    StatutAction.Annulee,
  ]
  const [statutsValides, setStatutsValides] = useState<string[]>([])
  const [categoriesValidees, setCategoriesValidees] = useState<Categorie[]>([])
  const [aReinitialiseLesFiltres, setAReinitialiseLesFiltres] =
    useState<boolean>(false)

  const [actionsSelectionnees, setActionsSelectionnees] = useState<
    ActionAQualifier[]
  >([])
  const [actionSansCategorieSelectionnee, setActionSansCategorieSelectionnee] =
    useState<boolean>(false)
  const toutSelectionnerCheckboxRef = useRef<HTMLInputElement | null>(null)
  const boutonsDisabled =
    actionsSelectionnees.length === 0 || actionSansCategorieSelectionnee

  function reinitialiserFiltres() {
    onFiltres({ categories: [], statuts: [] })
    setStatutsValides([])
    setCategoriesValidees([])
    setAReinitialiseLesFiltres(true)
  }

  function getIsSortedDesc(): boolean {
    return tri === TRI.dateEcheanceDecroissante
  }

  function trierParDateEcheance() {
    onTri(
      getIsSortedDesc()
        ? TRI.dateEcheanceCroissante
        : TRI.dateEcheanceDecroissante
    )
  }

  const columnHeaderButtonStyle = 'flex items-center w-full h-full p-4'

  function getOrdreTriParDate() {
    return `Trier les actions dans l’ordre ${
      getIsSortedDesc() ? 'antéchronologique' : 'chronologique'
    }`
  }

  function filtrerActionsParCategorie(categoriesSelectionnees: Categorie[]) {
    setCategoriesValidees(categoriesSelectionnees)
    filtresCategoriesRef.current!.focus()
    onFiltres({
      categories: categoriesSelectionnees.map(({ code }) => code),
      statuts: statutsValides,
    })
  }

  function filtrerActionsParStatuts(statutsSelectionnes: string[]) {
    setStatutsValides(statutsSelectionnes)
    filtresStatutRef.current!.focus()
    onFiltres({
      categories: categoriesValidees.map(({ code }) => code),
      statuts: statutsSelectionnes,
    })
  }

  function selectionnerToutesLesActions() {
    if (actionsSelectionnees.length === 0) {
      setActionsSelectionnees(
        actionsFiltrees
          .filter((action) => action.status === StatutAction.TermineeAQualifier)
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

  useEffect(() => {
    setActionsSelectionnees([])
  }, [actionsFiltrees])

  useEffect(() => {
    setActionSansCategorieSelectionnee(
      actionsSelectionnees.some((action) => !action.codeQualification)
    )
  }, [actionsSelectionnees])

  useEffect(() => {
    if (!avecQualification || !actionsFiltrees.length) return

    const nbActionsAQualifier = actionsFiltrees.filter(
      ({ status }) => status === StatutAction.TermineeAQualifier
    ).length

    const tailleSelection = actionsSelectionnees.length
    const toutSelectionnerCheckbox = toutSelectionnerCheckboxRef.current!
    const isChecked = tailleSelection === nbActionsAQualifier
    const isIndeterminate =
      tailleSelection !== nbActionsAQualifier && tailleSelection > 0

    toutSelectionnerCheckbox.checked = isChecked
    toutSelectionnerCheckbox.indeterminate = isIndeterminate

    if (isChecked) toutSelectionnerCheckbox.ariaChecked = 'true'
    else if (isIndeterminate) toutSelectionnerCheckbox.ariaChecked = 'mixed'
    else toutSelectionnerCheckbox.ariaChecked = 'false'
  }, [actionsFiltrees.length, actionsSelectionnees.length])

  useEffect(() => {
    if (aReinitialiseLesFiltres && actionsFiltrees.length) {
      listeActionsRef.current!.focus()
      setAReinitialiseLesFiltres(false)
    }
  }, [aReinitialiseLesFiltres, actionsFiltrees])

  return (
    <>
      {isLoading && <SpinningLoader alert={true} />}

      {actionsFiltrees.length === 0 && (
        <div className='flex flex-col justify-center'>
          <EmptyState
            shouldFocus={true}
            illustrationName={IllustrationName.Search}
            titre='Aucun résultat.'
            sousTitre='Modifiez vos filtres.'
          />
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
          {avecQualification && (
            <>
              <EncartQualificationActions
                actionsSelectionnees={actionsSelectionnees}
                boutonsDisabled={boutonsDisabled}
                jeune={jeune}
                nombreActionsSelectionnees={actionsSelectionnees.length}
                onLienExterne={avecQualification.onLienExterne}
                onQualification={avecQualification.onQualification}
              />

              <div className='mt-4'>
                {actionSansCategorieSelectionnee && (
                  <FailureAlert label='Qualification impossible.'>
                    <p>
                      Vous ne pouvez pas qualifier une ou plusieurs actions sans
                      catégorie. Cliquez sur l’action pour pouvoir la modifier
                      et lui ajouter une catégorie.
                    </p>
                  </FailureAlert>
                )}
              </div>
            </>
          )}

          <Table
            ref={listeActionsRef}
            caption={{
              text: `Liste des actions de ${jeune.prenom} ${jeune.nom}`,
            }}
          >
            <thead>
              <TR isHeader={true}>
                {avecQualification && (
                  <TH estCliquable={true}>
                    <label className='cursor-pointer p-4'>
                      <span className='sr-only'>Tout sélectionner</span>
                      <input
                        type='checkbox'
                        title='Tout sélectionner'
                        onChange={selectionnerToutesLesActions}
                        className='w-4 h-4 p-4'
                        ref={toutSelectionnerCheckboxRef}
                      />
                    </label>
                  </TH>
                )}
                <TH>Titre de l’action</TH>
                <TH estCliquable={true}>
                  <button
                    onClick={trierParDateEcheance}
                    aria-label={`Date de l’action - ${getOrdreTriParDate()}`}
                    title={getOrdreTriParDate()}
                    className={columnHeaderButtonStyle}
                    type='button'
                  >
                    Date de l’action
                    <SortIcon isSorted={true} isDesc={getIsSortedDesc()} />
                  </button>
                </TH>
                <TH estCliquable={true}>
                  <FiltresCategories
                    ref={filtresCategoriesRef}
                    categories={categories}
                    defaultValue={categoriesValidees}
                    entites='actions'
                    onFiltres={filtrerActionsParCategorie}
                  />
                </TH>
                <TH estCliquable={true}>
                  <FiltresStatuts
                    ref={filtresStatutRef}
                    defaultValue={statutsValides}
                    onFiltres={filtrerActionsParStatuts}
                    statuts={
                      avecQualification
                        ? statutsAvecQualification
                        : statutsSansQualification
                    }
                    entites='actions'
                    propsStatuts={propsStatutsActions}
                  />
                </TH>
                <TH>Voir le détail</TH>
              </TR>
            </thead>

            <tbody>
              {actionsFiltrees.map((action: Action) => (
                <ActionBeneficiaireRow
                  key={action.id}
                  action={action}
                  avecQualification={
                    avecQualification && {
                      isChecked: selectionContientId(action.id),
                      onSelection: selectionnerAction,
                    }
                  }
                />
              ))}
            </tbody>
          </Table>
        </>
      )}
    </>
  )
}
