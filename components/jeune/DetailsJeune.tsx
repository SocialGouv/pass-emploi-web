import React from 'react'

import EmailIcon from '../../assets/icons/email.svg'
import LaunchIcon from '../../assets/icons/launch.svg'

import SituationTag from './SituationTag'

import { Jeune, SituationJeune } from 'interfaces/jeune'
import { formatDayDate } from 'utils/date'

interface DetailsJeuneProps {
  jeune: Jeune
  withSituations?: boolean
  onDossierMiloClick: () => void
}

export const DetailsJeune = ({
  jeune,
  withSituations,
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

      {withSituations && (
        <div className='border border-solid rounded-medium w-full p-3 mt-2 border-grey_100'>
          <h2 className='text-base-medium'>Situation</h2>
          {!(jeune.situations && jeune.situations.length) && (
            <ol className='list-none'>
              <li className='mt-3'>
                <div className='mb-3'>
                  <SituationTag situation={SituationJeune.SANS_SITUATION} />
                </div>
                <div className='mb-3'>
                  Etat : <span className='text-base-medium'>--</span>
                </div>
                <div>
                  Fin le : <span className='text-base-medium'>--</span>
                </div>
              </li>
            </ol>
          )}

          {jeune.situations && Boolean(jeune.situations.length) && (
            <ol className='list-none flex flex-row flex-wrap'>
              {jeune.situations.map((situation) => (
                <>
                  <li className='mt-3 mr-32 last:mr-0'>
                    <div className='mb-3'>
                      <SituationTag situation={situation.categorie} />
                    </div>
                    <div className='mb-3'>
                      Etat :{' '}
                      <span className='text-base-medium'>{situation.etat}</span>
                    </div>
                    <div className=''>
                      Fin le :{' '}
                      <span className='text-base-medium'>
                        {situation.dateFin ?? '--'}
                      </span>
                    </div>
                  </li>
                </>
              ))}
            </ol>
          )}
        </div>
      )}
    </>
  )
}
