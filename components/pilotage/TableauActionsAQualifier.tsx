import React, { useEffect, useRef, useState } from 'react'

import ActionRowPilotage from 'components/action/ActionRowPilotage'
import EncartQualificationActions from 'components/action/EncartQualificationActions'
import FiltresCategories, {
  Categorie,
} from 'components/action/FiltresCategories'
import EmptyState from 'components/EmptyState'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import SortIcon from 'components/ui/SortIcon'
import Table from 'components/ui/Table/Table'
import { TH } from 'components/ui/Table/TH'
import TR from 'components/ui/Table/TR'
import {
  ActionAQualifier,
  ActionPilotage,
  SituationNonProfessionnelle,
} from 'interfaces/action'
import { BaseBeneficiaire } from 'interfaces/beneficiaire'
import { TriActionsAQualifier } from 'services/actions.service'

type TableauActionsConseillerProps = {
  categories: SituationNonProfessionnelle[]
  actionsFiltrees: ActionPilotage[]
  tri: TriActionsAQualifier
  onTri: (tri: TriActionsAQualifier) => void
  onFiltres: (categories: string[]) => void
  onLienExterne: (label: string) => void
  onQualification: (
    qualificationSNP: boolean,
    actionsSelectionnees: Array<{ idAction: string; codeQualification: string }>
  ) => Promise<void>
}

