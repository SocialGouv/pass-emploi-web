import { Metadata } from 'next'
import React from 'react'

import NouvelleActionPage from 'app/(connected)/(with-sidebar)/(without-chat)/mes-jeunes/[jeune_id]/actions/nouvelle-action/NouvelleActionPage'
import {
  PageHeaderPortal,
  PageRetourPortal,
} from 'components/PageNavigationPortals'
import { CODE_QUALIFICATION_NON_SNP } from 'interfaces/json/action'
import { getSituationsNonProfessionnelles } from 'services/actions.service'
import { getIdentitesBeneficiairesServerSide } from 'services/jeunes.service'
import { getActionsPredefinies } from 'services/referentiel.service'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

type NouvelleActionParams = { jeune_id: string }

export async function generateMetadata({
  params,
}: {
  params: NouvelleActionParams
}): Promise<Metadata> {
  const { user, accessToken } = await getMandatorySessionServerSide()
  const [beneficiaire] = await getIdentitesBeneficiairesServerSide(
    [params.jeune_id],
    user.id,
    accessToken
  )
  return {
    title: `Créer une nouvelle action - Actions ${beneficiaire?.prenom} ${beneficiaire?.nom}`,
  }
}

export default async function NouvelleAction({
  params,
}: {
  params: NouvelleActionParams
}) {
  const { accessToken } = await getMandatorySessionServerSide()

  const [categories, actionsPredefinies] = await Promise.all([
    getSituationsNonProfessionnelles(accessToken),
    getActionsPredefinies(accessToken),
  ])

  const categoriesFiltrees = categories.filter(
    (situations) => situations.code !== CODE_QUALIFICATION_NON_SNP
  )

  const returnTo = `/mes-jeunes/${params.jeune_id}?onglet=actions`
  return (
    <>
      <PageRetourPortal lien={returnTo} />
      <PageHeaderPortal header='Créer une nouvelle action' />

      <NouvelleActionPage
        idJeune={params.jeune_id}
        categories={categories}
        actionsPredefinies={actionsPredefinies}
        returnTo={returnTo}
      />
    </>
  )
}
