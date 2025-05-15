import React, { useEffect, useRef, useState } from 'react'

import EmptyState from 'components/EmptyState'
import TableauRdvsEtAnimationsCollectivesAClore from 'components/pilotage/TableauRdvsEtAnimationsCollectivesAClore'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import Pagination from 'components/ui/Table/Pagination'
import { RdvEtAnimationCollectivePilotage } from 'interfaces/evenement'
import { MetadonneesPilotage } from 'types/pagination'

interface OngletRdvsEtAnimationsCollectivesPilotageProps {
  rdvsEtAnimationsCollectivesInitiaux?: RdvEtAnimationCollectivePilotage[]
  metadonneesInitiales?: MetadonneesPilotage
  getRdvsEtAnimationsCollectives: (page: number) => Promise<{
    rdvsEtAnimationsCollectivesInitiaux: RdvEtAnimationCollectivePilotage[]
    metadonnees: MetadonneesPilotage
  }>
}

export default function OngletRdvsEtAnimationsCollectivesPilotage({
  rdvsEtAnimationsCollectivesInitiaux,
  metadonneesInitiales,
  getRdvsEtAnimationsCollectives,
}: OngletRdvsEtAnimationsCollectivesPilotageProps) {
  const [rdvsEtAnimationsCollectives, setRdvsEtAnimationsCollectives] =
    useState<RdvEtAnimationCollectivePilotage[] | undefined>(
      rdvsEtAnimationsCollectivesInitiaux
    )
  const [metadonnees, setMetadonnees] = useState<
    MetadonneesPilotage | undefined
  >(metadonneesInitiales)

  const [pageCourante, setPageCourante] = useState<number>(1)

  const pageChangee = useRef<boolean>(false)

  function changerPage(page: number) {
    if (page < 1 || page > metadonnees!.nombrePages) return
    setPageCourante(page)
    pageChangee.current = true
  }

  useEffect(() => {
    if (pageChangee.current) {
      getRdvsEtAnimationsCollectives(pageCourante).then((update) => {
        setRdvsEtAnimationsCollectives(
          update.rdvsEtAnimationsCollectivesInitiaux
        )
        setMetadonnees(update.metadonnees)
        setPageCourante(Math.min(pageCourante, update.metadonnees.nombrePages))
      })
    }
  }, [pageCourante])

  return (
    <>
      {metadonnees && metadonnees.nombreTotal === 0 && (
        <div className='flex flex-col justify-center items-center'>
          <EmptyState
            illustrationName={IllustrationName.Event}
            titre='Vous n’avez pas de rendez-vous ou d’animation collective à clore.'
          />
        </div>
      )}

      {metadonnees && metadonnees.nombreTotal > 0 && (
        <>
          <TableauRdvsEtAnimationsCollectivesAClore
            rdvsEtAnimationsCollectives={rdvsEtAnimationsCollectives!}
          />
          {metadonnees.nombrePages > 1 && (
            <div className='mt-6'>
              <Pagination
                nomListe='animations collectives'
                nombreDePages={metadonnees.nombrePages}
                pageCourante={pageCourante}
                allerALaPage={changerPage}
              />
            </div>
          )}
        </>
      )}
    </>
  )
}
