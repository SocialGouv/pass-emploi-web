import { Metadata } from 'next'

import CreationBeneficiaireFranceTravailPage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/creation-jeune/CreationBeneficiaireFranceTravailPage'
import CreationBeneficiaireMiloPage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/creation-jeune/CreationBeneficiaireMiloPage'
import {
  PageFilArianePortal,
  PageHeaderPortal,
} from 'components/PageNavigationPortals'
import { Liste } from 'interfaces/liste'
import {
  estAvenirPro,
  estFTConnect,
  estMilo,
  labelStructure,
} from 'interfaces/structure'
import { getListesServerSide } from 'services/listes.service'
import getMandatorySessionServerSide from 'utils/auth/getMandatorySessionServerSide'

export const metadata: Metadata = {
  title: 'Créer compte bénéficiaire - Portefeuille',
}

export default async function CreationBeneficiaire() {
  const { user, accessToken } = await getMandatorySessionServerSide()

  const header =
    'Créer un compte bénéficiaire' +
    (estFTConnect(user.structure) ? ` ${labelStructure(user.structure)}` : '')

  let listes: Liste[] | undefined = undefined
  if (estAvenirPro(user.structure)) {
    try {
      listes = await getListesServerSide(user.id, accessToken)
    } catch (error) {
      console.error('Erreur lors de la récupération des listes:', error)
    }
  }
  return (
    <>
      <PageFilArianePortal />
      <PageHeaderPortal header={header} />

      {estMilo(user.structure) && <CreationBeneficiaireMiloPage />}
      {!estMilo(user.structure) && (
        <CreationBeneficiaireFranceTravailPage listes={listes} />
      )}
    </>
  )
}
