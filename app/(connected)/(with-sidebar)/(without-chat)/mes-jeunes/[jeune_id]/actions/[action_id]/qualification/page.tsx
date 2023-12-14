import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import QualificationPage from 'app/(connected)/(with-sidebar)/(without-chat)/mes-jeunes/[jeune_id]/actions/[action_id]/qualification/QualificationPage'
import {
  PageHeaderPortal,
  PageRetourPortal,
} from 'components/PageNavigationPortals'
import { StatutAction } from 'interfaces/action'
import { StructureConseiller } from 'interfaces/conseiller'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

export const metadata: Metadata = {
  title: 'Qualifier action - Actions jeune',
}

type QualificationParams = { action_id: string }
export default async function Qualification({
  params,
}: {
  params: QualificationParams
}) {
  const { user, accessToken } = await getMandatorySessionServerSide()
  if (user.structure !== StructureConseiller.MILO) notFound()

  const { getAction, getSituationsNonProfessionnelles } = await import(
    'services/actions.service'
  )
  const [actionContent, situationsNonProfessionnelles] = await Promise.all([
    getAction(params.action_id, accessToken),
    getSituationsNonProfessionnelles(accessToken),
  ])
  if (!actionContent) notFound()

  const { action, jeune } = actionContent
  if (action.status !== StatutAction.Terminee) notFound()

  const returnTo = `/mes-jeunes/${jeune.id}/actions/${action.id}`
  return (
    <>
      <PageHeaderPortal header='Créer une situation non professionnelle' />
      <PageRetourPortal lien={returnTo} />

      <QualificationPage
        action={action}
        situationsNonProfessionnelles={situationsNonProfessionnelles}
        returnTo={returnTo}
      />
    </>
  )
}
