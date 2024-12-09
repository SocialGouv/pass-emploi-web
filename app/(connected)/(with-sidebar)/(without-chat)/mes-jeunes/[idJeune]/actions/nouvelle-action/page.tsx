import { Metadata } from 'next'
import React from 'react'

import NouvelleActionPage from 'app/(connected)/(with-sidebar)/(without-chat)/mes-jeunes/[idJeune]/actions/nouvelle-action/NouvelleActionPage'
import {
  PageHeaderPortal,
  PageRetourPortal,
} from 'components/PageNavigationPortals'
import { getSituationsNonProfessionnelles } from 'services/actions.service'
import { getIdentitesBeneficiairesServerSide } from 'services/beneficiaires.service'
import { getActionsPredefinies } from 'services/referentiel.service'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

type NouvelleActionParams = Promise<{ idJeune: string }>

export async function generateMetadata({
  params,
}: {
  params: NouvelleActionParams
}): Promise<Metadata> {
  const { user, accessToken } = await getMandatorySessionServerSide()
  const { idJeune } = await params
  const [beneficiaire] = await getIdentitesBeneficiairesServerSide(
    [idJeune],
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
    getSituationsNonProfessionnelles({ avecNonSNP: false }, accessToken),
    getActionsPredefinies(accessToken),
  ])

  const { idJeune } = await params
  const returnTo = `/mes-jeunes/${idJeune}?onglet=actions`
  return (
    <>
      <PageRetourPortal lien={returnTo} />
      <PageHeaderPortal header='Créer une nouvelle action' />

      <NouvelleActionPage
        idBeneficiaire={idJeune}
        categories={categories}
        actionsPredefinies={actionsPredefinies}
        returnTo={returnTo}
      />
    </>
  )
}
