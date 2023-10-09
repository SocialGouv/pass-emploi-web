import { ReactNode } from 'react'

import { getConseillerServerSide } from 'services/conseiller.service'
import { getJeunesDuConseillerServerSide } from 'services/jeunes.service'
import { getMandatorySessionServerSide } from 'utils/auth/auth'
import { ConseillerProvider } from 'utils/conseiller/conseillerContext'
import { PortefeuilleProvider } from 'utils/portefeuilleContext'

export default async function LayoutWhenConnected({
  children,
}: {
  children: ReactNode
}) {
  const { accessToken, user } = await getMandatorySessionServerSide()
  const conseiller = await getConseillerServerSide(user, accessToken)
  const portefeuille = await getJeunesDuConseillerServerSide(
    user.id,
    accessToken
  )

  return (
    <ConseillerProvider conseiller={conseiller}>
      <PortefeuilleProvider portefeuille={portefeuille}>
        {children}
      </PortefeuilleProvider>
    </ConseillerProvider>
  )
}
