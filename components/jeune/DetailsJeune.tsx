import React from 'react'

import EmailIcon from '../../assets/icons/email.svg'

import { Jeune } from 'interfaces/jeune'
import { formatDayDate } from 'utils/date'

interface DetailsJeuneProps {
  jeune: Jeune
}

export const DetailsJeune = ({ jeune }: DetailsJeuneProps) => {
  return (
    <>
      <dl className='flex text-sm-semi mb-2'>
        <dt className='mr-2'>Ajouté le :</dt>
        <dd>{formatDayDate(new Date(jeune.creationDate))}</dd>
      </dl>

      {jeune.email && (
        <dl className='flex text-sm-semi'>
          <dt className='mr-2'>
            <EmailIcon focusable='false' role='img' title='e-mail' />
          </dt>
          <dd>{jeune.email}</dd>
        </dl>
      )}

      {!jeune.isActivated && (
        <p className='mt-4 bg-warning_lighten py-4 px-7 rounded-medium max-w-md text-center'>
          <span className='text-sm-semi text-warning'>
            Ce jeune ne s&apos;est pas encore connect&eacute; &agrave;
            l&apos;application.
          </span>
        </p>
      )}
    </>
  )
}
