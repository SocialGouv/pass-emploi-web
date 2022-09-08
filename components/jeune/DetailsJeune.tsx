import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { MouseEventHandler, useState } from 'react'

import { Badge } from '../ui/Indicateurs/Badge'
import { InlineDefinitionItem } from '../ui/InlineDefinitionItem'

import { BlocInformationJeune } from 'components/jeune/BlocInformationJeune'
import { BlocSituation } from 'components/jeune/BlocSituation'
import UpdateIdentifiantPartenaireModal from 'components/jeune/UpdateIdentifiantPartenaireModal'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { StructureConseiller } from 'interfaces/conseiller'
import { DetailJeune, MetadonneesFavoris } from 'interfaces/jeune'
import { QueryParam, QueryValue } from 'referentiel/queryParam'
import { JeunesService } from 'services/jeunes.service'
import { trackEvent } from 'utils/analytics/matomo'
import { useDependance } from 'utils/injectionDependances'

interface DetailsJeuneProps {
  jeune: DetailJeune
  structureConseiller: StructureConseiller | undefined
  metadonneesFavoris?: MetadonneesFavoris
  onDossierMiloClick: () => void
  onDeleteJeuneClick: MouseEventHandler<HTMLButtonElement>
}

export const DetailsJeune = ({
  jeune,
  structureConseiller,
  metadonneesFavoris,
  onDossierMiloClick,
  onDeleteJeuneClick,
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
      <div className='flex flex-row items-stretch gap-x-6'>
        {structureConseiller === StructureConseiller.MILO && (
          <BlocSituation
            idJeune={jeune.id}
            situations={jeune.situations}
            versionResumee={true}
          />
        )}

        <BlocInformationJeune
          idJeune={jeune.id}
          creationDate={jeune.creationDate}
          email={jeune.email}
          structureConseiller={structureConseiller}
          onIdentifiantPartenaireCopie={trackEventOnCopieIdentifiantPartenaire}
          identifiantPartenaire={identifiantPartenaire}
          onIdentifiantPartenaireClick={openIdentifiantPartenaireModal}
          urlDossier={jeune.urlDossier}
          onDossierMiloClick={onDossierMiloClick}
          onDeleteJeuneClick={onDeleteJeuneClick}
        />
      </div>

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
