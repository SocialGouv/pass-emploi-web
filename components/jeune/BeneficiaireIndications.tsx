import IconComponent, { IconName } from 'components/ui/IconComponent'

type BeneficiaireIndicationProps = {
  value: string
  id: string
}

export function BeneficiaireListeItem({
  value,
  id,
}: BeneficiaireIndicationProps) {
  const infoLabel = 'Liste de diffusion'
  return (
    <div className='flex items-center'>
      <IconComponent
        name={IconName.PeopleFill}
        focusable={false}
        role='img'
        aria-describedby={`icon-beneficiaire-list-item-${id}`}
        className='w-6 h-6 fill-primary mr-2'
        title={infoLabel}
      />
      <span id={`icon-beneficiaire-list-item-${id}`} className='sr-only'>
        {infoLabel}
      </span>
      {value}
    </div>
  )
}

export function BeneficiaireIndicationPortefeuille({
  value,
  id,
}: BeneficiaireIndicationProps) {
  const infoLabel = 'Ce bénéficiaire n’est pas dans votre portefeuille'
  return (
    <div className='flex items-center text-base-bold text-accent_3'>
      <IconComponent
        name={IconName.Info}
        focusable={false}
        role='img'
        aria-labelledby={`icon-indication-portefeuille-${id}`}
        className='w-6 h-6 fill-accent_3 mr-2'
        title={infoLabel}
      />
      <span id={`icon-indication-portefeuille-${id}`} className='sr-only'>
        {infoLabel}
      </span>
      {value}
    </div>
  )
}

export function BeneficiaireIndicationPresent({
  value,
  id,
}: BeneficiaireIndicationProps) {
  const infoLabel = 'Ce bénéficiaire était présent à l’événement'
  return (
    <div className='flex items-center text-base-bold text-success'>
      <IconComponent
        name={IconName.Check}
        role='img'
        aria-describedby={`icon-indication-present-${id}`}
        focusable={false}
        className='w-6 h-6 fill-success mr-2'
        title={infoLabel}
      />
      <span id={`icon-indication-present-${id}`} className='sr-only'>
        {infoLabel}
      </span>
      {value}
    </div>
  )
}

export function BeneficiaireIndicationReaffectaction({
  value,
  id,
}: BeneficiaireIndicationProps) {
  const infoLabel =
    'Ce bénéficiaire a été réaffecté temporairement à un autre conseiller'
  return (
    <div className='flex items-center text-base-bold text-accent_3'>
      <IconComponent
        name={IconName.Info}
        focusable={false}
        role='img'
        aria-describedby={`icon-indication-reaffectation-${id}`}
        className='w-6 h-6 fill-accent_3 mr-2'
        title={infoLabel}
      />
      <span id={`icon-indication-reaffectation-${id}`} className='sr-only'>
        {infoLabel}
      </span>
      {value}
    </div>
  )
}
