import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import ModificationPage from 'app/(connected)/(with-sidebar)/(without-chat)/mes-jeunes/[jeune_id]/actions/[action_id]/modification/ModificationActionPage'
import {
  PageHeaderPortal,
  PageRetourPortal,
} from 'components/PageNavigationPortals'
import { StatutAction } from 'interfaces/action'
import { StructureConseiller } from 'interfaces/conseiller'
import {
  getAction,
  getSituationsNonProfessionnelles,
  recupererLesCommentaires,
} from 'services/actions.service'
import { getActionsPredefinies } from 'services/referentiel.service'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

type ModificationActionParams = { action_id: string }

export async function generateMetadata({
  params,
}: {
  params: ModificationActionParams
}): Promise<Metadata> {
  const { accessToken } = await getMandatorySessionServerSide()
  const actionContent = await getAction(params.action_id, accessToken)

  return {
    title: `Modifier l’action ${actionContent?.action.content} - ${actionContent?.jeune.prenom} ${actionContent?.jeune.nom}`,
  }
}

type ModificationParams = { action_id: string }
export default async function ModificationAction({
  params,
}: {
  params: ModificationParams
}) {
  const { user, accessToken } = await getMandatorySessionServerSide()
  if (user.structure === StructureConseiller.POLE_EMPLOI) notFound()

  const [actionContent, situationsNonProfessionnelles, actionsPredefinies] =
    await Promise.all([
      getAction(params.action_id, accessToken),
      getSituationsNonProfessionnelles({ avecNonSNP: false }, accessToken),
      getActionsPredefinies(accessToken),
    ])
  if (!actionContent) notFound()

  const { action, jeune } = actionContent
  if (action.status === StatutAction.Qualifiee) notFound()

  const commentaires = await recupererLesCommentaires(
    params.action_id as string,
    accessToken
  )
  if (!commentaires) notFound()

  const returnTo = `/mes-jeunes/${jeune.id}/actions/${action.id}`
  return (
    <>
      <PageHeaderPortal header='Modifier l’action' />
      <PageRetourPortal lien={returnTo} />

      <ModificationPage
        action={action}
        actionsPredefinies={actionsPredefinies}
        aDesCommentaires={commentaires.length > 0}
        idJeune={jeune.id}
        situationsNonProfessionnelles={situationsNonProfessionnelles}
        returnTo={returnTo}
      />
    </>
  )
}
