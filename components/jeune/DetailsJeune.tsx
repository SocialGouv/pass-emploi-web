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

      <div className='border border-solid rounded-medium w-full px-4 py-3 mt-2 border-grey_100'>
        <h2 className='text-base-medium mb-2'>Situation</h2>
        {!(jeune.situations && jeune.situations.length) && (
          <ol className='list-none'>
            <>
              <li>Sans situation</li>
              <li>
                Etat : <span className='text-base-medium'>--</span>
              </li>
              <li>
                Fin le : <span className='text-base-medium'>--</span>
              </li>
            </>
          </ol>
        )}

        {jeune.situations?.length && (
          <>
            <ol className='list-none'>
              {jeune.situations.map((situation) => (
                <>
                  <li>{situation.categorie}</li>
                  <li className='ml-5'>
                    Etat :{' '}
                    <span className='text-base-medium'>{situation.etat}</span>
                  </li>
                  <li className='ml-5'>
                    Fin le :{' '}
                    <span className='text-base-medium'>
                      {situation.dateFin ?? '--'}
                    </span>
                  </li>
                </>
              ))}
            </ol>
          </>
        )}
      </div>
    </>
  )
}
