import React, { useEffect, useRef, useState } from 'react'

import ActionRow from 'components/action/ActionRow'
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

interface TableauActionsJeuneProps {
  jeune: BaseBeneficiaire
  categories: SituationNonProfessionnelle[]
  actionsFiltrees: Action[]
  isLoading: boolean
  onFiltres: (filtres: Record<'categories' | 'statuts', string[]>) => void
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
  categories,
  actionsFiltrees,
  isLoading,
  onFiltres,
  onLienExterne,
  onTri,
  onQualification,
  tri,
}: TableauActionsJeuneProps) {
  const listeActionsRef = useRef<HTMLTableElement>(null)
  const filtresStatutRef = useRef<HTMLButtonElement>(null)
  const filtresCategoriesRef = useRef<HTMLButtonElement>(null)
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

  useEffect(() => {
    setActionsSelectionnees([])
  }, [actionsFiltrees])

  useEffect(() => {
    setActionSansCategorieSelectionnee(
      actionsSelectionnees.some((action) => !action.codeQualification)
    )
  }, [actionsSelectionnees])

  useEffect(() => {
    if (!actionsFiltrees.length) return
    const nbActionsTerminees = actionsFiltrees.filter(
      ({ status }) => status === StatutAction.Terminee
    ).length

    const tailleSelection = actionsSelectionnees.length
    const toutSelectionnerCheckbox = toutSelectionnerCheckboxRef.current!
    const isChecked = tailleSelection === nbActionsTerminees
    const isIndeterminate =
      tailleSelection !== nbActionsTerminees && tailleSelection > 0

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
                sub={
                  <p>
                    Vous ne pouvez pas qualifier une ou plusieurs actions sans
                    catégorie. Cliquez sur l’action pour pouvoir la modifier et
                    lui ajouter une catégorie.
                  </p>
                }
              />
            )}
          </div>

          <Table
            ref={listeActionsRef}
            caption={{
              text: `Liste des actions de ${jeune.prenom} ${jeune.nom}`,
            }}
          >
            <thead>
              <TR isHeader={true}>
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
                    <SortIcon
                      isSorted={getIsSortedByDateEcheance()}
                      isDesc={getIsSortedDesc()}
                    />
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
                    statuts={Object.keys(StatutAction)}
                    entites='actions'
                    propsStatuts={propsStatutsActions}
                  />
                </TH>
                <TH>Voir le détail</TH>
              </TR>
            </thead>

            <tbody>
              {actionsFiltrees.map((action: Action) => (
                <ActionRow
                  key={action.id}
                  action={action}
                  jeuneId={jeune.id}
                  onSelection={selectionnerAction}
                  isChecked={selectionContientId(action.id)}
                />
              ))}
            </tbody>
          </Table>
        </>
      )}
    </>
  )
}
