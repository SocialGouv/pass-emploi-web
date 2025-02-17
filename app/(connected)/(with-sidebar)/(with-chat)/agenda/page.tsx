import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import AgendaPage from 'app/(connected)/(with-sidebar)/(with-chat)/agenda/AgendaPage'
import { PageHeaderPortal } from 'components/PageNavigationPortals'
import { estMilo } from 'interfaces/structure'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

export const metadata: Metadata = {
  title: 'Tableau de bord - Agenda',
}

type AgendaSearchParams = Promise<{
  periodeIndex?: string
  onglet?: string
}>
export default async function Agenda({
  searchParams,
}: {
  searchParams?: AgendaSearchParams
}) {
  const { user } = await getMandatorySessionServerSide()
  if (!estMilo(user.structure)) notFound()

  const { periodeIndex, onglet } = (await searchParams) ?? {}
  return (
    <>
      <PageHeaderPortal header='Agenda' />

      <AgendaPage
        periodeIndexInitial={periodeIndex ? parseInt(periodeIndex) : 0}
        onglet={onglet === 'conseiller' ? 'CONSEILLER' : 'ETABLISSEMENT'}
      />
    </>
  )
}
