import { Offre } from '../../../interfaces/favoris'
import { TypeOffre } from '../../../referentiel/favoris'
import { HeaderCell } from '../../rdv/HeaderCell'

interface FavorisListProps {
  offres: Offre[]
}

const OffresList = ({ offres }: FavorisListProps) => {
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
              <HeaderCell label='Entreprise' />
              <HeaderCell label='Titre' />
              <HeaderCell label='' />
            </div>
          </div>
          <div role='rowgroup' className='table-row-group'>
            {offres.map((offre) => (
              <div
                role='row'
                key={offre.idOffre}
                className='table-row text-sm  hover:bg-primary_lighten'
              >
                <div role='cell' className='table-cell p-3'>
                  {offre.idOffre}
                </div>
                <div role='cell' className='table-cell p-3'>
                  {TypeOffre[offre.type]}
                </div>
                <div role='cell' className='table-cell p-3'>
                  {offre.organisation}
                </div>
                <div role='cell' className='table-cell p-3'>
                  {offre.titre}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

export default OffresList
