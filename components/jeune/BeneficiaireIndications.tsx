import IconComponent, { IconName } from 'components/ui/IconComponent'

type BeneficiaireIndicationProps = {
  value: string
}

export function BeneficiaireListeItem({ value }: BeneficiaireIndicationProps) {
  const infoLabel = 'Liste de diffusion'
  return (
    <div className='flex items-center'>
      <IconComponent
        name={IconName.PeopleFill}
        focusable={false}
        aria-label={infoLabel}
        className='w-6 h-6 fill-primary mr-2'
        title={infoLabel}
      />
      {value}
    </div>
  )
}

export function BeneficiaireIndicationPortefeuille({
  value,
}: BeneficiaireIndicationProps) {
  const infoLabel = 'Ce bénéficiaire n’est pas dans votre portefeuille'
  return (
    <div className='flex items-center text-base-bold text-accent_3'>
      <IconComponent
        name={IconName.Info}
        aria-hidden={true}
        focusable={false}
        className='w-6 h-6 fill-accent_3 mr-2'
        title={infoLabel}
      />
      <span className='sr-only'>{infoLabel}</span>
      {value}
    </div>
  )
}

export function BeneficiaireIndicationPresent({
  value,
}: BeneficiaireIndicationProps) {
  const infoLabel = 'Ce bénéficiaire était présent à l’événement'
  return (
    <div className='flex items-center text-base-bold text-success'>
      <IconComponent
        name={IconName.Check}
        aria-hidden={true}
        focusable={false}
        className='w-6 h-6 fill-success mr-2'
        title={infoLabel}
      />
      <span className='sr-only'>{infoLabel}</span>
      {value}
    </div>
  )
}

export function BeneficiaireIndicationReaffectaction({
  value,
}: BeneficiaireIndicationProps) {
  const infoLabel =
    'Ce bénéficiaire a été réaffecté temporairement à un autre conseiller'
  return (
    <div className='flex items-center text-base-bold text-accent_3'>
      <IconComponent
        name={IconName.Info}
        focusable={false}
        aria-label={infoLabel}
        className='w-6 h-6 fill-accent_3 mr-2'
        title={infoLabel}
      />
      {value}
    </div>
  )
}
