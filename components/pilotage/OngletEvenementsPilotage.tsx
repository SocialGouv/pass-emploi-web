import React, { useEffect, useRef, useState } from 'react'

import TableauAnimationsAClore from 'components/pilotage/TableauAnimationsAClore'
import Pagination from 'components/ui/Table/Pagination'
import {
  AnimationCollectivePilotage,
  MetadonneesAnimationsCollectives,
} from 'interfaces/evenement'

interface OngletEvenementsPilotageProps {
  evenementsInitiaux?: AnimationCollectivePilotage[]
  metadonneesInitiales?: MetadonneesAnimationsCollectives
  getEvenements: (page: number) => Promise<{
    evenements: AnimationCollectivePilotage[]
    metadonnees: MetadonneesAnimationsCollectives
  }>
}

export function OngletEvenementsPilotage({
  evenementsInitiaux,
  metadonneesInitiales,
  getEvenements,
}: OngletEvenementsPilotageProps) {
  const [evenements, setEvenements] = useState<
    AnimationCollectivePilotage[] | undefined
  >(evenementsInitiaux)
  const [metadonnees, setMetadonnees] = useState<
    MetadonneesAnimationsCollectives | undefined
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
      getEvenements(pageCourante).then((update) => {
        setEvenements(update.evenements)
        setMetadonnees(update.metadonnees)
        setPageCourante(Math.min(pageCourante, update.metadonnees.nombrePages))
      })
    }
  }, [pageCourante])

  return (
    <>
      {!metadonnees && (
        <p className='text-base-bold mb-2'>
          Vous devez renseigner votre Mission locale pour pouvoir consulter ses
          animations collectives.
        </p>
      )}

      {metadonnees && metadonnees.nombreTotal === 0 && (
        <p className='text-base-bold mb-2'>
          Vous n’avez pas d’animation collective à clore.
        </p>
      )}

      {metadonnees && metadonnees.nombreTotal > 0 && (
        <>
          <TableauAnimationsAClore evenements={evenements!} />
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
