import { Metadata } from 'next'
import React from 'react'

import PortefeuillePage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/PortefeuillePage'
import { PageHeaderPortal } from 'components/PageNavigationPortals'
import { TotalActions } from 'interfaces/action'
import { estUserPoleEmploi } from 'interfaces/conseiller'
import {
  compareBeneficiairesByNom,
  BeneficiaireAvecNbActionsNonTerminees,
} from 'interfaces/beneficiaire'
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
  const jeunes = await getJeunesDuConseillerServerSide(user.id, accessToken)

  let jeunesAvecNbActionsNonTerminees: BeneficiaireAvecNbActionsNonTerminees[]
  if (estUserPoleEmploi(user)) {
    jeunesAvecNbActionsNonTerminees = jeunes.map((jeune) => ({
      ...jeune,
      nbActionsNonTerminees: 0,
    }))
  } else {
    const totauxActions: TotalActions[] = await countActionsJeunes(
      user.id,
      accessToken
    )

    jeunesAvecNbActionsNonTerminees = jeunes.map((jeune) => {
      const totalJeune = totauxActions.find(
        (action) => action.idJeune === jeune.id
      )

      return {
        ...jeune,
        nbActionsNonTerminees: totalJeune?.nbActionsNonTerminees ?? 0,
      }
    })
  }

  jeunesAvecNbActionsNonTerminees.sort(compareBeneficiairesByNom)
  return (
    <>
      <PageHeaderPortal header='Portefeuille' />

      <PortefeuillePage
        conseillerJeunes={jeunesAvecNbActionsNonTerminees}
        isFromEmail={Boolean(searchParams?.source)}
      />
    </>
  )
}
