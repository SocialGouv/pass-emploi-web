import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import ModificationPage from 'app/(connected)/(with-sidebar)/(without-chat)/mes-jeunes/[idJeune]/actions/[idAction]/modification/ModificationActionPage'
import {
  PageHeaderPortal,
  PageRetourPortal,
} from 'components/PageNavigationPortals'
import { StatutAction } from 'interfaces/action'
import { estMilo } from 'interfaces/structure'
import {
  getAction,
  getSituationsNonProfessionnelles,
} from 'services/actions.service'
import { getActionsPredefinies } from 'services/referentiel.service'
import getMandatorySessionServerSide from 'utils/auth/getMandatorySessionServerSide'
import { unsafeRandomId } from 'utils/helpers'

type ModificationActionParams = Promise<{ idAction: string }>

export async function generateMetadata({
  params,
}: {
  params: ModificationActionParams
}): Promise<Metadata> {
  const { accessToken } = await getMandatorySessionServerSide()
  const { idAction } = await params
  const action = await getAction(idAction, accessToken)

  return {
    title: `Modifier l’action ${action?.titre} - ${action?.beneficiaire.prenom} ${action?.beneficiaire.nom}`,
  }
}

export default async function ModificationAction({
  params,
}: {
  params: ModificationActionParams
}) {
  const { user, accessToken } = await getMandatorySessionServerSide()
  if (!estMilo(user.structure)) notFound()

  const { idAction } = await params
  const [action, situationsNonProfessionnelles, actionsPredefinies] =
    await Promise.all([
      getAction(idAction, accessToken),
      getSituationsNonProfessionnelles({ avecNonSNP: false }, accessToken),
      getActionsPredefinies(accessToken),
    ])
  if (!action) notFound()

  if (action.status === StatutAction.TermineeQualifiee) notFound()

  // FIXME : dirty fix, problème de rafraichissement de l’action
  const returnTo = `/mes-jeunes/${action.beneficiaire.id}/actions/${action.id}?misc=${unsafeRandomId()}`
  return (
    <>
      <PageHeaderPortal header='Modifier l’action' />
      <PageRetourPortal lien={returnTo} />

      <ModificationPage
        action={action}
        actionsPredefinies={actionsPredefinies}
        situationsNonProfessionnelles={situationsNonProfessionnelles}
        returnTo={returnTo}
      />
    </>
  )
}
