import { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

import EditionListePage from 'app/(connected)/(with-sidebar)/(without-chat)/mes-jeunes/listes/edition-liste/EditionListePage'
import {
  PageHeaderPortal,
  PageRetourPortal,
} from 'components/PageNavigationPortals'
import { recupererListe } from 'services/listes.service'
import getMandatorySessionServerSide from 'utils/auth/getMandatorySessionServerSide'
import { redirectedFromHome } from 'utils/helpers'

type EditionListeSearchParams = Promise<Partial<{ idListe: string }>>

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: EditionListeSearchParams
}): Promise<Metadata> {
  const { accessToken } = await getMandatorySessionServerSide()
  const { idListe } = (await searchParams) ?? {}

  if (idListe) {
    const liste = await recupererListe(idListe, accessToken)
    if (!liste) notFound()
    return {
      title: `Modifier liste ${liste.titre} - Portefeuille`,
    }
  }

  return { title: 'Créer liste - Portefeuille' }
}

export default async function EditionListe({
  searchParams,
}: {
  searchParams?: EditionListeSearchParams
}) {
  const { accessToken } = await getMandatorySessionServerSide()

  const referer = (await headers()).get('referer')
  const previousUrl =
    referer && !redirectedFromHome(referer) ? referer : '/mes-jeunes/listes'
  const { idListe } = (await searchParams) ?? {}

  if (idListe) {
    const liste = await recupererListe(idListe, accessToken)
    if (!liste) notFound()

    return (
      <>
        <PageRetourPortal lien={previousUrl} />
        <PageHeaderPortal header='Modifier la liste' />

        <EditionListePage liste={liste} returnTo={previousUrl} />
      </>
    )
  }

  return (
    <>
      <PageRetourPortal lien={previousUrl} />
      <PageHeaderPortal header='Créer une nouvelle liste' />

      <EditionListePage returnTo={previousUrl} />
    </>
  )
}
