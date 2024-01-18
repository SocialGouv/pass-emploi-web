import React, { useEffect, useRef, useState } from 'react'

import ConfirmationMultiQualificationModal from 'components/ConfirmationMultiQualificationModal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { TagCategorieAction } from 'components/ui/Indicateurs/Tag'
import SortIcon from 'components/ui/SortIcon'
import Table from 'components/ui/Table/Table'
import { TBody } from 'components/ui/Table/TBody'
import TD from 'components/ui/Table/TD'
import { TH } from 'components/ui/Table/TH'
import { THead } from 'components/ui/Table/THead'
import TR from 'components/ui/Table/TR'
import { ActionPilotage } from 'interfaces/action'
import { BaseJeune } from 'interfaces/jeune'
import { TriActionsAQualifier } from 'services/actions.service'

type TableauActionsConseillerProps = {
  actions: Array<ActionPilotage>
  tri: TriActionsAQualifier | undefined
  onTriActions: (tri: TriActionsAQualifier) => void
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
  actions,
  tri,
  onTriActions,
  onLienExterne,
  onQualification,
}: TableauActionsConseillerProps) {
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
  const [actionSansCategorieSelectionnee, setActionSansCategorieSelectionnee] =
    useState<boolean>(false)
  const [
    plusieursBeneficiairesSelectionnes,
    setPlusieursBeneficiairesSelectionnes,
  ] = useState<boolean>(false)

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
        actions.map(({ id, categorie }) => {
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

  function inverserTriBeneficiaires() {
    const nouvelOrdre = tri === 'ALPHABETIQUE' ? 'INVERSE' : 'ALPHABETIQUE'
    onTriActions(nouvelOrdre)
    setActionsSelectionnees([])
  }

  function selectionContientId(id: string) {
    return actionsSelectionnees.some((action) => action.idAction === id)
  }

  function recupererNombreBeneficiairesSelectionnes(): Set<BaseJeune> {
    return new Set(
      actionsSelectionnees.map(
        ({ idAction }) =>
          actions.find(({ id }) => idAction === id)!.beneficiaire
      )
    )
  }

  async function qualifier() {
    await onQualification(
      true,
      actionsSelectionnees as Array<{
        idAction: string
        codeQualification: string
      }>
    )
    setAfficherModaleMultiQualification(false)
    setActionsSelectionnees([])
  }

  useEffect(() => {
    setActionSansCategorieSelectionnee(
      actionsSelectionnees.some((action) => !action.codeQualification)
    )

    const beneficiairesSelectionnes = recupererNombreBeneficiairesSelectionnes()
    setBeneficiaireSelectionne(beneficiairesSelectionnes.values().next().value)
    setPlusieursBeneficiairesSelectionnes(beneficiairesSelectionnes.size > 1)
  }, [actionsSelectionnees])

  useEffect(() => {
    const tailleSelection = actionsSelectionnees.length
    const toutSelectionnerCheckbox = toutSelectionnerCheckboxRef.current!
    const isChecked = tailleSelection === actions.length
    const isIndeterminate =
      tailleSelection !== actions.length && tailleSelection > 0

    toutSelectionnerCheckbox.checked = isChecked
    toutSelectionnerCheckbox.indeterminate = isIndeterminate

    if (isChecked) toutSelectionnerCheckbox.ariaChecked = 'true'
    else if (isIndeterminate) toutSelectionnerCheckbox.ariaChecked = 'mixed'
    else toutSelectionnerCheckbox.ariaChecked = 'false'
  }, [actions.length, actionsSelectionnees.length])

  return (
    <>
      <div className='flex items-center bg-primary_lighten rounded-base p-4 justify-between'>
        <p>
          {actionsSelectionnees.length === 0 &&
            'Sélectionnez au moins un élément ci-dessous pour commencer à qualifier'}
          {actionsSelectionnees.length === 1 &&
            '1 action sélectionnée. S’agit-il de SNP ou de non SNP ?'}
          {actionsSelectionnees.length > 1 &&
            `${actionsSelectionnees.length} actions sélectionnées. S’agit-il de SNP ou de non SNP ?`}
        </p>
        <Button
          onClick={() => setAfficherModaleMultiQualification(true)}
          style={ButtonStyle.PRIMARY}
          label='Qualifier les actions en SNP'
          disabled={
            actionsSelectionnees.length === 0 ||
            actionSansCategorieSelectionnee ||
            plusieursBeneficiairesSelectionnes
          }
        >
          Qualifier les actions en SNP
        </Button>
      </div>

      {actions.length > 0 && (
        <Table asDiv={true} caption={{ text: 'Liste des actions à qualifier' }}>
          <THead>
            <TR isHeader={true}>
              <TH estCliquable={true}>
                <input
                  id='qualification-tout-selectionner'
                  type='checkbox'
                  title='Tout sélectionner'
                  onChange={selectionnerToutesLesActions}
                  className='flex items-center w-full'
                  aria-label='Tout sélectionner'
                  ref={toutSelectionnerCheckboxRef}
                />
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
              <TH>Catégorie</TH>
              <TH>Date de réalisation</TH>
            </TR>
          </THead>

          <TBody>
            {actions.map((action: ActionPilotage) => (
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
                    className='w-4 h-4'
                    aria-label={`Sélection ${action.titre} ${
                      action.categorie?.libelle ?? ''
                    }`}
                    onClick={(e) => {
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
          onConfirmation={qualifier}
          onCancel={() => setAfficherModaleMultiQualification(false)}
          onLienExterne={onLienExterne}
        />
      )}
    </>
  )
}
