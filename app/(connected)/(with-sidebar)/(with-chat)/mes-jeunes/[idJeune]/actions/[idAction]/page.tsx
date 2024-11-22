import { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import React from 'react'

import DetailActionPage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/actions/[idAction]/DetailActionPage'
import {
  PageFilArianePortal,
  PageHeaderPortal,
} from 'components/PageNavigationPortals'
import { estUserMilo } from 'interfaces/conseiller'
import { getAction } from 'services/actions.service'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

type DetailActionParams = { idJeune: string; idAction: string }

export async function generateMetadata({
  params,
}: {
  params: DetailActionParams
}): Promise<Metadata> {
  const { user, accessToken } = await getMandatorySessionServerSide()
  if (!estUserMilo(user)) notFound()

  const actionEtJeune = await getAction(params.idAction, accessToken)
  if (!actionEtJeune) notFound()

  const { action, jeune } = actionEtJeune
  const lectureSeule = jeune.idConseiller !== user.id

  return {
    title: `${action.titre} - Actions de ${jeune.prenom} ${jeune.nom} - ${
      lectureSeule ? 'Etablissement' : 'Portefeuille'
    }`,
  }
}

export default async function DetailAction({
  params,
}: {
  params: DetailActionParams
}) {
  const { user, accessToken } = await getMandatorySessionServerSide()
  console.log('>>>', { user })
  if (!estUserMilo(user)) notFound()
  const { idJeune, idAction } = params

  const actionEtJeune = await getAction(idAction, accessToken)
  if (!actionEtJeune) notFound()
  if (idJeune !== actionEtJeune.jeune.id) notFound()

  const { action, jeune } = actionEtJeune
  const lectureSeule = jeune.idConseiller !== user.id

  const referer = headers().get('referer')
  const refererEstPilotage = /\/pilotage$/
  const from =
    referer && refererEstPilotage.test(referer) ? 'pilotage' : 'beneficiaire'

  return (
    <>
      <PageFilArianePortal />
      <PageHeaderPortal header='Détails de l’action' />

      <DetailActionPage
        from={from}
        action={action}
        jeune={jeune}
        lectureSeule={lectureSeule}
      />
    </>
  )
}
