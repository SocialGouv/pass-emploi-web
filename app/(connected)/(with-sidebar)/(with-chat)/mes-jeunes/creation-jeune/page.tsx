import { Metadata } from 'next'

import CreationJeuneMiloPage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/creation-jeune/CreationJeuneMiloPage'
import CreationJeunePoleEmploiPage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/creation-jeune/CreationJeunePoleEmploiPage'
import {
  PageFilArianePortal,
  PageHeaderPortal,
} from 'components/PageNavigationPortals'
import { estUserMilo, estUserPoleEmploi } from 'interfaces/conseiller'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

export const metadata: Metadata = {
  title: 'Créer compte bénéficiaire - Portefeuille',
}

export default async function CreationJeuneMilo() {
  const { user } = await getMandatorySessionServerSide()

  return (
    <>
      <PageFilArianePortal />
      <PageHeaderPortal header='Créer un compte bénéficiaire' />

      {estUserMilo(user) && <CreationJeuneMiloPage />}
      {estUserPoleEmploi(user) && <CreationJeunePoleEmploiPage />}
    </>
  )
}