export default function TableauActionsAQualifier({
  categories,
  actionsFiltrees,
  tri,
  onTri,
  onFiltres,
  onLienExterne,
  onQualification,
}: TableauActionsConseillerProps) {
  const listeActionsRef = useRef<HTMLTableElement>(null)
  const filtresRef = useRef<HTMLButtonElement>(null)
  const [categoriesValidees, setCategoriesValidees] = useState<Categorie[]>([])
  const [aReinitialiseLesFiltres, setAReinitialiseLesFiltres] =
    useState<boolean>(false)

  const toutSelectionnerCheckboxRef = useRef<HTMLInputElement | null>(null)
  const [actionsSelectionnees, setActionsSelectionnees] = useState<
    ActionAQualifier[]
  >([])
  const [beneficiaireSelectionne, setBeneficiaireSelectionne] =
    useState<BaseBeneficiaire>()

  const [actionSansCategorieSelectionnee, setActionSansCategorieSelectionnee] =
    useState<boolean>(false)
  const [
    plusieursBeneficiairesSelectionnes,
    setPlusieursBeneficiairesSelectionnes,
  ] = useState<boolean>(false)

  const boutonsDisabled =
    actionsSelectionnees.length === 0 ||
    actionSansCategorieSelectionnee ||
    plusieursBeneficiairesSelectionnes

  function inverserTriBeneficiaires() {
    const nouvelOrdre =
      tri === 'BENEFICIAIRE_ALPHABETIQUE'
        ? 'BENEFICIAIRE_INVERSE'
        : 'BENEFICIAIRE_ALPHABETIQUE'
    onTri(nouvelOrdre)
    setActionsSelectionnees([])
  }

  function inverserTriDateRealisation() {
    const nouvelOrdre =
      tri === 'REALISATION_CHRONOLOGIQUE'
        ? 'REALISATION_ANTICHRONOLOGIQUE'
        : 'REALISATION_CHRONOLOGIQUE'
    onTri(nouvelOrdre)
    setActionsSelectionnees([])
  }

  function filtrerActionsParCategorie(categoriesSelectionnees: Categorie[]) {
    setCategoriesValidees(categoriesSelectionnees)
    filtresRef.current!.focus()
    onFiltres(categoriesSelectionnees.map(({ code }) => code))
  }

  function reinitialiserFiltres() {
    onFiltres([])
    setCategoriesValidees([])
    setAReinitialiseLesFiltres(true)
  }

  function selectionnerAction({ id, categorie }: ActionPilotage) {
    const selection = [...actionsSelectionnees]

    const indexAction = actionsSelectionnees.findIndex(
      ({ idAction }) => id === idAction
    )
    if (indexAction !== -1) selection.splice(indexAction, 1)
    else selection.push({ idAction: id, codeQualification: categorie?.code })

    setActionsSelectionnees(selection)
  }

  function selectionnerToutesLesActions() {
    if (actionsSelectionnees.length === 0) {
      setActionsSelectionnees(
        actionsFiltrees.map(({ id, categorie }) => {
          return {
            idAction: id,
            codeQualification: categorie?.code,
          }
        })
      )
    } else {
      setActionsSelectionnees([])
    }
  }

  function selectionContientId(id: string) {
    return actionsSelectionnees.some((action) => action.idAction === id)
  }

  function recupererBeneficiairesSelectionnes(): Map<string, BaseBeneficiaire> {
    const mapBeneficiaires = new Map<string, BaseBeneficiaire>()
    actionsSelectionnees.forEach(({ idAction }) => {
      const { beneficiaire } = actionsFiltrees.find(
        ({ id }) => idAction === id
      )!
      mapBeneficiaires.set(beneficiaire.id, beneficiaire)
    })
    return mapBeneficiaires
  }

  useEffect(() => {
    setActionsSelectionnees([])
  }, [actionsFiltrees])

  useEffect(() => {
    setActionSansCategorieSelectionnee(
      actionsSelectionnees.some((action) => !action.codeQualification)
    )

    const beneficiairesSelectionnes = recupererBeneficiairesSelectionnes()
    setBeneficiaireSelectionne(beneficiairesSelectionnes.values().next().value)
    setPlusieursBeneficiairesSelectionnes(beneficiairesSelectionnes.size > 1)
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

  useEffect(() => {
    if (aReinitialiseLesFiltres && actionsFiltrees.length) {
      listeActionsRef.current!.focus()
      setAReinitialiseLesFiltres(false)
    }
  }, [aReinitialiseLesFiltres, actionsFiltrees])

  return (
    <>
      <EncartQualificationActions
        actionsSelectionnees={actionsSelectionnees}
        boutonsDisabled={boutonsDisabled}
        jeune={beneficiaireSelectionne}
        nombreActionsSelectionnees={actionsSelectionnees.length}
        onLienExterne={onLienExterne}
        onQualification={onQualification}
      />

      <div className='mt-4'>
        {actionSansCategorieSelectionnee && (
          <FailureAlert label='Qualification impossible.'>
            <p>
              Vous ne pouvez pas qualifier une ou plusieurs actions sans
              catégorie. Cliquez sur l’action pour pouvoir la modifier et lui
              ajouter une catégorie.
            </p>
          </FailureAlert>
        )}

        {plusieursBeneficiairesSelectionnes && (
          <FailureAlert label='Qualification impossible.'>
            <p>
              Vous ne pouvez pas qualifier les actions de plusieurs
              bénéficiaires. Sélectionnez seulement un ou une bénéficiaire.
            </p>
          </FailureAlert>
        )}
      </div>

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
        <Table
          caption={{ text: 'Liste des actions à qualifier' }}
          ref={listeActionsRef}
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
              <TH estCliquable={true}>
                <button
                  className='flex border-none items-center w-full h-full p-4'
                  onClick={inverserTriBeneficiaires}
                  aria-label={`Afficher la liste des actions triées par bénéficiaire par ordre alphabétique${
                    tri === 'BENEFICIAIRE_ALPHABETIQUE' ? ' inversé' : ''
                  }`}
                  title={`Afficher la liste des actions triées par bénéficiaire par ordre alphabétique${
                    tri === 'BENEFICIAIRE_ALPHABETIQUE' ? ' inversé' : ''
                  }`}
                  type='button'
                >
                  Bénéficiaire
                  <SortIcon
                    isSorted={
                      tri === 'BENEFICIAIRE_ALPHABETIQUE' ||
                      tri === 'BENEFICIAIRE_INVERSE'
                    }
                    isDesc={tri === 'BENEFICIAIRE_INVERSE'}
                  />
                </button>
              </TH>
              <TH>Titre de l’action</TH>
              <TH estCliquable={true}>
                <FiltresCategories
                  ref={filtresRef}
                  categories={categories}
                  defaultValue={categoriesValidees}
                  entites='actions'
                  onFiltres={filtrerActionsParCategorie}
                />
              </TH>
              <TH estCliquable={true}>
                <button
                  className='flex border-none items-center w-full h-full p-4'
                  onClick={inverserTriDateRealisation}
                  aria-label={`Afficher la liste des actions triées par date de réalisation ${
                    tri === 'REALISATION_ANTICHRONOLOGIQUE'
                      ? 'croissante'
                      : 'décroissante'
                  }`}
                  title={`Afficher la liste des actions triées par date de réalisation ${
                    tri === 'REALISATION_ANTICHRONOLOGIQUE'
                      ? 'croissante'
                      : 'décroissante'
                  }`}
                  type='button'
                >
                  Date de réalisation
                  <SortIcon
                    isSorted={
                      tri === 'REALISATION_CHRONOLOGIQUE' ||
                      tri === 'REALISATION_ANTICHRONOLOGIQUE'
                    }
                    isDesc={tri === 'REALISATION_ANTICHRONOLOGIQUE'}
                  />
                </button>
              </TH>
              <TH>Voir le détail</TH>
            </TR>
          </thead>

          <tbody>
            {actionsFiltrees.map((action: ActionPilotage) => (
              <ActionRowPilotage
                action={action}
                key={action.id}
                isChecked={selectionContientId(action.id)}
                onSelection={selectionnerAction}
              />
            ))}
          </tbody>
        </Table>
      )}
    </>
  )
}
