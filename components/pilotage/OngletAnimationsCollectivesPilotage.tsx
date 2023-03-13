import React, { useEffect, useRef, useState } from 'react'

import TableauAnimationsAClore from 'components/pilotage/TableauAnimationsAClore'
import Pagination from 'components/ui/Table/Pagination'
import { AnimationCollectivePilotage } from 'interfaces/evenement'
import { MetadonneesPagination } from 'types/pagination'

interface OngletAnimationsCollectivesPilotageProps {
  animationsCollectivesInitiales?: AnimationCollectivePilotage[]
  metadonneesInitiales?: MetadonneesPagination
  getAnimationsCollectives: (page: number) => Promise<{
    animationsCollectives: AnimationCollectivePilotage[]
    metadonnees: MetadonneesPagination
  }>
}

export function OngletAnimationsCollectivesPilotage({
  animationsCollectivesInitiales,
  metadonneesInitiales,
  getAnimationsCollectives,
}: OngletAnimationsCollectivesPilotageProps) {
  const [animationsCollectives, setAnimationsCollectives] = useState<
    AnimationCollectivePilotage[] | undefined
  >(animationsCollectivesInitiales)
  const [metadonnees, setMetadonnees] = useState<
    MetadonneesPagination | undefined
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
      getAnimationsCollectives(pageCourante).then((update) => {
        setAnimationsCollectives(update.animationsCollectives)
        setMetadonnees(update.metadonnees)
        setPageCourante(Math.min(pageCourante, update.metadonnees.nombrePages))
      })
    }
  }, [pageCourante])

  return (
    <>
      {metadonnees && metadonnees.nombreTotal === 0 && (
        <p className='text-base-bold mb-2'>
          Vous n’avez pas d’animation collective à clore.
        </p>
      )}

      {metadonnees && metadonnees.nombreTotal > 0 && (
        <>
          <TableauAnimationsAClore
            animationsCollectives={animationsCollectives!}
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
