import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

import EmptyState from 'components/EmptyState'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import { InlineDefinitionItem } from 'components/ui/InlineDefinitionItem'
import { MetadonneesFavoris } from 'interfaces/beneficiaire'

type BlocFavorisProps = {
  idBeneficiaire: string
  metadonneesFavoris: MetadonneesFavoris
}

export default function BlocFavoris({
  idBeneficiaire,
  metadonneesFavoris: { offres, recherches, autoriseLePartage },
}: BlocFavorisProps) {
  const pathPrefix = usePathname()?.startsWith('/etablissement')
    ? '/etablissement/beneficiaires'
    : '/mes-jeunes'
  const aDesFavoris = offres.total > 0 || recherches.total > 0

  return (
    <>
      {!aDesFavoris && (
        <EmptyState
          illustrationName={IllustrationName.Checklist}
          titre='Votre bénéficiaire n’a rien mis en favori pour l’instant.'
          sousTitre='Suggérez-lui des offres d’emploi avec la partie “Offres”'
          lien={{
            href: '/offres',
            label: 'Rechercher une offre',
            iconName: IconName.Search,
          }}
        />
      )}

      {aDesFavoris && (
        <div className='border border-solid rounded-base w-full p-4 mt-3 border-grey_100'>
          <dl>
            <Offres offres={offres} />

            <RecherchesSauvegardees total={recherches.total} />

            {autoriseLePartage && (
              <LienVersFavoris
                idBeneficiaire={idBeneficiaire}
                pathPrefix={pathPrefix}
              />
            )}
          </dl>
        </div>
      )}
    </>
  )
}

function Offres({ offres }: Pick<MetadonneesFavoris, 'offres'>) {
  return (
    <>
      <div className='flex items-center mb-2'>
        <dt className='text-base-medium'>Offres :</dt>
        <dd className='text-base-medium ml-1'>{offres.total}</dd>
      </div>
      <div className='ml-4 mb-4'>
        <InlineDefinitionItem
          definition='Offre d’emploi :'
          description={offres.nombreOffresEmploi}
        />
        <InlineDefinitionItem
          definition='Alternance :'
          description={offres.nombreOffresAlternance}
        />
        <InlineDefinitionItem
          definition='Service civique :'
          description={offres.nombreOffresServiceCivique}
        />
        <InlineDefinitionItem
          definition='Immersion :'
          description={offres.nombreOffresImmersion}
        />
      </div>
    </>
  )
}

function RecherchesSauvegardees({ total }: { total: number }) {
  return (
    <div className='flex items-center'>
      <dt className='text-base-medium'>Recherches sauvegardées :</dt>
      <dd className='text-base-medium ml-1'>{total}</dd>
    </div>
  )
}

export function LienVersFavoris({
  idBeneficiaire,
  pathPrefix,
}: {
  idBeneficiaire: string
  pathPrefix: string
}) {
  return (
    <div className='flex justify-end mt-4'>
      <Link
        href={`${pathPrefix}/${idBeneficiaire}/favoris`}
        className='flex items-center text-content_color underline hover:text-primary hover:fill-primary'
      >
        Voir tous les favoris
        <IconComponent
          name={IconName.ChevronRight}
          className='w-4 h-5 fill-[inherit]'
          aria-hidden={true}
          focusable={false}
        />
      </Link>
    </div>
  )
}
