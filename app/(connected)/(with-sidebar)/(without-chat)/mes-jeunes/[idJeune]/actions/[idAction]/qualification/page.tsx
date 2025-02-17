import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import QualificationPage from 'app/(connected)/(with-sidebar)/(without-chat)/mes-jeunes/[idJeune]/actions/[idAction]/qualification/QualificationPage'
import {
  PageHeaderPortal,
  PageRetourPortal,
} from 'components/PageNavigationPortals'
import { StatutAction } from 'interfaces/action'
import { estMilo } from 'interfaces/structure'
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
  const action = await getAction(idAction, accessToken)

  return {
    title: `Qualifier l’action ${action?.titre} - ${action?.beneficiaire.prenom} ${action?.beneficiaire.prenom}`,
  }
}
export default async function Qualification({
  params,
  searchParams,
}: RouteProps) {
  const { user, accessToken } = await getMandatorySessionServerSide()
  if (!estMilo(user.structure)) notFound()

  const { getAction, getSituationsNonProfessionnelles } = await import(
    'services/actions.service'
  )
  const { idAction } = await params
  const [action, categories] = await Promise.all([
    getAction(idAction, accessToken),
    getSituationsNonProfessionnelles({ avecNonSNP: true }, accessToken),
  ])
  if (!action) notFound()

  if (action.status !== StatutAction.TermineeAQualifier) notFound()

  // FIXME : dirty fix, problème de l’action
  const { liste } = (await searchParams) ?? {}
  const returnTo = `/mes-jeunes/${action.beneficiaire.id}/actions/${action.id}?misc=${unsafeRandomId()}`
  const returnToListe =
    liste === 'pilotage'
      ? '/pilotage'
      : `/mes-jeunes/${action.beneficiaire.id}?onglet=actions`

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
