import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import FavorisPage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/favoris/FavorisPage'
import {
  PageFilArianePortal,
  PageHeaderPortal,
} from 'components/PageNavigationPortals'
import { getNomBeneficiaireComplet } from 'interfaces/beneficiaire'
import { estConseillerReferent } from 'interfaces/conseiller'
import { getJeuneDetails } from 'services/beneficiaires.service'
import { getOffres, getRecherchesSauvegardees } from 'services/favoris.service'
import getMandatorySessionServerSide from 'utils/auth/getMandatorySessionServerSide'
import { ApiError } from 'utils/httpClient'

type FavorisParams = Promise<{ idJeune: string }>

export async function generateMetadata({
  params,
}: {
  params: FavorisParams
}): Promise<Metadata> {
  const { user, accessToken } = await getMandatorySessionServerSide()

  const { idJeune } = await params
  const beneficiaire = await getJeuneDetails(idJeune, accessToken)
  if (!beneficiaire) notFound()

  const lectureSeule = !estConseillerReferent(user, beneficiaire)
  return {
    title: `Favoris - ${getNomBeneficiaireComplet(beneficiaire)} - ${lectureSeule ? 'Etablissement' : 'Portefeuille'}`,
  }
}

export default async function Favoris({ params }: { params: FavorisParams }) {
  const { accessToken } = await getMandatorySessionServerSide()

  const { idJeune } = await params
  const beneficiaire = await getJeuneDetails(idJeune, accessToken)
  if (!beneficiaire) notFound()

  try {
    const [offres, recherches] = await Promise.all([
      getOffres(idJeune, accessToken),
      getRecherchesSauvegardees(idJeune, accessToken),
    ])
    return (
      <>
        <PageFilArianePortal />
        <PageHeaderPortal header='Favoris' />

        <FavorisPage
          beneficiaire={beneficiaire}
          offres={offres}
          recherches={recherches}
        />
      </>
    )
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 403)
      redirect('/mes-jeunes/' + idJeune)
    throw error
  }
}
