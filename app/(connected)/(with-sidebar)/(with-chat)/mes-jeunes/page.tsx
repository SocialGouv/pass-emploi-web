import { DateTime } from 'luxon'
import { Metadata } from 'next'
import React from 'react'

import PortefeuillePage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/PortefeuillePage'
import { PageHeaderPortal } from 'components/PageNavigationPortals'
import { CompteurActionsPeriode } from 'interfaces/action'
import {
  compareBeneficiairesByNom,
  BeneficiaireAvecNbActionsNonTerminees,
} from 'interfaces/beneficiaire'
import { estUserFranceTravail } from 'interfaces/conseiller'
import { countActionsJeunes } from 'services/actions.service'
import { getJeunesDuConseillerServerSide } from 'services/jeunes.service'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

export const metadata: Metadata = { title: 'Portefeuille' }

type PortfeuilleSearchParams = Partial<{ source: string }>
export default async function Portefeuille({
  searchParams,
}: {
  searchParams?: PortfeuilleSearchParams
}) {
  const { user, accessToken } = await getMandatorySessionServerSide()
  const beneficiaires = await getJeunesDuConseillerServerSide(
    user.id,
    accessToken
  )

  let beneficiairesAvecNbActionsNonTerminees: BeneficiaireAvecNbActionsNonTerminees[]
  if (estUserFranceTravail(user)) {
    beneficiairesAvecNbActionsNonTerminees = beneficiaires.map(
      (beneficiaire) => ({
        ...beneficiaire,
        nbActionsNonTerminees: 0,
      })
    )
  } else {
    const dateDebut = DateTime.now().startOf('week')
    const dateFin = DateTime.now().endOf('week')
    const compteurActionsPeriode: CompteurActionsPeriode[] =
      await countActionsJeunes(user.id, dateDebut, dateFin, accessToken)

    beneficiairesAvecNbActionsNonTerminees = beneficiaires.map(
      (beneficiaire) => {
        const actionsPeriode = compteurActionsPeriode.find(
          (action) => action.idBeneficiaire === beneficiaire.id
        )

        return {
          ...beneficiaire,
          nbActionsNonTerminees: actionsPeriode?.actions ?? 0,
        }
      }
    )
  }

  beneficiairesAvecNbActionsNonTerminees.sort(compareBeneficiairesByNom)
  return (
    <>
      <PageHeaderPortal header='Portefeuille' />

      <PortefeuillePage
        conseillerJeunes={beneficiairesAvecNbActionsNonTerminees}
        isFromEmail={Boolean(searchParams?.source)}
      />
    </>
  )
}
