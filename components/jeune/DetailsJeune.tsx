import Link from 'next/link'
import React from 'react'

import { Badge } from '../ui/Badge'
import { InlineDefinitionItem } from '../ui/InlineDefinitionItem'

import SituationTag from 'components/jeune/SituationTag'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import {
  CategorieSituation,
  DetailJeune,
  RecherchesSauvegardees,
} from 'interfaces/jeune'
import { formatDayDate } from 'utils/date'

interface DetailsJeuneProps {
  jeune: DetailJeune
  withSituations?: boolean
  recherchesSauvegardees?: RecherchesSauvegardees
  onDossierMiloClick: () => void
}

export const DetailsJeune = ({
  jeune,
  withSituations,
  recherchesSauvegardees,
  onDossierMiloClick,
}: DetailsJeuneProps) => {
  return (
    <>
      <div className='border border-solid rounded-medium w-full p-4 mt-6 border-grey_100'>
        <h2 className='text-base-medium mb-4'>Informations</h2>
        <dl>
          <div className='flex'>
            <dt className='text-base-regular'>Ajouté le :</dt>
            <dd>
              <span className='text-md-semi ml-1'>
                {formatDayDate(new Date(jeune.creationDate))}
              </span>
            </dd>
          </div>

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
      </div>

      {withSituations && (
        <div className='border border-solid rounded-medium w-full p-4 mt-2 border-grey_100'>
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

      <div className='border border-solid rounded-medium w-full p-4 mt-3 border-grey_100'>
        <div className='flex items-center mb-4'>
          <IconComponent
            name={IconName.Favorite}
            className='h-4 w-3 mr-2 fill-favorite_heart'
            aria-hidden={true}
          />
          <h2 className='text-base-medium mr-2'>Favoris</h2>

          <Badge
            count={recherchesSauvegardees?.offres.total ?? 0}
            bgColor='favorite_heart'
          />
        </div>
        <dl>
          <div className='flex items-center mb-2'>
            <dt className='text-base-medium'>Offres :</dt>
            <dd className='text-base-medium ml-1'>
              {recherchesSauvegardees?.offres.total}
            </dd>
          </div>
          <div className='ml-4 mb-4'>
            <InlineDefinitionItem
              definition='Offre d’emploi :'
              description={
                recherchesSauvegardees?.offres.nombreOffresEmploi ?? 0
              }
            />
            <InlineDefinitionItem
              definition='Alternance :'
              description={
                recherchesSauvegardees?.offres.nombreOffresAlternance ?? 0
              }
            />
            <InlineDefinitionItem
              definition='Service civique :'
              description={
                recherchesSauvegardees?.offres.nombreOffresServiceCivique ?? 0
              }
            />
            <InlineDefinitionItem
              definition='Immersion :'
              description={
                recherchesSauvegardees?.offres.nombreOffresImmersion ?? 0
              }
            />
          </div>

          <div className='flex items-center'>
            <dt className='text-base-medium'>Recherches sauvegardées :</dt>
            <dd className='text-base-medium ml-1'>
              {recherchesSauvegardees?.recherches.total ?? 0}
            </dd>
          </div>

          {recherchesSauvegardees?.autoriseLePartage && (
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
