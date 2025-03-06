import { Metadata } from 'next'

import CreationBeneficiaireFranceTravailPage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/creation-jeune/CreationBeneficiaireFranceTravailPage'
import CreationBeneficiaireMiloPage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/creation-jeune/CreationBeneficiaireMiloPage'
import {
  PageFilArianePortal,
  PageHeaderPortal,
} from 'components/PageNavigationPortals'
import { estFTConnect, estMilo, labelStructure } from 'interfaces/structure'
import getMandatorySessionServerSide from 'utils/auth/getMandatorySessionServerSide'

export const metadata: Metadata = {
  title: 'Créer compte bénéficiaire - Portefeuille',
}

export default async function CreationBeneficiaire() {
  const { user } = await getMandatorySessionServerSide()

  const header =
    'Créer un compte bénéficiaire' +
    (estFTConnect(user.structure) ? ` ${labelStructure(user.structure)}` : '')
  return (
    <>
      <PageFilArianePortal />
      <PageHeaderPortal header={header} />

      {estMilo(user.structure) && <CreationBeneficiaireMiloPage />}
      {!estMilo(user.structure) && <CreationBeneficiaireFranceTravailPage />}
    </>
  )
}
