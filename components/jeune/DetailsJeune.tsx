import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useState } from 'react'

import { Badge } from '../ui/Indicateurs/Badge'
import { InlineDefinitionItem } from '../ui/InlineDefinitionItem'

import { BlocInformationJeune } from 'components/jeune/BlocInformationJeune'
import SituationTag from 'components/jeune/SituationTag'
import UpdateIdentifiantPartenaireModal from 'components/jeune/UpdateIdentifiantPartenaireModal'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { StructureConseiller } from 'interfaces/conseiller'
import {
  CategorieSituation,
  DetailJeune,
  MetadonneesFavoris,
} from 'interfaces/jeune'
import { QueryParam, QueryValue } from 'referentiel/queryParam'
import { JeunesService } from 'services/jeunes.service'
import { trackEvent } from 'utils/analytics/matomo'
import { useDependance } from 'utils/injectionDependances'

interface DetailsJeuneProps {
  jeune: DetailJeune
  structureConseiller: StructureConseiller | undefined
  metadonneesFavoris?: MetadonneesFavoris
  onDossierMiloClick: () => void
}

export const DetailsJeune = ({
  jeune,
  structureConseiller,
  metadonneesFavoris,
  onDossierMiloClick,
}: DetailsJeuneProps) => {
  const router = useRouter()
  const jeunesService = useDependance<JeunesService>('jeunesService')

  const [showIdentifiantPartenaireModal, setShowIdentifiantPartenaireModal] =
    useState<boolean>(false)
  const [identifiantPartenaire, setIdentifiantPartenaire] = useState<
    string | undefined
  >(jeune.idPartenaire)

  const totalFavoris = metadonneesFavoris
    ? metadonneesFavoris.offres.total + metadonneesFavoris.recherches.total
    : 0

  function openIdentifiantPartenaireModal() {
    setShowIdentifiantPartenaireModal(true)
  }

  function closeIdentifiantPartenaireModal() {
    setShowIdentifiantPartenaireModal(false)
  }

  async function updateIdentifiantPartenaire(
    identifiantPartenaire: string
  ): Promise<void> {
    jeunesService
      .modifierIdentifiantPartenaire(jeune.id, identifiantPartenaire)
      .then(() => {
        setIdentifiantPartenaire(identifiantPartenaire)
        setShowIdentifiantPartenaireModal(false)
        router.push({
          pathname: `/mes-jeunes/${jeune.id}`,
          query: {
            [QueryParam.modificationIdentifiantPartenaire]: QueryValue.succes,
          },
        })
      })
      .catch(() => {
        setShowIdentifiantPartenaireModal(false)
      })
  }

  function trackEventOnCopieIdentifiantPartenaire() {
    trackEvent({
      structure: StructureConseiller.POLE_EMPLOI,
      categorie: 'fiche jeune',
      action: 'copie identifiant pe',
      nom: '',
    })
  }

  return (
    <>
      <BlocInformationJeune
        creationDate={jeune.creationDate}
        email={jeune.email}
        structureConseiller={structureConseiller}
        onIdentifiantPartenaireCopie={trackEventOnCopieIdentifiantPartenaire}
        identifiantPartenaire={identifiantPartenaire}
        onIdentifiantPartenaireClick={openIdentifiantPartenaireModal}
        urlDossier={jeune.urlDossier}
        onDossierMiloClick={onDossierMiloClick}
      />

      {structureConseiller === StructureConseiller.MILO && (
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
      {showIdentifiantPartenaireModal && (
        <UpdateIdentifiantPartenaireModal
          identifiantPartenaire={identifiantPartenaire}
          updateIdentifiantPartenaire={updateIdentifiantPartenaire}
          onClose={closeIdentifiantPartenaireModal}
        />
      )}
    </>
  )
}
