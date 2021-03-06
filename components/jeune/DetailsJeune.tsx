import React from 'react'

import SituationTag from 'components/jeune/SituationTag'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { CategorieSituation, DetailJeune } from 'interfaces/jeune'
import { formatDayDate, formatDayDateLongMonth } from 'utils/date'

interface DetailsJeuneProps {
  jeune: DetailJeune
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
      <dl className='border border-solid rounded-medium w-full p-3 mt-6 border-grey_100'>
        <h2 className='text-base-medium mb-4'>Informations</h2>
        <dt className='text-base-regular sr-only'>Ajouté le</dt>
        <dd aria-label={formatDayDate(new Date(jeune.creationDate))}>
          <span className='text-base-regular'>Ajouté le : </span>
          <span className='text-md-semi'>
            {formatDayDateLongMonth(new Date(jeune.creationDate))}
          </span>
        </dd>
        {jeune.email && (
          <>
            <dt className='sr-only'>e-mail</dt>
            <dd className='text-primary flex items-center mt-2'>
              <IconComponent
                name={IconName.Email}
                aria-hidden={true}
                focusable={false}
                className='w-[15px] h-[13px] mr-2'
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
                <IconComponent
                  name={IconName.Launch}
                  focusable='false'
                  role='img'
                  title='ouvrir'
                  className='ml-2 w-3 h-3'
                />
              </a>
            </dd>
          </>
        )}
      </dl>

      {withSituations && (
        <div className='border border-solid rounded-medium w-full p-3 mt-2 border-grey_100'>
          <h2 className='text-base-medium mb-1'>Situation</h2>
          {!(jeune.situations && jeune.situations.length) && (
            <ol>
              <li className='mt-3'>
                <div className='mb-3'>
                  <SituationTag situation={CategorieSituation.SANS_SITUATION} />
                </div>
                <div className='mb-3'>
                  Etat : <span className='text-md-semi'>--</span>
                </div>
                <div>
                  Fin le : <span className='text-md-semi'>--</span>
                </div>
              </li>
            </ol>
          )}

          {jeune.situations && Boolean(jeune.situations.length) && (
            <ol className='flex flex-row flex-wrap'>
              {jeune.situations.map((situation) => (
                <li
                  className='mt-3 mr-32 last:mr-0'
                  key={situation.etat + '-' + situation.categorie}
                >
                  <div className='mb-3'>
                    <SituationTag situation={situation.categorie} />
                  </div>
                  <div className='mb-3'>
                    Etat :{' '}
                    <span className='text-md-semi'>
                      {situation.etat ?? '--'}
                    </span>
                  </div>
                  <div className=''>
                    Fin le :{' '}
                    <span className='text-md-semi'>
                      {situation.dateFin ?? '--'}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </>
  )
}
