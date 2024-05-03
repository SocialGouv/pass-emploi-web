import React, { useState } from 'react'

import { ApiError } from '../../utils/httpClient'
import IllustrationComponent, {
  IllustrationName,
} from '../ui/IllustrationComponent'

import TableauActionsAQualifier from 'components/pilotage/TableauActionsAQualifier'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import Pagination from 'components/ui/Table/Pagination'
import { ActionPilotage, SituationNonProfessionnelle } from 'interfaces/action'
import { CODE_QUALIFICATION_NON_SNP } from 'interfaces/json/action'
import { AlerteParam } from 'referentiel/alerteParam'
import { TriActionsAQualifier } from 'services/actions.service'
import { MetadonneesPagination } from 'types/pagination'
import { useAlerte } from 'utils/alerteContext'

interface OngletActionsPilotageProps {
  categories: SituationNonProfessionnelle[]
  actionsInitiales: ActionPilotage[]
  metadonneesInitiales: MetadonneesPagination
  getActions: (options: {
    page: number
    tri?: TriActionsAQualifier
    filtres?: string[]
  }) => Promise<{
    actions: ActionPilotage[]
    metadonnees: MetadonneesPagination
  }>
  onLienExterne: (label: string) => void
}

export default function OngletActionsPilotage({
  categories,
  actionsInitiales,
  metadonneesInitiales,
  getActions,
  onLienExterne,
}: OngletActionsPilotageProps) {
  const [_, setAlerte] = useAlerte()
  const [actions, setActions] = useState<ActionPilotage[]>(actionsInitiales)
  const [actionsFiltrees, setActionsFitrees] =
    useState<ActionPilotage[]>(actionsInitiales)
  const [metadonnees, setMetadonnees] =
    useState<MetadonneesPagination>(metadonneesInitiales)

  const [page, setPage] = useState<number>(1)
  const [tri, setTri] = useState<TriActionsAQualifier>()
  const [filtres, setFiltres] = useState<string[]>([])
  const [erreurQualification, setErreurQualification] = useState<
    string | undefined
  >()

  async function trierActions(nouveauTri: TriActionsAQualifier) {
    setTri(nouveauTri)
    const update = await getActions({ page, tri: nouveauTri, filtres })
    setActionsFitrees(update.actions)
    setMetadonnees(update.metadonnees)
  }

  async function filtrerActions(categoriesSelectionnees: string[]) {
    const update = await getActions({
      page: 1,
      tri,
      filtres: categoriesSelectionnees,
    })
    setPage(1)
    setFiltres(categoriesSelectionnees)
    setActionsFitrees(update.actions)
    setMetadonnees(update.metadonnees)
  }

  async function changerPage(nouvellePage: number) {
    if (nouvellePage < 1 || nouvellePage > metadonnees.nombrePages) return
    setPage(nouvellePage)
    const update = await getActions({ page: nouvellePage, tri, filtres })
    setActionsFitrees(update.actions)
    setMetadonnees(update.metadonnees)
  }

  async function qualifierActions(
    qualificationSNP: boolean,
    actionsSelectionnees: Array<{ idAction: string; codeQualification: string }>
  ) {
    document.querySelector('header')?.scrollIntoView({ behavior: 'smooth' })

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
    setErreurQualification(undefined)
    try {
      const { idsActionsEnErreur } = await _qualifierActions(
        actionsPayload,
        qualificationSNP
      )

      let actionsQualifiees = actionsSelectionnees

      if (idsActionsEnErreur.length) {
        setErreurQualification(
          'Suite à un problème inconnu la qualification a échoué. Vous pouvez réessayer.'
        )
        actionsQualifiees = actionsSelectionnees.filter(
          (action) => !idsActionsEnErreur.some((id) => id === action.idAction)
        )
      } else
        setAlerte(
          qualificationSNP
            ? AlerteParam.multiQualificationSNP
            : AlerteParam.multiQualificationNonSNP
        )

      const nouvellesActions = actions.filter(
        (action) => !actionsQualifiees.some((a) => a.idAction === action.id)
      )

      setActions(nouvellesActions)
      setActionsFitrees(nouvellesActions)
    } catch (error) {
      setErreurQualification(
        error instanceof ApiError && error.statusCode !== 500
          ? error.message
          : 'Suite à un problème inconnu la qualification a échoué. Vous pouvez réessayer.'
      )
      document.querySelector('header')?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      {erreurQualification && (
        <FailureAlert
          label={erreurQualification}
          onAcknowledge={() => setErreurQualification(undefined)}
        />
      )}

      {actions.length === 0 && (
        <div className='bg-grey_100 flex flex-col justify-center items-center'>
          <IllustrationComponent
            name={IllustrationName.EventWhite}
            className='w-48 h-48'
            aria-hidden={true}
            focusable={false}
          />
          <p className='mt-2 mb-12 text-base-medium w-2/3 text-center'>
            Vous n’avez pas d’action à qualifier.
          </p>
        </div>
      )}

      {actions.length > 0 && (
        <>
          <TableauActionsAQualifier
            categories={categories}
            actionsFiltrees={actionsFiltrees}
            tri={tri}
            onTri={trierActions}
            onFiltres={filtrerActions}
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
