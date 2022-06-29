import React, { useState } from 'react'

import { TableauActionsJeune } from 'components/action/TableauActionsJeune'
import { IntegrationPoleEmploi } from 'components/jeune/IntegrationPoleEmploi'
import Pagination from 'components/ui/Pagination'
import { Action, MetadonneesActions, StatutAction } from 'interfaces/action'
import { BaseJeune } from 'interfaces/jeune'

interface OngletActionsProps {
  poleEmploi: boolean
  jeune: BaseJeune
  actionsInitiales: {
    actions: Action[]
    page: number
    metadonnees: MetadonneesActions
  }
  getActions: (
    page: number,
    statuts: StatutAction[]
  ) => Promise<{ actions: Action[]; metadonnees: MetadonneesActions }>
}

export function OngletActions({
  actionsInitiales,
  getActions,
  jeune,
  poleEmploi,
}: OngletActionsProps) {
  const [filtres, setFiltres] = useState<StatutAction[]>([])
  const [actionsAffichees, setActionsAffichees] = useState<Action[]>(
    actionsInitiales.actions
  )
  const [nombrePages, setNombrePages] = useState<number>(
    actionsInitiales.metadonnees.nombrePages
  )
  const [pageCourante, setPageCourante] = useState<number>(
    actionsInitiales.page
  )
  const [isLoading, setIsLoading] = useState<boolean>(false)

  async function rechargerActions(page: number, statuts: StatutAction[]) {
    if (page < 1 || page > nombrePages) return
    if (
      page === pageCourante &&
      statuts.every((statut) => filtres.includes(statut)) &&
      filtres.every((filtre) => statuts.includes(filtre))
    )
      return

    setPageCourante(page)
    setIsLoading(true)
    const { actions, metadonnees } = await getActions(page, statuts)

    setActionsAffichees(actions)
    setNombrePages(metadonnees.nombrePages)
    setFiltres(statuts)
    setIsLoading(false)
  }

  return (
    <>
      {poleEmploi && <IntegrationPoleEmploi label='actions et démarches' />}

      {!poleEmploi && (
        <>
          <TableauActionsJeune
            jeune={jeune}
            actions={actionsAffichees}
            isLoading={isLoading}
            filtrerActions={(statuts) => rechargerActions(1, statuts)}
          />
          {nombrePages > 1 && (
            <div className='mt-6'>
              <Pagination
                nomListe='actions'
                nombreDePages={nombrePages}
                pageCourante={pageCourante}
                allerALaPage={(pageCible) =>
                  rechargerActions(pageCible, filtres)
                }
              />
            </div>
          )}
        </>
      )}
    </>
  )
}
