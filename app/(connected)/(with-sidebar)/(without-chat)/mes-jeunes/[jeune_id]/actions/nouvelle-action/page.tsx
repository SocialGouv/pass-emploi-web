import { Metadata } from 'next'
import React from 'react'

import NouvelleActionPage, {
  TITRE_AUTRE,
} from 'app/(connected)/(with-sidebar)/(without-chat)/mes-jeunes/[jeune_id]/actions/nouvelle-action/NouvelleActionPage'
import {
  PageHeaderPortal,
  PageRetourPortal,
} from 'components/PageNavigationPortals'
import { getSituationsNonProfessionnelles } from 'services/actions.service'
import { getActionsPredefinies } from 'services/referentiel.service'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

export const metadata: Metadata = {
  title: 'Créer action - Actions jeune',
}

type NouvelleActionParams = { jeune_id: string }
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

  const returnTo = `/mes-jeunes/${params.jeune_id}?onglet=actions`
  return (
    <>
      <PageRetourPortal lien={returnTo} />
      <PageHeaderPortal header='Créer une nouvelle action' />

      <NouvelleActionPage
        idJeune={params.jeune_id}
        categories={categories}
        actionsPredefinies={actionsPredefinies.concat({
          id: 'autre',
          titre: TITRE_AUTRE,
        })}
        returnTo={returnTo}
      />
    </>
  )
}
