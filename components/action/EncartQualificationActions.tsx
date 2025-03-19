import { useState } from 'react'

import ConfirmationMultiQualificationModal from 'components/ConfirmationMultiQualificationModal'
import ConfirmationMultiQualificationModalNonSNP from 'components/ConfirmationMultiQualificationModalNonSNP'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import { ActionAQualifier } from 'interfaces/action'
import { BaseBeneficiaire } from 'interfaces/beneficiaire'

type EncartQualificationActionsProps = {
  actionsSelectionnees: ActionAQualifier[]
  boutonsDisabled: boolean
  jeune?: BaseBeneficiaire
  nombreActionsSelectionnees: number
  onLienExterne: (label: string) => void
  onQualification: (
    qualificationSNP: boolean,
    actionsSelectionnees: Array<{ idAction: string; codeQualification: string }>
  ) => Promise<void>
}

export default function EncartQualificationActions({
  actionsSelectionnees,
  boutonsDisabled,
  jeune,
  nombreActionsSelectionnees,
  onLienExterne,
  onQualification,
}: EncartQualificationActionsProps) {
  const [
    afficherModaleMultiQualification,
    setAfficherModaleMultiQualification,
  ] = useState<boolean>(false)
  const [
    afficherModaleMultiQualificationNonSNP,
    setAfficherModaleMultiQualificationNonSNP,
  ] = useState<boolean>(false)

  async function qualifier(enSNP: boolean) {
    await onQualification(
      enSNP,
      actionsSelectionnees as Array<{
        idAction: string
        codeQualification: string
      }>
    )
  }

  return (
    <>
      <div className='flex items-center bg-primary-lighten rounded-base p-4 justify-between'>
        <p className='whitespace-pre-wrap'>
          {nombreActionsSelectionnees === 0 &&
            'Sélectionnez au moins un élément ci-dessous pour commencer à qualifier'}
          {nombreActionsSelectionnees === 1 &&
            '1 action sélectionnée. \nS’agit-il de SNP ou de non SNP ?'}
          {nombreActionsSelectionnees > 1 &&
            `${nombreActionsSelectionnees} actions sélectionnées. \nS’agit-il de SNP ou de non SNP ?`}
        </p>

        <div className='flex gap-2'>
          <Button
            onClick={() => setAfficherModaleMultiQualificationNonSNP(true)}
            style={ButtonStyle.SECONDARY}
            label='Enregistrer les actions en non SNP'
            disabled={boutonsDisabled}
            type='button'
          >
            Enregistrer les actions en non SNP
          </Button>
          <Button
            onClick={() => setAfficherModaleMultiQualification(true)}
            style={ButtonStyle.PRIMARY}
            label='Qualifier les actions en SNP'
            disabled={boutonsDisabled}
            type='button'
          >
            Qualifier les actions en SNP
          </Button>
        </div>
      </div>

      {afficherModaleMultiQualification && (
        <ConfirmationMultiQualificationModal
          actions={actionsSelectionnees}
          beneficiaire={jeune!}
          onConfirmation={() => qualifier(true)}
          onCancel={() => setAfficherModaleMultiQualification(false)}
          onLienExterne={onLienExterne}
        />
      )}

      {afficherModaleMultiQualificationNonSNP && (
        <ConfirmationMultiQualificationModalNonSNP
          actions={actionsSelectionnees}
          beneficiaire={jeune!}
          onConfirmation={() => qualifier(false)}
          onCancel={() => setAfficherModaleMultiQualificationNonSNP(false)}
        />
      )}
    </>
  )
}
