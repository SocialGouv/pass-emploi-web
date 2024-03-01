import { Metadata } from 'next'

import ConsentementCguPage from 'app/(connected)/(full-page)/consentement-cgu/ConsentementCguPage'
import { getConseillerServerSide } from 'services/conseiller.service'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

export const metadata: Metadata = {
  title: 'Consentement CGU',
}

export default async function ConsentementCgu() {
  const { user, accessToken } = await getMandatorySessionServerSide()
  const conseiller = await getConseillerServerSide(user, accessToken)

  const searchParams = new URLSearchParams()
  if (!conseiller.dateSignatureCGU) searchParams.set('onboarding', 'true')
  const redirectTo = '/?' + searchParams

  return <ConsentementCguPage returnTo={redirectTo} />
}
