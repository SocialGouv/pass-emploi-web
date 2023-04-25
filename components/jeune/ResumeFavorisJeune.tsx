import React from 'react'

import TileIndicateur from 'components/ui/TileIndicateur'
import { MetadonneesFavoris } from 'interfaces/jeune'

type ResumeFavorisJeuneProps = {
  metadonneesFavoris: MetadonneesFavoris
}

export function ResumeFavorisJeune({
  metadonneesFavoris: { offres, recherches },
}: ResumeFavorisJeuneProps) {
  return (
    <div className='border border-solid rounded-base w-full p-4 border-grey_100'>
      <h2 className='text-m-bold text-grey_800 mb-6'>Favoris</h2>
      <p className='mb-4'>
        Retrouvez la synthèse des offres et recherches que votre bénéficiaire a
        mises en favoris.
      </p>
      <div className='flex flex-wrap gap-6'>
        <div className='text-content_color text-base-bold'>
          <h3 className='mb-2'>Offres</h3>
          <ul className='flex gap-2'>
            <TileIndicateur
              valeur={offres.nombreOffresEmploi}
              label='Offres d’emploi'
              bgColor='alert_lighten'
              textColor='content_color'
            />
            <TileIndicateur
              valeur={offres.nombreOffresAlternance}
              label='Alternance'
              bgColor='alert_lighten'
              textColor='content_color'
            />
            <TileIndicateur
              valeur={offres.nombreOffresServiceCivique}
              label='Service civique'
              bgColor='alert_lighten'
              textColor='content_color'
            />
            <TileIndicateur
              valeur={offres.nombreOffresImmersion}
              label='Immersion'
              bgColor='alert_lighten'
              textColor='content_color'
            />
          </ul>
        </div>
        <div className='text-content_color text-base-bold'>
          <h3 className='mb-2'>Recherches</h3>
          <div className='flex gap-2'>
            <TileIndicateur
              valeur={recherches.total}
              label='Recherches sauvegardées'
              bgColor='primary_lighten'
              textColor='primary_darken'
            />
          </div>
        </div>
      </div>
    </div>
  )
}
