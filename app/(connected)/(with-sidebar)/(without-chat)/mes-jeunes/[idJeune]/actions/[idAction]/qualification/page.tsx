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
import { getAction } from 'services/actions.service'
import { getSituationsNonProfessionnelles } from 'services/referentiel.service'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

type QualificationParams = { idAction: string }
type QualificationSearchParams = Partial<{ liste: string }>

export async function generateMetadata({
  params,
}: {
  params: QualificationParams
}): Promise<Metadata> {
  const { accessToken } = await getMandatorySessionServerSide()

  const actionContent = await getAction(params.idAction, accessToken)

  return {
    title: `Qualifier l’action ${actionContent?.action.titre} - ${actionContent?.jeune.prenom} ${actionContent?.jeune.prenom}`,
  }
}
export default async function Qualification({
  params,
  searchParams,
}: {
  params: QualificationParams
  searchParams?: QualificationSearchParams
}) {
  const { user, accessToken } = await getMandatorySessionServerSide()
  if (!estUserMilo(user)) notFound()

  const [actionContent, categories] = await Promise.all([
    getAction(params.idAction, accessToken),
    getSituationsNonProfessionnelles({ avecNonSNP: true }, accessToken),
  ])
  if (!actionContent) notFound()

  const { action, jeune } = actionContent
  if (action.status !== StatutAction.Terminee) notFound()

  const returnTo = `/mes-jeunes/${jeune.id}/actions/${action.id}`
  const returnToListe =
    searchParams?.liste === 'pilotage'
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
