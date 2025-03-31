import { DateTime } from 'luxon'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import AgendaPage from 'app/(connected)/(with-sidebar)/(with-chat)/agenda/AgendaPage'
import { PageHeaderPortal } from 'components/PageNavigationPortals'
import { estMilo } from 'interfaces/structure'
import getMandatorySessionServerSide from 'utils/auth/getMandatorySessionServerSide'

export const metadata: Metadata = {
  title: 'Tableau de bord - Agenda',
}

type AgendaSearchParams = Promise<{
  debut?: string
  onglet?: string
}>
export default async function Agenda({
  searchParams,
}: {
  searchParams?: AgendaSearchParams
}) {
  const { user } = await getMandatorySessionServerSide()
  if (!estMilo(user.structure)) notFound()

  const { debut, onglet } = (await searchParams) ?? {}
  // FIXME luxon throwOnInvalid
  const debutPeriodeInitiale =
    debut && DateTime.fromISO(debut).isValid ? debut : undefined

  return (
    <>
      <PageHeaderPortal header='Agenda' />

      <AgendaPage
        debutPeriodeInitiale={debutPeriodeInitiale}
        onglet={onglet === 'conseiller' ? 'CONSEILLER' : 'MISSION_LOCALE'}
      />
    </>
  )
}
