import Link from 'next/link'
import useMatomo from 'utils/analytics/useMatomo'
import CheckSuccessIcon from '../../assets/icons/check_success.svg'
import linkStyle from 'styles/components/Link.module.css'

interface SuccessAddJeuneMiloProps {
  idJeune: string
}

export const SuccessAddJeuneMilo = ({ idJeune }: SuccessAddJeuneMiloProps) => {
  useMatomo('Création jeune SIMILO – Etape 3 - Compte créé')

  return (
    <div className='flex flex-col items-center mt-11 p-6 p-12 border border-bleu_blanc rounded-large text-center'>
      <CheckSuccessIcon
        role='img'
        focusable='false'
        aria-label='Compte jeune créé avec succès'
      />
      <div className='mt-12 mb-10'>
        <h2 className='text-base-medium text-bleu_nuit mb-4'>
          Le compte jeune a été créé avec succès.
        </h2>
        <p className='text-sm-medium'>
          Vous pouvez désormais le retrouver dans l&apos;onglet &quot;Mes
          jeunes&quot;
        </p>
      </div>
      <Link href={`/mes-jeunes/${idJeune}`} passHref>
        <a className={linkStyle.linkButtonBlue}>Accéder à la fiche du jeune</a>
      </Link>
    </div>
  )
}
