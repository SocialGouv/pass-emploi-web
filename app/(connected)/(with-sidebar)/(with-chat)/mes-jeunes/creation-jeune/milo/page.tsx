import { Metadata } from 'next'
import { redirect } from 'next/navigation'

import CreationJeuneMiloPage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/creation-jeune/milo/CreationJeuneMiloPage'
import {
  PageFilArianePortal,
  PageHeaderPortal,
} from 'components/PageNavigationPortals'
import { estUserMilo } from 'interfaces/conseiller'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

export const metadata: Metadata = {
  title: 'Créer compte bénéficiaire - Portefeuille',
}

export default async function CreationJeuneMilo() {
  const { user } = await getMandatorySessionServerSide()
  if (!estUserMilo(user)) redirect('/mes-jeunes')

  return (
    <>
      <PageFilArianePortal />
      <PageHeaderPortal header='Créer un compte bénéficiaire' />

      <CreationJeuneMiloPage />
    </>
  )
}
