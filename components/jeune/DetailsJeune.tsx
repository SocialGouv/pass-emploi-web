import Link from 'next/link'
import React from 'react'

import { Badge } from '../ui/Badge'
import { InlineDefinitionItem } from '../ui/InlineDefinitionItem'

import SituationTag from 'components/jeune/SituationTag'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import {
  CategorieSituation,
  DetailJeune,
  MetadonneesFavoris,
} from 'interfaces/jeune'
import { formatDayDate } from 'utils/date'

interface DetailsJeuneProps {
  jeune: DetailJeune
  withSituations?: boolean
  metadonneesFavoris?: MetadonneesFavoris
  onDossierMiloClick: () => void
}

export const DetailsJeune = ({
  jeune,
  withSituations,
  metadonneesFavoris,
  onDossierMiloClick,
}: DetailsJeuneProps) => {
  const totalFavoris = metadonneesFavoris
    ? metadonneesFavoris.offres.total + metadonneesFavoris.recherches.total
    : 0
  return (
    <>
      <div className='border border-solid rounded-medium w-full p-4 mt-6 border-grey_100'>
        <h2 className='text-base-bold mb-4'>Informations</h2>
        <dl>
          <div className='flex'>
            <dt className='text-base-regular'>Ajouté le :</dt>
            <dd>
              <span className='text-base-medium ml-1'>
                {formatDayDate(new Date(jeune.creationDate))}
              </span>
            </dd>
          </div>

          {jeune.email && (
            <div className='flex items-center'>
              <dt>
                <IconComponent
                  name={IconName.Email}
                  aria-label='e-mail'
                  aria-hidden={false}
                  focusable={false}
                  className='w-[15px] h-[13px] mr-2'
                />
              </dt>
              <dd className='text-primary'>{jeune.email}</dd>
            </div>
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
      </div>

      {withSituations && (
        <div className='border border-solid rounded-medium w-full p-4 mt-2 border-grey_100'>
          <h2 className='text-base-bold mb-1'>Situation</h2>
          {!(jeune.situations && jeune.situations.length) && (
            <ol>
              <li className='mt-3'>
                <div className='mb-3'>
                  <SituationTag situation={CategorieSituation.SANS_SITUATION} />
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
                    <span className='text-base-medium'>
                      {situation.etat ?? '--'}
                    </span>
                  </div>
                  <div className=''>
                    Fin le :{' '}
                    <span className='text-base-medium'>
                      {situation.dateFin ?? '--'}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      <div className='border border-solid rounded-medium w-full p-4 mt-3 border-grey_100'>
        <div className='flex items-center mb-4'>
          <IconComponent
            name={IconName.Favorite}
            className='h-4 w-4 mr-2 stroke-favorite_heart'
            aria-hidden={true}
          />
          <h2 className='text-base-bold mr-2'>Favoris</h2>

          <Badge count={totalFavoris} bgColor='favorite_heart' />
        </div>
        <dl>
          <div className='flex items-center mb-2'>
            <dt className='text-base-medium'>Offres :</dt>
            <dd className='text-base-medium ml-1'>
              {metadonneesFavoris?.offres.total}
            </dd>
          </div>
          <div className='ml-4 mb-4'>
            <InlineDefinitionItem
              definition='Offre d’emploi :'
              description={metadonneesFavoris?.offres.nombreOffresEmploi ?? 0}
            />
            <InlineDefinitionItem
              definition='Alternance :'
              description={
                metadonneesFavoris?.offres.nombreOffresAlternance ?? 0
              }
            />
            <InlineDefinitionItem
              definition='Service civique :'
              description={
                metadonneesFavoris?.offres.nombreOffresServiceCivique ?? 0
              }
            />
            <InlineDefinitionItem
              definition='Immersion :'
              description={
                metadonneesFavoris?.offres.nombreOffresImmersion ?? 0
              }
            />
          </div>

          <div className='flex items-center'>
            <dt className='text-base-medium'>Recherches sauvegardées :</dt>
            <dd className='text-base-medium ml-1'>
              {metadonneesFavoris?.recherches.total ?? 0}
            </dd>
          </div>
          {metadonneesFavoris?.autoriseLePartage && (
            <div className='flex justify-end mt-4'>
              <Link href={`/mes-jeunes/${jeune.id}/favoris`}>
                <a className='flex items-center text-content_color underline hover:text-primary hover:fill-primary'>
                  Voir la liste des favoris
                  <IconComponent
                    name={IconName.ChevronRight}
                    className='w-4 h-5 fill-[inherit]'
                    aria-hidden={true}
                    focusable={false}
                  />
                </a>
              </Link>
            </div>
          )}
        </dl>
      </div>
    </>
  )
}
