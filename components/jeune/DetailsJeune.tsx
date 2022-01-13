import { Jeune } from 'interfaces/jeune'
import React from 'react'
import useMatomo from 'utils/analytics/useMatomo'
import { formatDayDate } from 'utils/date'
import EmailIcon from '../../assets/icons/email.svg'

interface DetailsJeuneProps {
  jeune: Jeune
}

export const DetailsJeune = ({ jeune }: DetailsJeuneProps) => {
  useMatomo(jeune.isActivated ? undefined : 'Détail jeune - Non Activé')

  return (
    <>
      <div className='flex justify-between pb-6'>
        <h1 className='h2-semi text-bleu_nuit'>
          {jeune.firstName} {jeune.lastName}
        </h1>

        {!jeune.isActivated && (
          <span className='bg-gris_blanc py-4 px-7 rounded-medium'>
            <p className='text-sm-medium text-bleu_nuit'>
              Profil en cours d&apos;activation
            </p>
          </span>
        )}
      </div>

      <dl className='flex text-sm-semi text-bleu_nuit mb-2'>
        <dt className='mr-2'>Identifiant :</dt>
        <dd>{jeune.id}</dd>
      </dl>

      <dl className='flex text-sm-semi text-bleu_nuit mb-2'>
        <dt className='mr-2'>Ajouté le :</dt>
        <dd>{formatDayDate(new Date(jeune.creationDate))}</dd>
      </dl>

      {jeune.email && (
        <dl className='flex text-sm-semi text-bleu_nuit'>
          <dt className='mr-2'>
            <EmailIcon focusable='false' role='img' title='e-mail' />
          </dt>
          <dd>{jeune.email}</dd>
        </dl>
      )}
    </>
  )
}
