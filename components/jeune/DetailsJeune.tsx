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
      <h1 className='h2-semi text-bleu_nuit'>
        {jeune.firstName} {jeune.lastName}
      </h1>

      {!jeune.isActivated && (
        <p className=' mb-3 mt-3 bg-warning_background py-4 px-7 rounded-medium max-w-md text-center'>
          <span className='text-sm-medium text-warning'>
            Ce jeune ne s&apos;est pas encore connect&eacute; &agrave;
            l&apos;application.
          </span>
        </p>
      )}

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
