import React, { useEffect, useRef, useState } from 'react'

import ActionBeneficiaireRow from 'components/action/ActionBeneficiaireRow'
import EncartQualificationActions from 'components/action/EncartQualificationActions'
import FiltresCategories, {
  Categorie,
} from 'components/action/FiltresCategories'
import FiltresStatuts from 'components/action/FiltresStatuts'
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
  comparerParDateEcheance,
  SituationNonProfessionnelle,
  StatutAction,
} from 'interfaces/action'
import { IdentiteBeneficiaire } from 'interfaces/beneficiaire'

interface TableauActionsBeneficiaireProps {
  jeune: IdentiteBeneficiaire
  categories: SituationNonProfessionnelle[]
  actions: Action[]
  isLoading: boolean
  labelSemaine: string
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
  actions,
  isLoading,
  avecQualification,
  labelSemaine,
}: TableauActionsBeneficiaireProps) {
  const listeActionsRef = useRef<HTMLTableElement>(null)
  const filtresStatutRef = useRef<HTMLButtonElement>(null)
  const filtresCategoriesRef = useRef<HTMLButtonElement>(null)

  const [actionsFiltrees, setActionsFiltrees] = useState<Action[]>(actions)
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

  const [actionsTriees, setActionsTriees] = useState<Action[]>(actions)
  const [triAntichronologique, setTriAntichronologique] =
    useState<boolean>(true)

  const [actionsSelectionnees, setActionsSelectionnees] = useState<
    ActionAQualifier[]
  >([])
  const [actionSansCategorieSelectionnee, setActionSansCategorieSelectionnee] =
    useState<boolean>(false)
  const toutSelectionnerCheckboxRef = useRef<HTMLInputElement | null>(null)
  const boutonsDisabled =
    actionsSelectionnees.length === 0 || actionSansCategorieSelectionnee

  function reinitialiserFiltres() {
    setStatutsValides([])
    setCategoriesValidees([])
    setAReinitialiseLesFiltres(true)
  }

  const columnHeaderButtonStyle = 'flex items-center w-full h-full p-4'

  function getOrdreTriParDate() {
    return `Trier les actions dans l’ordre ${
      triAntichronologique ? 'antéchronologique' : 'chronologique'
    }`
  }

  function filtrerActionsParCategorie(categoriesSelectionnees: Categorie[]) {
    setCategoriesValidees(categoriesSelectionnees)
    filtresCategoriesRef.current!.focus()
  }

  function filtrerActionsParStatuts(statutsSelectionnes: string[]) {
    setStatutsValides(statutsSelectionnes)
    filtresStatutRef.current!.focus()
  }

  function selectionnerToutesLesActions() {
    if (actionsSelectionnees.length === 0) {
      setActionsSelectionnees(
        actionsFiltrees
          .filter((action) => action.status === StatutAction.TermineeAQualifier)
          .map(({ id, qualification }) => ({
            idAction: id,
            codeQualification: qualification?.code,
          }))
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
    let actionsFiltreesParCategories = actions
    if (categoriesValidees.length)
      actionsFiltreesParCategories = actions.filter((action) =>
        categoriesValidees.some(
          ({ code }) => code === action.qualification?.code
        )
      )

    let actionsFiltreesParCategoriesEtStatuts = actionsFiltreesParCategories
    if (statutsValides.length)
      actionsFiltreesParCategoriesEtStatuts =
        actionsFiltreesParCategories.filter((action) =>
          statutsValides.includes(action.status)
        )

    setActionsFiltrees(actionsFiltreesParCategoriesEtStatuts)
  }, [actions, categoriesValidees, statutsValides])

  useEffect(() => {
    setActionsSelectionnees([])
  }, [actionsFiltrees])

  useEffect(() => {
    if (aReinitialiseLesFiltres && actionsFiltrees.length) {
      listeActionsRef.current!.focus()
      setAReinitialiseLesFiltres(false)
    }
  }, [aReinitialiseLesFiltres, actionsFiltrees])

  useEffect(() => {
    setActionsTriees(
      [...actionsFiltrees].sort((action1, action2) =>
        comparerParDateEcheance(action1, action2, triAntichronologique)
      )
    )
  }, [actionsFiltrees, triAntichronologique])

  useEffect(() => {
    setActionSansCategorieSelectionnee(
      actionsSelectionnees.some((action) => !action.codeQualification)
    )
  }, [actionsSelectionnees])

  useEffect(() => {
    if (!avecQualification) return

    const nbActionsAQualifier = actionsFiltrees.filter(
      ({ status }) => status === StatutAction.TermineeAQualifier
    ).length

    const tailleSelection = actionsSelectionnees.length
    const toutSelectionnerCheckbox = toutSelectionnerCheckboxRef.current!
    const isChecked =
      tailleSelection > 0 && tailleSelection === nbActionsAQualifier
    const isIndeterminate =
      tailleSelection > 0 && tailleSelection !== nbActionsAQualifier

    toutSelectionnerCheckbox.checked = isChecked
    toutSelectionnerCheckbox.indeterminate = isIndeterminate

    if (isChecked) toutSelectionnerCheckbox.ariaChecked = 'true'
    else if (isIndeterminate) toutSelectionnerCheckbox.ariaChecked = 'mixed'
    else toutSelectionnerCheckbox.ariaChecked = 'false'
  }, [actionsSelectionnees.length])

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
              text: `Liste des actions de ${jeune.prenom} ${jeune.nom} ${labelSemaine}`,
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
                    onClick={() =>
                      setTriAntichronologique(!triAntichronologique)
                    }
                    aria-label={`Date de l’action - ${getOrdreTriParDate()}`}
                    title={getOrdreTriParDate()}
                    className={columnHeaderButtonStyle}
                    type='button'
                  >
                    Date de l’action
                    <SortIcon isSorted={true} isDesc={triAntichronologique} />
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
              {actionsTriees.map((action: Action) => (
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
