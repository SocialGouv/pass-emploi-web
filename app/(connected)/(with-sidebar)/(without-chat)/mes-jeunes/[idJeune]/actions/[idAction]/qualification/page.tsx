import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import QualificationPage from 'app/(connected)/(with-sidebar)/(without-chat)/mes-jeunes/[idJeune]/actions/[idAction]/qualification/QualificationPage'
import {
  PageHeaderPortal,
  PageRetourPortal,
} from 'components/PageNavigationPortals'
import { StatutAction } from 'interfaces/action'
import { estUserMilo } from 'interfaces/conseiller'
import { getMandatorySessionServerSide } from 'utils/auth/auth'
import { unsafeRandomId } from 'utils/helpers'

type QualificationParams = Promise<{ idAction: string }>
type QualificationSearchParams = Promise<Partial<{ liste: string }>>
type RouteProps = {
  params: QualificationParams
  searchParams?: QualificationSearchParams
}

export async function generateMetadata({
  params,
}: RouteProps): Promise<Metadata> {
  const { accessToken } = await getMandatorySessionServerSide()

  const { getAction } = await import('services/actions.service')
  const { idAction } = await params
  const actionContent = await getAction(idAction, accessToken)

  return {
    title: `Qualifier l’action ${actionContent?.action.titre} - ${actionContent?.jeune.prenom} ${actionContent?.jeune.prenom}`,
  }
}
export default async function Qualification({
  params,
  searchParams,
}: RouteProps) {
  const { user, accessToken } = await getMandatorySessionServerSide()
  if (!estUserMilo(user)) notFound()

  const { getAction, getSituationsNonProfessionnelles } = await import(
    'services/actions.service'
  )
  const { idAction } = await params
  const [actionContent, categories] = await Promise.all([
    getAction(idAction, accessToken),
    getSituationsNonProfessionnelles({ avecNonSNP: true }, accessToken),
  ])
  if (!actionContent) notFound()

  const { action, jeune } = actionContent
  if (action.status !== StatutAction.Terminee) notFound()

  // FIXME : dirty fix, problème de l’action
  const { liste } = (await searchParams) ?? {}
  const returnTo = `/mes-jeunes/${jeune.id}/actions/${action.id}?misc=${unsafeRandomId()}`
  const returnToListe =
    liste === 'pilotage'
      ? '/pilotage'
      : `/mes-jeunes/${jeune.id}?onglet=actions`

  return (
    <>
      <PageHeaderPortal header='Qualifier l’action' />
      <PageRetourPortal lien={returnTo} />

      <QualificationPage
        action={action}
        categories={categories}
        returnTo={returnTo}
        returnToListe={returnToListe}
      />
    </>
  )
}
