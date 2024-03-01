import React, { useEffect, useRef, useState } from 'react'

import ActionRowPilotage from 'components/action/ActionRowPilotage'
import EncartQualificationActions from 'components/action/EncartQualificationActions'
import FiltresCategoriesActions from 'components/action/FiltresCategoriesActions'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import IllustrationComponent, {
  IllustrationName,
} from 'components/ui/IllustrationComponent'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import SortIcon from 'components/ui/SortIcon'
import Table from 'components/ui/Table/Table'
import { TBody } from 'components/ui/Table/TBody'
import { TH } from 'components/ui/Table/TH'
import { THead } from 'components/ui/Table/THead'
import TR from 'components/ui/Table/TR'
import {
  ActionAQualifier,
  ActionPilotage,
  SituationNonProfessionnelle,
} from 'interfaces/action'
import { BaseJeune } from 'interfaces/jeune'
import { TriActionsAQualifier } from 'services/actions.service'

type TableauActionsConseillerProps = {
  categories: SituationNonProfessionnelle[]
  actionsFiltrees: ActionPilotage[]
  tri: TriActionsAQualifier | undefined
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
  const [categoriesValidees, setCategoriesValidees] = useState<string[]>([])

  const toutSelectionnerCheckboxRef = useRef<HTMLInputElement | null>(null)
  const [actionsSelectionnees, setActionsSelectionnees] = useState<
    ActionAQualifier[]
  >([])
  const [beneficiaireSelectionne, setBeneficiaireSelectionne] =
    useState<BaseJeune>()

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
    const nouvelOrdre = tri === 'ALPHABETIQUE' ? 'INVERSE' : 'ALPHABETIQUE'
    onTri(nouvelOrdre)
    setActionsSelectionnees([])
  }

  function filtrerActionsParCategorie(categoriesSelectionnees: string[]) {
    setCategoriesValidees(categoriesSelectionnees)
    onFiltres(categoriesSelectionnees)
  }

  function reinitialiserFiltres() {
    onFiltres([])
    setCategoriesValidees([])
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

  function recupererBeneficiairesSelectionnes(): Map<string, BaseJeune> {
    const mapBeneficiaires = new Map<string, BaseJeune>()
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
          <FailureAlert
            label='Qualification impossible.'
            sub={
              <p>
                Vous ne pouvez pas qualifier une ou plusieurs actions sans
                catégorie. Cliquez sur l’action pour pouvoir la modifier et lui
                ajouter une catégorie.
              </p>
            }
          />
        )}

        {plusieursBeneficiairesSelectionnes && (
          <FailureAlert
            label='Qualification impossible.'
            sub={
              <p>
                Vous ne pouvez pas qualifier les actions de plusieurs
                bénéficiaires. Sélectionnez seulement un ou une bénéficiaire.
              </p>
            }
          />
        )}
      </div>

      {actionsFiltrees.length === 0 && (
        <div className='flex flex-col justify-center'>
          <IllustrationComponent
            name={IllustrationName.Search}
            focusable={false}
            aria-hidden={true}
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
        <Table asDiv={true} caption={{ text: 'Liste des actions à qualifier' }}>
          <THead>
            <TR isHeader={true}>
              <TH estCliquable={true}>
                <div className='flex justify-center w-full h-full p-4'>
                  <input
                    id='qualification-tout-selectionner'
                    type='checkbox'
                    title='Tout sélectionner'
                    onChange={selectionnerToutesLesActions}
                    className='justify-self-center cursor-pointer w-4 h-4 p-4'
                    aria-label='Tout sélectionner'
                    ref={toutSelectionnerCheckboxRef}
                  />
                </div>
              </TH>
              <TH estCliquable={true}>
                <button
                  className='flex border-none items-center w-full h-full p-4'
                  onClick={inverserTriBeneficiaires}
                  aria-label={`Afficher la liste des bénéficiaires triée par noms de famille par ordre alphabétique ${
                    tri === 'ALPHABETIQUE' ? 'inversé' : ''
                  }`}
                  title={`Afficher la liste des bénéficiaires triée par noms de famille par ordre alphabétique ${
                    tri === 'ALPHABETIQUE' ? 'inversé' : ''
                  }`}
                >
                  Bénéficiaire
                  <SortIcon
                    isSorted={tri !== undefined}
                    isDesc={tri === 'INVERSE'}
                  />
                </button>
              </TH>
              <TH>Titre de l’action</TH>
              <TH estCliquable={true}>
                <FiltresCategoriesActions
                  categories={categories}
                  defaultValue={categoriesValidees}
                  onFiltres={filtrerActionsParCategorie}
                />
              </TH>
              <TH>Date de réalisation</TH>
            </TR>
          </THead>

          <TBody>
            {actionsFiltrees.map((action: ActionPilotage) => (
              <ActionRowPilotage
                action={action}
                key={action.id}
                isChecked={selectionContientId(action.id)}
                onSelection={selectionnerAction}
              />
            ))}
          </TBody>
        </Table>
      )}
    </>
  )
}
