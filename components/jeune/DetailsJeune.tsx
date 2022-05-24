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
      <dl className='text-sm-semi'>
        <dt className='sr-only'>Ajouté le</dt>
        <dd aria-label={formatDayDate(new Date(jeune.creationDate))}>
          Ajouté le : {formatDayDate(new Date(jeune.creationDate))}
        </dd>
        {jeune.email && (
          <>
            <dt className='sr-only'>e-mail</dt>
            <dd className='flex items-center mt-2'>
              <EmailIcon
                aria-hidden={true}
                focusable='false'
                className='mr-2'
              />
              {jeune.email}
            </dd>
          </>
        )}
        {jeune.urlDossier && (
          <>
            <dt className='sr-only'>Dossier externe</dt>
            <dd className='mt-2'>
              <a
                className='underline text-primary hover:text-primary_darken flex items-center'
                href={jeune.urlDossier}
                target='_blank'
                onClick={onDossierMiloClick}
                rel='noopener noreferrer'
              >
                Dossier jeune i-Milo
                <LaunchIcon
                  focusable='false'
                  role='img'
                  title='ouvrir'
                  className='ml-2'
                />
              </a>
            </dd>
          </>
        )}
      </dl>

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
