import React from 'react'

import EmptyStateImage from 'assets/images/empty_state.svg'
import OffreEmploiCard from 'components/offres/OffreEmploiCard'
import ServiceCiviqueCard from 'components/offres/ServiceCiviqueCard'
import Pagination from 'components/ui/Table/Pagination'
import { BaseOffre, TypeOffre } from 'interfaces/offre'

type ResultatsRechercheOffreProps = {
  isSearching: boolean
  offres: BaseOffre[] | undefined
  nbTotal: number | undefined
  pageCourante: number
  nbPages: number
  onChangerPage: (page: number) => void
}

export default function ResultatsRechercheOffre({
  isSearching,
  offres,
  nbTotal,
  pageCourante,
  nbPages,
  onChangerPage,
}: ResultatsRechercheOffreProps) {
  return (
    <div className={isSearching ? 'animate-pulse' : ''}>
      {isSearching && <ResultTitle total={nbTotal} />}

      {offres && offres.length > 0 && (
        <>
          <ResultTitle total={nbTotal} />
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
          <ResultTitle total={nbTotal} />
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

      {nbPages > 1 && (
        <Pagination
          pageCourante={pageCourante}
          nombreDePages={nbPages}
          allerALaPage={onChangerPage}
          nombrePagesLimite={100} // Contrainte technique des partenaires
        />
      )}
    </div>
  )
}

function ResultTitle({ total }: { total: number | undefined }) {
  return (
    <h2 id='result-title' className='text-m-medium text-primary mb-5'>
      Liste des résultats
      {total !== undefined &&
        ` (${total > 1000 ? 'plus de 1000' : total} offres)`}
    </h2>
  )
}
