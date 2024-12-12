import { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import React from 'react'

import DetailActionPage, {
  DetailActionProps,
} from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/actions/[idAction]/DetailActionPage'
import {
  PageFilArianePortal,
  PageHeaderPortal,
} from 'components/PageNavigationPortals'
import { estUserMilo } from 'interfaces/conseiller'
import { getAction } from 'services/actions.service'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

type DetailActionParams = Promise<{ idJeune: string; idAction: string }>

export async function generateMetadata({
  params,
}: {
  params: DetailActionParams
}): Promise<Metadata> {
  const { action, jeune, lectureSeule } = await buildProps(params)

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
  const props = await buildProps(params)

  const referer = (await headers()).get('referer')
  const from =
    referer && /\/pilotage$/.test(referer) ? 'pilotage' : 'beneficiaire'

  return (
    <>
      <PageFilArianePortal />
      <PageHeaderPortal header='Détails de l’action' />

      <DetailActionPage from={from} {...props} />
    </>
  )
}

async function buildProps(
  params: DetailActionParams
): Promise<Omit<DetailActionProps, 'from'>> {
  const { user, accessToken } = await getMandatorySessionServerSide()
  if (!estUserMilo(user)) notFound()
  const { idJeune, idAction } = await params

  const actionEtJeune = await getAction(idAction, accessToken)
  if (!actionEtJeune) notFound()
  if (idJeune !== actionEtJeune.jeune.id) notFound()

  const { action, jeune } = actionEtJeune
  const lectureSeule = jeune.idConseiller !== user.id

  return { action, jeune, lectureSeule }
}
