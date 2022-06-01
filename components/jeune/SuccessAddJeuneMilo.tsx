import ButtonLink from 'components/ui/ButtonLink'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import useMatomo from 'utils/analytics/useMatomo'

interface SuccessAddJeuneMiloProps {
  idJeune: string
}

export default function SuccessAddJeuneMilo({
  idJeune,
}: SuccessAddJeuneMiloProps) {
  useMatomo('Création jeune SIMILO – Etape 3 - Compte créé')

  return (
    <div className='flex flex-col items-center mt-11 p-6 p-12 border border-primary_lighten rounded-large text-center'>
      <IconComponent
        name={IconName.CheckSuccess}
        role='img'
        focusable='false'
        aria-label='Compte jeune créé avec succès'
        className='w-20 h-20'
      />
      <div className='mt-12 mb-10'>
        <h2 className='text-base-medium text-primary mb-4'>
          Le compte jeune a été créé avec succès.
        </h2>
        <p className='text-s-medium'>
          Vous pouvez désormais le retrouver dans l&apos;onglet &quot;Mes
          jeunes&quot;
        </p>
      </div>
      <ButtonLink href={`/mes-jeunes/${idJeune}`}>
        Accéder à la fiche du jeune
      </ButtonLink>
    </div>
  )
}
