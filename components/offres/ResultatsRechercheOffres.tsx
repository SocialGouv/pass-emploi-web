import React from 'react'

import EmptyState from 'components/EmptyState'
import ImmersionCard from 'components/offres/ImmersionCard'
import OffreEmploiCard from 'components/offres/OffreEmploiCard'
import ServiceCiviqueCard from 'components/offres/ServiceCiviqueCard'
import { IllustrationName } from 'components/ui/IllustrationComponent'
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
                {(offre.type === TypeOffre.EMPLOI ||
                  offre.type === TypeOffre.ALTERNANCE) && (
                  <OffreEmploiCard offre={offre} withPartage={true} />
                )}
                {offre.type === TypeOffre.SERVICE_CIVIQUE && (
                  <ServiceCiviqueCard offre={offre} withPartage={true} />
                )}
                {offre.type === TypeOffre.IMMERSION && (
                  <ImmersionCard offre={offre} withPartage={true} />
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      {offres && offres.length === 0 && (
        <>
          <ResultTitle total={nbTotal} />
          <EmptyState
            illustrationName={IllustrationName.Search}
            titre='Pour le moment, aucune offre ne correspond à vos critères.'
            sousTitre='Modifiez vos critères de recherche ou partagez ces critères tels quels aux bénéficiaires.'
          />
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
  function scrollToRef(element: HTMLHeadingElement | null) {
    if (element) element.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <h2
      ref={scrollToRef}
      id='result-title'
      className='text-m-medium text-primary mb-5'
    >
      Liste des résultats
      {total !== undefined &&
        ` (${total > 1000 ? 'plus de 1000' : total} offres)`}
    </h2>
  )
}
