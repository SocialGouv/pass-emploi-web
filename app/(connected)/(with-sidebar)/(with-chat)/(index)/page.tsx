import { Metadata } from 'next'
import { redirect } from 'next/navigation'

import HomePage from 'app/(connected)/(with-sidebar)/(with-chat)/(index)/HomePage'
import { PageHeaderPortal } from 'components/PageNavigationPortals'
import {
  aEtablissement,
  Conseiller,
  doitSignerLesCGU,
  estMilo,
  estPassEmploi,
} from 'interfaces/conseiller'
import { getConseillerServerSide } from 'services/conseiller.service'
import { getAgencesServerSide } from 'services/referentiel.service'
import { getMandatorySessionServerSide } from 'utils/auth/auth'
import { ApiError } from 'utils/httpClient'

export const metadata: Metadata = { title: 'Accueil' }

type HomeSearchParams = Partial<{ redirectUrl: string; source: string }>
export default async function Home({
  searchParams,
}: {
  searchParams?: HomeSearchParams
}) {
  const { user, accessToken } = await getMandatorySessionServerSide()
  const sourceQueryParam = searchParams?.source
    ? `?source=${searchParams.source}`
    : ''

  let conseiller: Conseiller | undefined
  try {
    conseiller = await getConseillerServerSide(user, accessToken)
  } catch (e) {
    if (e instanceof ApiError && e.statusCode === 401)
      redirect('/api/auth/federated-logout')
    throw e
  }
  if (!conseiller) {
    throw new Error(`Conseiller ${user.id} inexistant`)
  }

  if (doitSignerLesCGU(conseiller)) redirect('/consentement-cgu')

  const redirectUrl =
    searchParams?.redirectUrl ?? '/mes-jeunes' + sourceQueryParam

  const emailEstManquant = estMilo(conseiller) && !conseiller.email
  const agenceEstManquante =
    !estPassEmploi(conseiller) && !aEtablissement(conseiller)
  if (!emailEstManquant && !agenceEstManquante) redirect(`${redirectUrl}`)

  let referentielAgences = undefined
  if (!estMilo(conseiller)) {
    referentielAgences = await getAgencesServerSide(
      conseiller.structure,
      accessToken
    )
  }

  return (
    <>
      <PageHeaderPortal header='Accueil' />

      <HomePage
        afficherModaleAgence={agenceEstManquante}
        afficherModaleEmail={emailEstManquant}
        redirectUrl={redirectUrl}
        referentielAgences={referentielAgences}
      />
    </>
  )
}