import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import AgendaPage from 'app/(connected)/(with-sidebar)/(with-chat)/agenda/AgendaPage'
import { PageHeaderPortal } from 'components/PageNavigationPortals'
import { estUserFranceTravail } from 'interfaces/conseiller'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

export const metadata: Metadata = {
  title: 'Tableau de bord - Agenda',
}

type AgendaSearchParams = {
  periodeIndex?: string
  onglet?: string
}
export default async function Agenda({
  searchParams,
}: {
  searchParams?: AgendaSearchParams
}) {
  const { user } = await getMandatorySessionServerSide()
  if (estUserFranceTravail(user)) notFound()

  const periodeIndex = searchParams?.periodeIndex
    ? parseInt(searchParams.periodeIndex)
    : 0
  const onglet =
    searchParams?.onglet === 'conseiller' ? 'CONSEILLER' : 'ETABLISSEMENT'

  return (
    <>
      <PageHeaderPortal header='Agenda' />

      <AgendaPage periodeIndexInitial={periodeIndex} onglet={onglet} />
    </>
  )
}
