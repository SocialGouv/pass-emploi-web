import React, { useEffect, useRef, useState } from 'react'

import ActionBeneficiaireRow from 'components/action/ActionBeneficiaireRow'
import EncartQualificationActions from 'components/action/EncartQualificationActions'
import FiltresCategories, {
  Categorie,
} from 'components/action/FiltresCategories'
import FiltresStatuts from 'components/action/FiltresStatuts'
import propsStatutsActions from 'components/action/propsStatutsActions'
import EmptyState from 'components/EmptyState'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import SortIcon from 'components/ui/SortIcon'
import Table from 'components/ui/Table/Table'
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
  shouldFocus: boolean
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
  shouldFocus,
  avecQualification,
  labelSemaine,
}: TableauActionsBeneficiaireProps) {
  const isFirstRender = useRef<boolean>(true)
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
    isFirstRender.current = false
    return () => {
      isFirstRender.current = true
    }
  }, [])

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
    if (isFirstRender.current) return

    if (actionsFiltrees.length && (aReinitialiseLesFiltres || shouldFocus)) {
      listeActionsRef.current!.focus()
      setAReinitialiseLesFiltres(false)
    }
  }, [aReinitialiseLesFiltres, shouldFocus])

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
      {actionsFiltrees.length === 0 && (
        <EmptyState
          shouldFocus={shouldFocus}
          illustrationName={IllustrationName.Search}
          titre='Aucun résultat.'
          sousTitre='Modifiez vos filtres.'
          bouton={{
            onClick: async () => reinitialiserFiltres(),
            label: 'Réinitialiser les filtres',
          }}
        />
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

          <div className='my-4 flex justify-between gap-6'>
            <label className='cursor-pointer p-4 flex flex-row-reverse items-center gap-2'>
              Tout sélectionner
              <input
                type='checkbox'
                title='Tout sélectionner'
                onChange={selectionnerToutesLesActions}
                className='w-4 h-4 p-4'
                ref={toutSelectionnerCheckboxRef}
              />
            </label>

            <div className='flex gap-2 items-center'>
              <button
                onClick={() => setTriAntichronologique(!triAntichronologique)}
                aria-label={`Date de l’action - ${getOrdreTriParDate()}`}
                title={getOrdreTriParDate()}
                className={columnHeaderButtonStyle}
                type='button'
              >
                Date de l’action
                <SortIcon isSorted={true} isDesc={triAntichronologique} />
              </button>

              <FiltresCategories
                ref={filtresCategoriesRef}
                categories={categories}
                defaultValue={categoriesValidees}
                entites='actions'
                onFiltres={filtrerActionsParCategorie}
              />

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
            </div>
          </div>

          <Table
            ref={listeActionsRef}
            caption={{
              text: `Liste des actions de ${jeune.prenom} ${jeune.nom} ${labelSemaine}`,
            }}
          >
            <thead className='sr-only'>
              <tr>
                <th scope='col'>Sélection</th>
                <th scope='col'>Catégorie et date de l’action</th>
                <th scope='col'>Titre et commentaire de l’action</th>
                <th scope='col'>Statut de l’action</th>
                <th scope='col'>Voir le détail</th>
              </tr>
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
