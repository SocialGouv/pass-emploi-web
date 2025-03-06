import React from 'react'

import TileIndicateur from 'components/ui/TileIndicateur'
import { MetadonneesFavoris } from 'interfaces/beneficiaire'

type ResumeFavorisJeuneProps = {
  metadonneesFavoris: MetadonneesFavoris
}

export default function ResumeFavorisBeneficiaire({
  metadonneesFavoris: { offres, recherches },
}: ResumeFavorisJeuneProps) {
  return (
    <div className='border border-solid rounded-base w-full p-4 border-grey_100 flex flex-wrap gap-6'>
      <div className='text-content_color text-base-bold'>
        <h3 className='mb-2'>Offres</h3>
        <ul className='flex gap-2'>
          <TileIndicateur
            valeur={offres.nombreOffresEmploi.toString()}
            label={offres.nombreOffresEmploi > 1 ? 'Emplois' : 'Emploi'}
            color='PRIMARY'
          />
          <TileIndicateur
            valeur={offres.nombreOffresAlternance.toString()}
            label={
              offres.nombreOffresAlternance > 1 ? 'Alternances' : 'Alternance'
            }
            color='PRIMARY'
          />
          <TileIndicateur
            valeur={offres.nombreOffresServiceCivique.toString()}
            label={
              offres.nombreOffresServiceCivique > 1
                ? 'Services civiques'
                : 'Service civique'
            }
            color='PRIMARY'
          />
          <TileIndicateur
            valeur={offres.nombreOffresImmersion.toString()}
            label={
              offres.nombreOffresImmersion > 1 ? 'Immersions' : 'Immersion'
            }
            color='PRIMARY'
          />
        </ul>
      </div>
      <div className='text-content_color text-base-bold'>
        <h3 className='mb-2'>Recherches</h3>
        <div className='flex gap-2'>
          <TileIndicateur
            valeur={recherches.total.toString()}
            label={recherches.total > 1 ? 'Alertes' : 'Alerte'}
            color='PRIMARY'
          />
        </div>
      </div>
    </div>
  )
}
