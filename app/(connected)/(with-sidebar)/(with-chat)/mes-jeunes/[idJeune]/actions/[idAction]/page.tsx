import { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { Session } from 'next-auth'
import React from 'react'

import DetailActionPage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/actions/[idAction]/DetailActionPage'
import {
  PageFilArianePortal,
  PageHeaderPortal,
} from 'components/PageNavigationPortals'
import { Action } from 'interfaces/action'
import { estConseillerReferent } from 'interfaces/conseiller'
import { estMilo } from 'interfaces/structure'
import { getAction } from 'services/actions.service'
import getMandatorySessionServerSide from 'utils/auth/getMandatorySessionServerSide'

type DetailActionParams = Promise<{ idJeune: string; idAction: string }>

export async function generateMetadata({
  params,
}: {
  params: DetailActionParams
}): Promise<Metadata> {
  const { action, user } = await buildProps(params)

  return {
    title: `${action.titre} - Actions de ${action.beneficiaire.prenom} ${action.beneficiaire.nom} - ${
      estConseillerReferent(user, action.beneficiaire)
        ? 'Portefeuille'
        : 'Etablissement'
    }`,
  }
}

export default async function DetailAction({
  params,
}: {
  params: DetailActionParams
}) {
  const { action } = await buildProps(params)

  const referer = (await headers()).get('referer')
  const from =
    referer && /\/pilotage$/.test(referer) ? 'pilotage' : 'beneficiaire'

  return (
    <>
      <PageFilArianePortal />
      <PageHeaderPortal header='Détails de l’action' />

      <DetailActionPage from={from} action={action} />
    </>
  )
}

async function buildProps(
  params: DetailActionParams
): Promise<{ action: Action; user: Session.HydratedUser }> {
  const { user, accessToken } = await getMandatorySessionServerSide()
  if (!estMilo(user.structure)) notFound()
  const { idJeune, idAction } = await params

  const action = await getAction(idAction, accessToken)
  if (!action) notFound()
  if (idJeune !== action.beneficiaire.id) notFound()

  return { action, user }
}
