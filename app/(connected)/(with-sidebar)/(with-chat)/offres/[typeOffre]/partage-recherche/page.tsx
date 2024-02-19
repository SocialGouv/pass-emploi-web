import { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

import PartageRecherchePage, {
  CriteresRecherche,
} from 'app/(connected)/(with-sidebar)/(with-chat)/offres/[typeOffre]/partage-recherche/PartageRecherchePage'
import { PageRetourPortal } from 'components/PageNavigationPortals'
import { TypeOffre } from 'interfaces/offre'

export const metadata: Metadata = {
  title: 'Partager une recherche - Recherche d’offres',
}

type PartageRechercheParams = { typeOffre: string }
export default async function PartageRecherche({
  params,
  searchParams,
}: {
  params: PartageRechercheParams
  searchParams: CriteresRecherche
}) {
  const referer = headers().get('referer')
  const redirectTo = referer ?? '/offres'

  const typeOffre = urlParamToTypeOffre(params.typeOffre)

  return (
    <>
      <PageRetourPortal lien={redirectTo} />

      <PartageRecherchePage
        type={typeOffre}
        criteresRecherche={searchParams}
        returnTo={redirectTo}
      />
    </>
  )
}

function urlParamToTypeOffre(typeOffre: string): TypeOffre {
  switch (typeOffre) {
    case 'emploi':
      return TypeOffre.EMPLOI
    case 'alternance':
      return TypeOffre.ALTERNANCE
    case 'immersion':
      return TypeOffre.IMMERSION
    case 'service-civique':
      return TypeOffre.SERVICE_CIVIQUE
    default:
      notFound()
  }
}
