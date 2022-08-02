import Link from 'next/link'

import { HeaderCell } from '../rdv/HeaderCell'

interface FavorisListProps {
  offres: []
}

const FavorisList = ({ offres }: FavorisListProps) => {
  return (
    <>
      {offres.length === 0 && (
        <p className='text-md mb-2'>
          Votre jeune n’a pas d’offre mise en favoris
        </p>
      )}

      {Boolean(offres.length) && (
        <div
          role='table'
          className='table w-full'
          aria-label='Liste des offres en favoris'
        >
          <div role='rowgroup' className='table-row-group'>
            <div role='row' className='table-row'>
              <HeaderCell label='N°Offre' />
              <HeaderCell label='Type' />
              <HeaderCell label='Entrepris' />
              <HeaderCell label='Titre' />
              <HeaderCell label='' />
            </div>
          </div>
          <div role='rowgroup' className='table-row-group'>
            {offres.map((offre) => (
              <div>
                <div role='cell' className='table-cell p-3'></div>
                <div role='cell' className='table-cell p-3'></div>
                <div role='cell' className='table-cell p-3'></div>
                <div role='cell' className='table-cell p-3'></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

export default FavorisList
