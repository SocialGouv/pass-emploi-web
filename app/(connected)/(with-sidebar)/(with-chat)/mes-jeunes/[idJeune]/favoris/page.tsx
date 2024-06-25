import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import FavorisPage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/favoris/FavorisPage'
import {
  PageFilArianePortal,
  PageHeaderPortal,
} from 'components/PageNavigationPortals'
import { getNomBeneficiaireComplet } from 'interfaces/beneficiaire'
import { getOffres, getRecherchesSauvegardees } from 'services/favoris.service'
import { getJeuneDetails } from 'services/jeunes.service'
import { getMandatorySessionServerSide } from 'utils/auth/auth'
import { ApiError } from 'utils/httpClient'

type FavorisParams = { idJeune: string }
export async function generateMetadata({
  params,
}: {
  params: FavorisParams
}): Promise<Metadata> {
  const { user, accessToken } = await getMandatorySessionServerSide()

  const beneficiaire = await getJeuneDetails(params.idJeune, accessToken)
  if (!beneficiaire) notFound()

  const lectureSeule = beneficiaire.idConseiller !== user.id
  return {
    title: `Favoris - ${getNomBeneficiaireComplet(beneficiaire)} - ${lectureSeule ? 'Etablissement' : 'Portefeuille'}`,
  }
}

export default async function Favoris({ params }: { params: FavorisParams }) {
  const { user, accessToken } = await getMandatorySessionServerSide()

  const idJeune = params.idJeune
  const beneficiaire = await getJeuneDetails(idJeune, accessToken)
  if (!beneficiaire) notFound()

  const lectureSeule = beneficiaire.idConseiller !== user.id

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
          offres={offres}
          recherches={recherches}
          lectureSeule={lectureSeule}
        />
      </>
    )
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 403)
      redirect('/mes-jeunes/' + idJeune)
    throw error
  }
}
