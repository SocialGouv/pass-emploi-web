import React from 'react'

import EmailIcon from '../../assets/icons/email.svg'
import LaunchIcon from '../../assets/icons/launch.svg'

import { Jeune } from 'interfaces/jeune'
import { formatDayDate } from 'utils/date'

interface DetailsJeuneProps {
  jeune: Jeune
  onDossierMiloClick: () => void
}

export const DetailsJeune = ({
  jeune,
  onDossierMiloClick,
}: DetailsJeuneProps) => {
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

      {jeune.urlDossierMilo && (
        <dl className='mt-2 flex text-sm-semi items-center'>
          <dd>
            <a
              className='underline text-primary hover:text-primary_darken'
              href={jeune.urlDossierMilo}
              target='_blank'
              onClick={onDossierMiloClick}
              rel='noopener noreferrer'
            >
              Dossier jeune i-Milo
            </a>
          </dd>
          <dt className='ml-2'>
            <LaunchIcon focusable='false' role='img' title='ouvrir' />
          </dt>
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
