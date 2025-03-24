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
    <p className='flex items-center'>
      <IconComponent
        name={IconName.PeopleFill}
        focusable={false}
        role='img'
        aria-labelledby={`icon-beneficiaire-list-item-${id}`}
        className='w-6 h-6 fill-primary mr-2'
        title={infoLabel}
      />
      <span id={`icon-beneficiaire-list-item-${id}`} className='sr-only'>
        {infoLabel}
      </span>
      {value}
    </p>
  )
}

export function BeneficiaireIndicationPortefeuille({
  value,
  id,
}: BeneficiaireIndicationProps) {
  const infoLabel = 'Ce bénéficiaire n’est pas dans votre portefeuille'
  return (
    <p className='flex items-center text-base-bold text-accent-3'>
      <IconComponent
        name={IconName.Info}
        focusable={false}
        role='img'
        aria-labelledby={`icon-indication-portefeuille-${id}`}
        className='w-6 h-6 fill-accent-3 mr-2'
        title={infoLabel}
      />
      <span id={`icon-indication-portefeuille-${id}`} className='sr-only'>
        {infoLabel}
      </span>
      {value}
    </p>
  )
}

export function BeneficiaireIndicationPresent({
  value,
  id,
}: BeneficiaireIndicationProps) {
  const infoLabel = 'Ce bénéficiaire était présent à l’événement'
  return (
    <p className='flex items-center text-base-bold text-success'>
      <IconComponent
        name={IconName.Check}
        role='img'
        aria-labelledby={`icon-indication-present-${id}`}
        focusable={false}
        className='w-6 h-6 fill-success mr-2'
        title={infoLabel}
      />
      <span id={`icon-indication-present-${id}`} className='sr-only'>
        {infoLabel}
      </span>
      {value}
    </p>
  )
}

export function BeneficiaireIndicationReaffectaction({
  value,
  id,
}: BeneficiaireIndicationProps) {
  const infoLabel =
    'Ce bénéficiaire a été réaffecté temporairement à un autre conseiller'
  return (
    <p className='flex items-center text-base-bold text-accent-3'>
      <IconComponent
        name={IconName.Info}
        focusable={false}
        role='img'
        aria-labelledby={`icon-indication-reaffectation-${id}`}
        className='w-6 h-6 fill-accent-3 mr-2'
        title={infoLabel}
      />
      <span id={`icon-indication-reaffectation-${id}`} className='sr-only'>
        {infoLabel}
      </span>
      {value}
    </p>
  )
}
