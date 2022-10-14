import React from 'react'

import EmptyStateImage from 'assets/images/empty_state.svg'
import OffreEmploiCard from 'components/offres/OffreEmploiCard'
import ServiceCiviqueCard from 'components/offres/ServiceCiviqueCard'
import { BaseOffre, TypeOffre } from 'interfaces/offre'

type ResultatsRechercheOffreProps = {
  isSearching: boolean
  offres: BaseOffre[] | undefined
}

export default function ResultatsRechercheOffre({
  isSearching,
  offres,
}: ResultatsRechercheOffreProps) {
  return (
    <>
      {isSearching && <ResultTitle pulse={true} />}

      {offres && offres.length > 0 && (
        <>
          <ResultTitle />
          <ul aria-describedby='result-title'>
            {offres.map((offre) => (
              <li key={`${offre.type}-${offre.id}`} className='mb-4'>
                {offre.type === TypeOffre.EMPLOI && (
                  <OffreEmploiCard offre={offre} withPartage={true} />
                )}
                {offre.type === TypeOffre.SERVICE_CIVIQUE && (
                  <ServiceCiviqueCard offre={offre} />
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      {offres && offres.length === 0 && (
        <>
          <ResultTitle />
          <EmptyStateImage
            focusable='false'
            aria-hidden='true'
            className='m-auto w-[200px] h-[200px]'
          />
          <p className='text-base-bold text-center'>
            Aucune offre ne correspond à vos critères de recherche.
          </p>
        </>
      )}
    </>
  )
}

function ResultTitle({ pulse = false }: { pulse?: boolean }) {
  let style: string = 'text-m-medium text-primary mb-5'
  if (pulse) style += ' animate-pulse'

  return (
    <h2 id='result-title' className={style}>
      Liste des résultats
    </h2>
  )
}
