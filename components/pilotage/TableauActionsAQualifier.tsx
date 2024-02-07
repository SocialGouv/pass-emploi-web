import React, { useEffect, useRef, useState } from 'react'

import EmptyStateImage from 'assets/images/illustration-search-grey.svg'
import FiltresCategoriesActions from 'components/action/FiltresCategoriesActions'
import ConfirmationMultiQualificationModal from 'components/ConfirmationMultiQualificationModal'
import ConfirmationMultiQualificationModalSNP from 'components/ConfirmationMultiQualificationModalNonSNP'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { TagCategorieAction } from 'components/ui/Indicateurs/Tag'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import SortIcon from 'components/ui/SortIcon'
import Table from 'components/ui/Table/Table'
import { TBody } from 'components/ui/Table/TBody'
import TD from 'components/ui/Table/TD'
import { TH } from 'components/ui/Table/TH'
import { THead } from 'components/ui/Table/THead'
import TR from 'components/ui/Table/TR'
import { ActionPilotage, SituationNonProfessionnelle } from 'interfaces/action'
import { BaseJeune } from 'interfaces/jeune'
import { TriActionsAQualifier } from 'services/actions.service'

type TableauActionsConseillerProps = {
  categories: SituationNonProfessionnelle[]
  actionsFilrees: ActionPilotage[]
  tri: TriActionsAQualifier | undefined
  onTri: (tri: TriActionsAQualifier) => void
  onFiltres: (categories: string[]) => void
  onLienExterne: (label: string) => void
  onQualification: (
    qualificationSNP: boolean,
    actionsSelectionnees: Array<{ idAction: string; codeQualification: string }>
  ) => Promise<void>
}

type ActionAQualifier = {
  idAction: string
  codeQualification?: string
}

