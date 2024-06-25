import { Metadata } from 'next'
import { redirect } from 'next/navigation'

import HomePage from 'app/(connected)/(with-sidebar)/(with-chat)/(index)/HomePage'
import { PageHeaderPortal } from 'components/PageNavigationPortals'
import {
  aEtablissement,
  doitSignerLesCGU,
  estMilo,
} from 'interfaces/conseiller'
import { getConseillerServerSide } from 'services/conseiller.service'
import { getAgencesServerSide } from 'services/referentiel.service'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

export const metadata: Metadata = { title: 'Accueil' }

type HomeSearchParams = Partial<{
  redirectUrl: string
  source: string
  onboarding: boolean
}>
export default async function Home({
  searchParams,
}: {
  searchParams?: HomeSearchParams
}) {
  const { user, accessToken } = await getMandatorySessionServerSide()
  const sourceQueryParam = searchParams?.source
    ? `?source=${searchParams.source}`
    : ''

  const conseiller = await getConseillerServerSide(user, accessToken)
  if (doitSignerLesCGU(conseiller)) redirect('/consentement-cgu')

  const redirectUrl =
    searchParams?.redirectUrl ?? '/mes-jeunes' + sourceQueryParam

  const afficherModaleOnboarding = Boolean(searchParams?.onboarding)
  const emailEstManquant = estMilo(conseiller) && !conseiller.email
  const agenceEstManquante = !aEtablissement(conseiller)
  if (!afficherModaleOnboarding && !emailEstManquant && !agenceEstManquante)
    redirect(`${redirectUrl}`)

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
        afficherModaleOnboarding={afficherModaleOnboarding}
        afficherModaleAgence={agenceEstManquante}
        afficherModaleEmail={emailEstManquant}
        redirectUrl={redirectUrl}
        referentielAgences={referentielAgences}
      />
    </>
  )
}
