import { Jeune } from 'interfaces/jeune'
import React from 'react'
import { formatDayDate } from 'utils/date'
import EmailIcon from '../../assets/icons/email.svg'
import Button, { ButtonStyle } from '../ui/Button'

interface DetailsJeuneProps {
  jeune: Jeune
  withButtons?: boolean
  titlePrefix?: string
}

export const DetailsJeune = ({
  jeune,
  titlePrefix,
  withButtons = true,
}: DetailsJeuneProps) => {
  return (
    <>
      <div className='flex'>
        <h1 className='h2-semi text-bleu_nuit mb-3'>
          {titlePrefix ? `${titlePrefix} ` : ''}
          {jeune.firstName} {jeune.lastName}
        </h1>

        {!jeune.isActivated && withButtons && (
          <Button
            href={`/mes-jeunes/${jeune.id}/suppression`}
            style={ButtonStyle.WARNING}
            className='ml-8'
          >
            Supprimer ce jeune
          </Button>
        )}
      </div>

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
