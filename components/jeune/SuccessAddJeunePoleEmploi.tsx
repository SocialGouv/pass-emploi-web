import CheckSuccessIcon from '../../assets/icons/check_success.svg'

import ButtonLink from 'components/ui/ButtonLink'
import useMatomo from 'utils/analytics/useMatomo'

interface SuccessAddJeunePoleEmploiProps {
  idJeune: string
}

export const SuccessAddJeunePoleEmploi = ({
  idJeune,
}: SuccessAddJeunePoleEmploiProps) => {
  useMatomo('Création jeune Pole Emploi – Compte créé')

  return (
    <div className='flex flex-col items-center mt-11 p-6 p-12 border border-primary_lighten rounded-large text-center'>
      <CheckSuccessIcon
        role='img'
        focusable='false'
        aria-label='Compte jeune créé avec succès'
      />
      <div className='mt-12 mb-10'>
        <h2 className='text-base-medium text-primary_darken mb-4'>
          Le compte jeune a été créé avec succès.
        </h2>
        <p className='text-sm-medium'>
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
