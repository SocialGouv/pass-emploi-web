import React, { useState } from 'react'

import EmptyStateImage from 'assets/images/illustration-event-grey.svg'
import TableauActionsAQualifier from 'components/pilotage/TableauActionsAQualifier'
import Pagination from 'components/ui/Table/Pagination'
import { ActionPilotage } from 'interfaces/action'
import { TriActionsAQualifier } from 'services/actions.service'
import { MetadonneesPagination } from 'types/pagination'

interface OngletActionsPilotageProps {
  actionsInitiales: ActionPilotage[]
  metadonneesInitiales: MetadonneesPagination
  getActions: (
    page: number,
    tri?: TriActionsAQualifier
  ) => Promise<{
    actions: ActionPilotage[]
    metadonnees: MetadonneesPagination
  }>
}

export default function OngletActionsPilotage({
  actionsInitiales,
  metadonneesInitiales,
  getActions,
}: OngletActionsPilotageProps) {
  const [actions, setActions] = useState<ActionPilotage[]>(actionsInitiales)
  const [metadonnees, setMetadonnees] =
    useState<MetadonneesPagination>(metadonneesInitiales)

  const [page, setPage] = useState<number>(1)
  const [tri, setTri] = useState<TriActionsAQualifier>()

  async function trierActions(nouveauTri: TriActionsAQualifier) {
    setTri(nouveauTri)
    const update = await getActions(page, nouveauTri)
    setActions(update.actions)
    setMetadonnees(update.metadonnees)
  }

  async function changerPage(nouvellePage: number) {
    if (nouvellePage < 1 || nouvellePage > metadonnees.nombrePages) return
    setPage(nouvellePage)
    const update = await getActions(nouvellePage, tri ?? undefined)
    setActions(update.actions)
    setMetadonnees(update.metadonnees)
  }

  return (
    <>
      {metadonnees.nombreTotal === 0 && (
        <div className='bg-grey_100 flex flex-col justify-center items-center'>
          <EmptyStateImage
            focusable='false'
            aria-hidden='true'
            className='w-[360px] h-[200px]'
          />
          <p className='mt-4 text-base-medium w-2/3 text-center'>
            Vous n’avez pas d’action à qualifier.
          </p>
        </div>
      )}

      {metadonnees.nombreTotal > 0 && (
        <>
          <TableauActionsAQualifier
            actions={actions}
            tri={tri}
            onTriActions={trierActions}
          />
          {metadonnees.nombrePages > 1 && (
            <div className='mt-6'>
              <Pagination
                nomListe='actions'
                nombreDePages={metadonnees.nombrePages}
                pageCourante={page}
                allerALaPage={changerPage}
              />
            </div>
          )}
        </>
      )}
    </>
  )
}
