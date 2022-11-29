import IconComponent, { IconName } from 'components/ui/IconComponent'

type BeneficiaireIndicateurProps = {
  value: string
}

export function BeneficiaireIndicateurPortefeuille({
  value,
}: BeneficiaireIndicateurProps) {
  const infoLabel = 'Ce bénéficiaire n’est pas dans votre portefeuille'
  return (
    <div className='flex items-center text-base-bold text-accent_3'>
      <div aria-label={infoLabel} className='mr-2'>
        <IconComponent
          name={IconName.Info}
          focusable={false}
          aria-hidden={true}
          className='w-6 h-6 fill-accent_3'
          title={infoLabel}
        />
      </div>
      {value}
    </div>
  )
}

export function BeneficiaireIndicateurPresent({
  value,
}: BeneficiaireIndicateurProps) {
  const infoLabel = 'Ce bénéficiaire était présent à l’événement'
  return (
    <div className='flex items-center text-base-bold text-success'>
      <div aria-label={infoLabel} className='mr-2'>
        <IconComponent
          name={IconName.Check}
          focusable={false}
          aria-hidden={true}
          className='w-6 h-6 fill-success'
          title={infoLabel}
        />
      </div>
      {value}
    </div>
  )
}
