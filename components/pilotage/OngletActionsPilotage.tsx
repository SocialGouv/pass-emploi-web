import React, { useState } from 'react'

import EmptyStateImage from 'assets/images/illustration-event-grey.svg'
import TableauActionsAQualifier from 'components/pilotage/TableauActionsAQualifier'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import Pagination from 'components/ui/Table/Pagination'
import { ActionPilotage } from 'interfaces/action'
import { CODE_QUALIFICATION_NON_SNP } from 'interfaces/json/action'
import { AlerteParam } from 'referentiel/alerteParam'
import { TriActionsAQualifier } from 'services/actions.service'
import { MetadonneesPagination } from 'types/pagination'
import { useAlerte } from 'utils/alerteContext'

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
  onLienExterne: (label: string) => void
}

export default function OngletActionsPilotage({
  actionsInitiales,
  metadonneesInitiales,
  getActions,
  onLienExterne,
}: OngletActionsPilotageProps) {
  const [_, setAlerte] = useAlerte()
  const [actions, setActions] = useState<ActionPilotage[]>(actionsInitiales)
  const [metadonnees, setMetadonnees] =
    useState<MetadonneesPagination>(metadonneesInitiales)
  const [actionsEnErreur, setActionsEnErreur] = useState<boolean>(false)

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

  async function qualifierActions(
    qualificationSNP: boolean,
    actionsSelectionnees: Array<{ idAction: string; codeQualification: string }>
  ) {
    setActionsEnErreur(false)
    const { qualifierActions: _qualifierActions } = await import(
      'services/actions.service'
    )

    let actionsPayload = [...actionsSelectionnees]
    if (!qualificationSNP) {
      actionsPayload = actionsPayload.map((a) => ({
        ...a,
        codeQualification: CODE_QUALIFICATION_NON_SNP,
      }))
    }
    const { idsActionsEnErreur } = await _qualifierActions(
      actionsPayload,
      qualificationSNP
    )

    let actionsQualifiees = actionsSelectionnees
    if (idsActionsEnErreur.length) {
      setActionsEnErreur(true)
      actionsQualifiees = actionsSelectionnees.filter(
        (action) => !idsActionsEnErreur.some((id) => id === action.idAction)
      )
    } else
      setAlerte(
        qualificationSNP
          ? AlerteParam.multiQualificationSNP
          : AlerteParam.multiQualificationNonSNP
      )
    setActions(
      actions.filter(
        (action) => !actionsQualifiees.some((a) => a.idAction === action.id)
      )
    )
  }

  return (
    <>
      {actionsEnErreur && (
        <FailureAlert
          label='Certaines actions n’ont pas pu être qualifiées.'
          onAcknowledge={() => setActionsEnErreur(false)}
        />
      )}

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
            onLienExterne={onLienExterne}
            onQualification={qualifierActions}
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
