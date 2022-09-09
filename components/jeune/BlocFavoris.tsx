import Link from 'next/link'
import React from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import { InlineDefinitionItem } from 'components/ui/InlineDefinitionItem'

type BlocFavorisProps = {
  idJeune: string
  offres:
    | {
        total: number
        nombreOffresEmploi: number | undefined
        nombreOffresAlternance: number | undefined
        nombreOffresImmersion: number | undefined
        nombreOffresServiceCivique: number | undefined
      }
    | undefined
  recherches:
    | {
        total: number
        nombreRecherchesOffresEmploi: number | undefined
        nombreRecherchesOffresAlternance: number | undefined
        nombreRecherchesOffresImmersion: number | undefined
        nombreRecherchesOffresServiceCivique: number | undefined
      }
    | undefined
  autoriseLePartage: boolean | undefined
}

export function BlocFavoris({
  idJeune,
  offres,
  recherches,
  autoriseLePartage,
}: BlocFavorisProps) {
  return (
    <div className='border border-solid rounded-medium w-full p-4 mt-3 border-grey_100'>
      <dl>
        <Offres
          total={offres?.total}
          nombreOffresEmploi={offres?.nombreOffresEmploi}
          nombreOffresAlternance={offres?.nombreOffresAlternance}
          nombreOffresServiceCivique={offres?.nombreOffresServiceCivique}
          nombreOffresImmersion={offres?.nombreOffresImmersion}
        />

        <RecherchesSauvegardees total={recherches?.total} />

        {autoriseLePartage && <LienVersFavoris idJeune={idJeune} />}
      </dl>
    </div>
  )
}

function Offres(props: {
  total: number | undefined
  nombreOffresEmploi: number | undefined
  nombreOffresAlternance: number | undefined
  nombreOffresServiceCivique: number | undefined
  nombreOffresImmersion: number | undefined
}) {
  return (
    <>
      <div className='flex items-center mb-2'>
        <dt className='text-base-medium'>Offres :</dt>
        <dd className='text-base-medium ml-1'>{props.total ?? 0}</dd>
      </div>
      <div className='ml-4 mb-4'>
        <InlineDefinitionItem
          definition='Offre d’emploi :'
          description={props.nombreOffresEmploi ?? 0}
        />
        <InlineDefinitionItem
          definition='Alternance :'
          description={props.nombreOffresAlternance ?? 0}
        />
        <InlineDefinitionItem
          definition='Service civique :'
          description={props.nombreOffresServiceCivique ?? 0}
        />
        <InlineDefinitionItem
          definition='Immersion :'
          description={props.nombreOffresImmersion ?? 0}
        />
      </div>
    </>
  )
}

function RecherchesSauvegardees(props: { total: number | undefined }) {
  return (
    <div className='flex items-center'>
      <dt className='text-base-medium'>Recherches sauvegardées :</dt>
      <dd className='text-base-medium ml-1'>{props.total ?? 0}</dd>
    </div>
  )
}

function LienVersFavoris(props: { idJeune: string }) {
  return (
    <div className='flex justify-end mt-4'>
      <Link href={`/mes-jeunes/${props.idJeune}/favoris`}>
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
  )
}