export default function TableauActionsAQualifier({
  categories,
  actionsFilrees,
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

  const [
    afficherModaleMultiQualification,
    setAfficherModaleMultiQualification,
  ] = useState<boolean>(false)
  const [
    afficherModaleMultiQualificationNonSNP,
    setAfficherModaleMultiQualificationNonSNP,
  ] = useState<boolean>(false)
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
        actionsFilrees.map(({ id, categorie }) => {
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
      const { beneficiaire } = actionsFilrees.find(({ id }) => idAction === id)!
      mapBeneficiaires.set(beneficiaire.id, beneficiaire)
    })
    return mapBeneficiaires
  }

  async function qualifier(enSNP: boolean) {
    await onQualification(
      enSNP,
      actionsSelectionnees as Array<{
        idAction: string
        codeQualification: string
      }>
    )
  }

  useEffect(() => {
    setActionsSelectionnees([])
  }, [actionsFilrees])

  useEffect(() => {
    setActionSansCategorieSelectionnee(
      actionsSelectionnees.some((action) => !action.codeQualification)
    )

    const beneficiairesSelectionnes = recupererBeneficiairesSelectionnes()
    setBeneficiaireSelectionne(beneficiairesSelectionnes.values().next().value)
    setPlusieursBeneficiairesSelectionnes(beneficiairesSelectionnes.size > 1)
  }, [actionsSelectionnees])

  useEffect(() => {
    if (!actionsFilrees.length) return

    const tailleSelection = actionsSelectionnees.length
    const toutSelectionnerCheckbox = toutSelectionnerCheckboxRef.current!
    const isChecked = tailleSelection === actionsFilrees.length
    const isIndeterminate =
      tailleSelection !== actionsFilrees.length && tailleSelection > 0

    toutSelectionnerCheckbox.checked = isChecked
    toutSelectionnerCheckbox.indeterminate = isIndeterminate

    if (isChecked) toutSelectionnerCheckbox.ariaChecked = 'true'
    else if (isIndeterminate) toutSelectionnerCheckbox.ariaChecked = 'mixed'
    else toutSelectionnerCheckbox.ariaChecked = 'false'
  }, [actionsFilrees.length, actionsSelectionnees.length])

  return (
    <>
      <div className='flex items-center bg-primary_lighten rounded-base p-4 justify-between'>
        <p className='whitespace-pre-wrap'>
          {actionsSelectionnees.length === 0 &&
            'Sélectionnez au moins un élément ci-dessous \npour commencer à qualifier'}
          {actionsSelectionnees.length === 1 &&
            '1 action sélectionnée. \nS’agit-il de SNP ou de non SNP ?'}
          {actionsSelectionnees.length > 1 &&
            `${actionsSelectionnees.length} actions sélectionnées. \nS’agit-il de SNP ou de non SNP ?`}
        </p>
        <div className='flex gap-2'>
          <Button
            onClick={() => setAfficherModaleMultiQualificationNonSNP(true)}
            style={ButtonStyle.SECONDARY}
            label='Enregistrer les actions en non SNP'
            disabled={boutonsDisabled}
          >
            Enregistrer les actions en non SNP
          </Button>
          <Button
            onClick={() => setAfficherModaleMultiQualification(true)}
            style={ButtonStyle.PRIMARY}
            label='Qualifier les actions en SNP'
            disabled={boutonsDisabled}
          >
            Qualifier les actions en SNP
          </Button>
        </div>
      </div>

      <div className='mt-4'>
        {actionSansCategorieSelectionnee && (
          <FailureAlert
            label='Qualification impossible.'
            sub='Vous ne pouvez pas qualifier une ou plusieurs actions sans catégorie. Cliquez sur l’action pour pouvoir la modifier et lui ajouter une catégorie.'
          />
        )}

        {plusieursBeneficiairesSelectionnes && (
          <FailureAlert
            label='Qualification impossible.'
            sub='Vous ne pouvez pas qualifier les actions de plusieurs bénéficiaires. Sélectionnez seulement un ou une bénéficiaire.'
          />
        )}
      </div>

      {actionsFilrees.length === 0 && (
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

      {actionsFilrees.length > 0 && (
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
            {actionsFilrees.map((action: ActionPilotage) => (
              <TR
                key={action.id}
                href={`/mes-jeunes/${action.beneficiaire.id}/actions/${action.id}`}
                label={`Accéder au détail de l’action : ${action.titre}`}
                isSelected={selectionContientId(action.id)}
              >
                <TD
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    selectionnerAction(action)
                  }}
                >
                  <input
                    id={`selectionner-${action.id}`}
                    type='checkbox'
                    checked={selectionContientId(action.id)}
                    title={`${
                      selectionContientId(action.id)
                        ? 'Désélectionner'
                        : 'Sélectionner'
                    } ${action.titre}`}
                    className='w-4 h-4 cursor-pointer'
                    aria-label={`Sélection ${action.titre} ${
                      action.categorie?.libelle ?? ''
                    }`}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onChange={() => selectionnerAction(action)}
                  />
                </TD>
                <TD isBold={selectionContientId(action.id)}>
                  {action.beneficiaire.nom} {action.beneficiaire.prenom}
                </TD>
                <TD isBold>{action.titre}</TD>
                <TD>
                  <TagCategorieAction categorie={action.categorie?.libelle} />
                </TD>
                <TD>
                  <span className='flex flex-row justify-between'>
                    {action.dateFinReelle}
                    <IconComponent
                      name={IconName.ChevronRight}
                      focusable={false}
                      aria-hidden={true}
                      className='w-6 h-6 fill-primary'
                    />
                  </span>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}

      {afficherModaleMultiQualification && (
        <ConfirmationMultiQualificationModal
          actions={actionsSelectionnees}
          beneficiaire={beneficiaireSelectionne!}
          onConfirmation={() => qualifier(true)}
          onCancel={() => setAfficherModaleMultiQualification(false)}
          onLienExterne={onLienExterne}
        />
      )}

      {afficherModaleMultiQualificationNonSNP && (
        <ConfirmationMultiQualificationModalSNP
          actions={actionsSelectionnees}
          beneficiaire={beneficiaireSelectionne!}
          onConfirmation={() => qualifier(false)}
          onCancel={() => setAfficherModaleMultiQualificationNonSNP(false)}
        />
      )}
    </>
  )
}
