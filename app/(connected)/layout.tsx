import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'

import { Conseiller, estPoleEmploiBRSA } from 'interfaces/conseiller'
import { JeuneFromListe } from 'interfaces/jeune'
import { getConseillerServerSide } from 'services/conseiller.service'
import { getJeunesDuConseillerServerSide } from 'services/jeunes.service'
import AppContextProviders from 'utils/AppContextProviders'
import { getMandatorySessionServerSide } from 'utils/auth/auth'
import { ApiError } from 'utils/httpClient'

export async function generateMetadata(): Promise<Metadata> {
  const { accessToken, user } = await getMandatorySessionServerSide()
  const conseiller = await getConseillerServerSide(user, accessToken)
  const siteTitle =
    'Espace conseiller ' +
    (conseiller && estPoleEmploiBRSA(conseiller) ? 'pass emploi' : 'CEJ')

  return { title: { template: '%s - ' + siteTitle, default: siteTitle } }
}

export default async function LayoutWhenConnected({
  children,
}: {
  children: ReactNode
}) {
  const { accessToken, user } = await getMandatorySessionServerSide()

  let conseiller: Conseiller | undefined
  let portefeuille: JeuneFromListe[]
  try {
    ;[conseiller, portefeuille] = await Promise.all([
      getConseillerServerSide(user, accessToken),
      getJeunesDuConseillerServerSide(user.id, accessToken),
    ])
  } catch (e) {
    if (e instanceof ApiError && e.statusCode === 401) {
      // TODO redirect in http-client quand le router "page" aura disparu
      redirect('/api/auth/federated-logout')
    }
  }

  if (!conseiller) {
    throw new Error(`Conseiller ${user.id} inexistant`)
  }

  const theme = estPoleEmploiBRSA(conseiller) ? 'brsa' : 'cej'

  return (
    <AppContextProviders
      conseiller={conseiller}
      portefeuille={portefeuille!}
      theme={theme}
    >
      {children}
    </AppContextProviders>
  )
}
