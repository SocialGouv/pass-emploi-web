import { Metadata } from 'next'

import CreationBeneficiaireFranceTravailPage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/creation-jeune/CreationBeneficiaireFranceTravailPage'
import CreationBeneficiaireMiloPage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/creation-jeune/CreationBeneficiaireMiloPage'
import {
  PageFilArianePortal,
  PageHeaderPortal,
} from 'components/PageNavigationPortals'
import { estUserMilo, estUserPoleEmploi } from 'interfaces/conseiller'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

export const metadata: Metadata = {
  title: 'Créer compte bénéficiaire - Portefeuille',
}

export default async function CreationBeneficiaire() {
  const { user } = await getMandatorySessionServerSide()

  return (
    <>
      <PageFilArianePortal />
      <PageHeaderPortal header='Créer un compte bénéficiaire' />

      {estUserMilo(user) && <CreationBeneficiaireMiloPage />}
      {estUserPoleEmploi(user) && <CreationBeneficiaireFranceTravailPage />}
    </>
  )
}
