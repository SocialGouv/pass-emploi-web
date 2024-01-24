import Button, { ButtonStyle } from 'components/ui/Button/Button'

type EncartQualificationActionsProps = {
  boutonsDisabled: boolean
  nombreActionsSelectionnees: number
  onQualificationSNP: (afficherModale: boolean) => void
  onQualificationNonSNP: (afficherModale: boolean) => void
}

export default function EncartQualificationActions({
  boutonsDisabled,
  nombreActionsSelectionnees,
  onQualificationSNP,
  onQualificationNonSNP,
}: EncartQualificationActionsProps) {
  return (
    <div className='flex items-center bg-primary_lighten rounded-base p-4 justify-between'>
      <p className='whitespace-pre-wrap'>
        {nombreActionsSelectionnees === 0 &&
          'Sélectionnez au moins un élément ci-dessous \npour commencer à qualifier'}
        {nombreActionsSelectionnees === 1 &&
          '1 action sélectionnée. \nS’agit-il de SNP ou de non SNP ?'}
        {nombreActionsSelectionnees > 1 &&
          `${nombreActionsSelectionnees} actions sélectionnées. \nS’agit-il de SNP ou de non SNP ?`}
      </p>

      <div className='flex gap-2'>
        <Button
          onClick={() => onQualificationNonSNP(true)}
          style={ButtonStyle.SECONDARY}
          label='Enregistrer les actions en non SNP'
          disabled={boutonsDisabled}
        >
          Enregistrer les actions en non SNP
        </Button>
        <Button
          onClick={() => onQualificationSNP(true)}
          style={ButtonStyle.PRIMARY}
          label='Qualifier les actions en SNP'
          disabled={boutonsDisabled}
        >
          Qualifier les actions en SNP
        </Button>
      </div>
    </div>
  )
}
