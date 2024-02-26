import { Metadata } from 'next'
import { redirect } from 'next/navigation'

import CreationJeunePoleEmploiPage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/creation-jeune/pole-emploi/CreationJeunePoleEmploiPage'
import {
  PageFilArianePortal,
  PageHeaderPortal,
} from 'components/PageNavigationPortals'
import { estUserPoleEmploi } from 'interfaces/conseiller'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

export const metadata: Metadata = {
  title: 'Créer compte bénéficiaire - Portefeuille',
}

export default async function CreationJeunePoleEmploi() {
  const { user } = await getMandatorySessionServerSide()
  if (!estUserPoleEmploi(user)) redirect('/mes-jeunes')

  return (
    <>
      <PageFilArianePortal />
      <PageHeaderPortal header='Créer un compte bénéficiaire' />

      <CreationJeunePoleEmploiPage />
    </>
  )
}
