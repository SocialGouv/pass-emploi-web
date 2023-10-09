import { Metadata } from 'next'
import { headers } from 'next/headers'

import ConsentementCguPage from 'app/(connected)/(full-page)/consentement-cgu/ConsentementCguPage'
import redirectedFromHome from 'utils/redirectedFromHome'

export const metadata: Metadata = {
  title: 'Consentement CGU',
}

export default function ConsentementCgu() {
  const referer = headers().get('referer')
  const redirectTo =
    referer && !redirectedFromHome(referer) ? referer : '/mes-jeunes'

  return <ConsentementCguPage returnTo={redirectTo} />
}
