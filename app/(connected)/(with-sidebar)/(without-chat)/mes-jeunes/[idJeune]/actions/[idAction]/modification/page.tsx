import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import ModificationPage from 'app/(connected)/(with-sidebar)/(without-chat)/mes-jeunes/[idJeune]/actions/[idAction]/modification/ModificationActionPage'
import {
  PageHeaderPortal,
  PageRetourPortal,
} from 'components/PageNavigationPortals'
import { StatutAction } from 'interfaces/action'
import { estUserMilo } from 'interfaces/conseiller'
import { getAction } from 'services/actions.service'
import {
  getActionsPredefinies,
  getSituationsNonProfessionnelles,
} from 'services/referentiel.service'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

type ModificationActionParams = { idAction: string }

export async function generateMetadata({
  params,
}: {
  params: ModificationActionParams
}): Promise<Metadata> {
  const { accessToken } = await getMandatorySessionServerSide()
  const actionContent = await getAction(params.idAction, accessToken)

  return {
    title: `Modifier l’action ${actionContent?.action.titre} - ${actionContent?.jeune.prenom} ${actionContent?.jeune.nom}`,
  }
}

type ModificationParams = { idAction: string }
export default async function ModificationAction({
  params,
}: {
  params: ModificationParams
}) {
  const { user, accessToken } = await getMandatorySessionServerSide()
  if (!estUserMilo(user)) notFound()

  const [actionContent, situationsNonProfessionnelles, actionsPredefinies] =
    await Promise.all([
      getAction(params.idAction, accessToken),
      getSituationsNonProfessionnelles({ avecNonSNP: false }, accessToken),
      getActionsPredefinies(accessToken),
    ])
  if (!actionContent) notFound()

  const { action, jeune } = actionContent
  if (action.status === StatutAction.Qualifiee) notFound()

  const returnTo = `/mes-jeunes/${jeune.id}/actions/${action.id}?misc=${Math.random()}`
  return (
    <>
      <PageHeaderPortal header='Modifier l’action' />
      <PageRetourPortal lien={returnTo} />

      <ModificationPage
        action={action}
        actionsPredefinies={actionsPredefinies}
        idBeneficiaire={jeune.id}
        situationsNonProfessionnelles={situationsNonProfessionnelles}
        returnTo={returnTo}
      />
    </>
  )
}
