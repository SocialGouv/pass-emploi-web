import React, { useEffect, useRef, useState } from 'react'

import EmptyStateImage from 'assets/images/illustration-checklist-grey.svg'
import TableauActionsJeune from 'components/action/TableauActionsJeune'
import { IntegrationPoleEmploi } from 'components/jeune/IntegrationPoleEmploi'
import Pagination from 'components/ui/Table/Pagination'
import {
  Action,
  EtatQualificationAction,
  StatutAction,
} from 'interfaces/action'
import { Conseiller, estMilo, estPoleEmploi } from 'interfaces/conseiller'
import { BaseJeune } from 'interfaces/jeune'
import { MetadonneesPagination } from 'types/pagination'

interface OngletActionsProps {
  conseiller: Conseiller
  jeune: BaseJeune
  actionsInitiales: {
    actions: Action[]
    page: number
    metadonnees: MetadonneesPagination
  }
  getActions: (
    page: number,
    statuts: StatutAction[],
    etatsQualification: EtatQualificationAction[],
    tri: string
  ) => Promise<{ actions: Action[]; metadonnees: MetadonneesPagination }>
}

export enum TRI {
  dateDecroissante = 'date_decroissante',
  dateCroissante = 'date_croissante',
  dateEcheanceDecroissante = 'date_echeance_decroissante',
  dateEcheanceCroissante = 'date_echeance_croissante',
}

export default function OngletActions({
  actionsInitiales,
  getActions,
  jeune,
  conseiller,
}: OngletActionsProps) {
  const [actionsAffichees, setActionsAffichees] = useState<Action[]>(
    actionsInitiales.actions
  )
  const [tri, setTri] = useState<TRI>(TRI.dateEcheanceDecroissante)

  const [filtresParStatuts, setFiltresParStatuts] = useState<StatutAction[]>([])
  const [filtresParEtatsQualification, setFiltresParEtatsQualification] =
    useState<EtatQualificationAction[]>([])

  const [nombrePages, setNombrePages] = useState<number>(
    actionsInitiales.metadonnees.nombrePages
  )
  const [pageCourante, setPageCourante] = useState<number>(
    actionsInitiales.page
  )

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const stateChanged = useRef<boolean>(false)

  function changerPage(page: number) {
    if (page < 1 || page > nombrePages) return
    setPageCourante(page)
    stateChanged.current = true
  }

  function filtrerActions({
    statuts,
    etatsQualification,
  }: {
    statuts: StatutAction[]
    etatsQualification: EtatQualificationAction[]
  }) {
    if (
      statuts.every((statut) => filtresParStatuts.includes(statut)) &&
      filtresParStatuts.every((filtre) => statuts.includes(filtre)) &&
      etatsQualification.every((etat) =>
        filtresParEtatsQualification.includes(etat)
      ) &&
      filtresParEtatsQualification.every((filtre) =>
        etatsQualification.includes(filtre)
      )
    )
      return

    setFiltresParStatuts(statuts)
    setFiltresParEtatsQualification(etatsQualification)
    setPageCourante(1)
    stateChanged.current = true
  }

  function trierActions(nouveauTri: TRI) {
    setTri(nouveauTri)
    setPageCourante(1)
    stateChanged.current = true
  }

  useEffect(() => {
    if (stateChanged.current) {
      setIsLoading(true)

      getActions(
        pageCourante,
        filtresParStatuts,
        filtresParEtatsQualification,
        tri
      ).then(({ actions, metadonnees }) => {
        setActionsAffichees(actions)
        setNombrePages(metadonnees.nombrePages)
        setIsLoading(false)
      })
    }
  }, [tri, filtresParStatuts, filtresParEtatsQualification, pageCourante])

  return (
    <>
      {estPoleEmploi(conseiller) && (
        <IntegrationPoleEmploi label='actions et démarches' />
      )}

      {!estPoleEmploi(conseiller) && (
        <>
          {actionsInitiales.metadonnees.nombreTotal === 0 && (
            <div className='flex flex-col justify-center items-center'>
              <EmptyStateImage
                focusable={false}
                aria-hidden={true}
                className='w-[360px] h-[200px]'
              />
              <p className='mt-4 text-base-medium w-2/3 text-center'>
                {jeune.prenom} {jeune.nom} n’a pas encore d’action
              </p>
            </div>
          )}

          {actionsInitiales.metadonnees.nombreTotal > 0 && (
            <>
              <TableauActionsJeune
                afficherFiltresEtatsQualification={estMilo(conseiller)}
                jeune={jeune}
                actions={actionsAffichees}
                isLoading={isLoading}
                onFiltres={filtrerActions}
                onTri={trierActions}
                tri={tri}
              />
              {nombrePages > 1 && (
                <div className='mt-6'>
                  <Pagination
                    nomListe='actions'
                    nombreDePages={nombrePages}
                    pageCourante={pageCourante}
                    allerALaPage={changerPage}
                  />
                </div>
              )}
            </>
          )}
        </>
      )}
    </>
  )
}
