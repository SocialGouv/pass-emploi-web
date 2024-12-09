import { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

import EditionListeDiffusionPage from 'app/(connected)/(with-sidebar)/(without-chat)/mes-jeunes/listes-de-diffusion/edition-liste/EditionListeDiffusionPage'
import {
  PageHeaderPortal,
  PageRetourPortal,
} from 'components/PageNavigationPortals'
import { recupererListeDeDiffusion } from 'services/listes-de-diffusion.service'
import { getMandatorySessionServerSide } from 'utils/auth/auth'
import { redirectedFromHome } from 'utils/helpers'

type EditionListeDiffusionSearchParams = Promise<Partial<{ idListe: string }>>

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: EditionListeDiffusionSearchParams
}): Promise<Metadata> {
  const { accessToken } = await getMandatorySessionServerSide()
  const { idListe } = (await searchParams) ?? {}

  if (idListe) {
    const liste = await recupererListeDeDiffusion(idListe, accessToken)
    if (!liste) notFound()
    return {
      title: `Modifier liste de diffusion ${liste.titre} - Portefeuille`,
    }
  }

  return { title: 'Créer liste de diffusion - Portefeuille' }
}

export default async function EditionListeDiffusion({
  searchParams,
}: {
  searchParams?: EditionListeDiffusionSearchParams
}) {
  const { accessToken } = await getMandatorySessionServerSide()

  const referer = (await headers()).get('referer')
  const previousUrl =
    referer && !redirectedFromHome(referer)
      ? referer
      : '/mes-jeunes/listes-de-diffusion'
  const { idListe } = (await searchParams) ?? {}

  if (idListe) {
    const liste = await recupererListeDeDiffusion(idListe, accessToken)
    if (!liste) notFound()

    return (
      <>
        <PageRetourPortal lien={previousUrl} />
        <PageHeaderPortal header='Modifier la liste' />

        <EditionListeDiffusionPage liste={liste} returnTo={previousUrl} />
      </>
    )
  }

  return (
    <>
      <PageRetourPortal lien={previousUrl} />
      <PageHeaderPortal header='Créer une nouvelle liste' />

      <EditionListeDiffusionPage returnTo={previousUrl} />
    </>
  )
}
