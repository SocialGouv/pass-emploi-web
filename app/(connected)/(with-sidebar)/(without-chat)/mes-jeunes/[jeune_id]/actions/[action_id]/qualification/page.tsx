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

type QualificationParams = { action_id: string }

export async function generateMetadata({
  params,
}: {
  params: QualificationParams
}): Promise<Metadata> {
  const { accessToken } = await getMandatorySessionServerSide()

  const { getAction } = await import('services/actions.service')
  const actionContent = await getAction(params.action_id, accessToken)

  return {
    title: `Qualifier l’action ${actionContent?.action.content} - ${actionContent?.jeune.prenom} ${actionContent?.jeune.prenom}`,
  }
}
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
  const [actionContent, categories] = await Promise.all([
    getAction(params.action_id, accessToken),
    getSituationsNonProfessionnelles({ avecNonSNP: true }, accessToken),
  ])
  if (!actionContent) notFound()

  const { action, jeune } = actionContent
  if (action.status !== StatutAction.Terminee) notFound()

  const returnTo = `/mes-jeunes/${jeune.id}/actions/${action.id}`
  return (
    <>
      <PageHeaderPortal header='Qualifier l’action' />
      <PageRetourPortal lien={returnTo} />

      <QualificationPage
        beneficiaire={jeune}
        action={action}
        categories={categories}
        returnTo={returnTo}
      />
    </>
  )
}
