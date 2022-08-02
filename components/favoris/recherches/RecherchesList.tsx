import { Recherche } from '../../../interfaces/favoris'
import { TypeRecherche } from '../../../referentiel/favoris'
import { HeaderCell } from '../../rdv/HeaderCell'

interface RecherchesListProps {
  recherches: Recherche[]
}

const RecherchesList = ({ recherches }: RecherchesListProps) => {
  return (
    <>
      {recherches.length === 0 && (
        <p className='text-md mb-2'>
          Votre jeune n’a pas de recherche sauvegardée
        </p>
      )}

      {Boolean(recherches.length) && (
        <div
          role='table'
          className='table w-full'
          aria-label='Liste des recherches sauvegardées'
        >
          <div role='rowgroup' className='table-row-group'>
            <div role='row' className='table-row'>
              <HeaderCell label='Nom de la recherche' />
              <HeaderCell label='Mot clé/ métier' />
              <HeaderCell label='Lieu/ localisation' />
              <HeaderCell label='Type' />
            </div>
          </div>
          <div role='rowgroup' className='table-row-group'>
            {recherches.map((recherche) => (
              <div
                role='row'
                key={recherche.titre}
                className='table-row text-sm  hover:bg-primary_lighten'
              >
                <div role='cell' className='table-cell p-3'>
                  {recherche.titre}
                </div>
                <div role='cell' className='table-cell p-3'>
                  {recherche.metier}
                </div>
                <div role='cell' className='table-cell p-3'>
                  {recherche.localisation}
                </div>
                <div role='cell' className='table-cell p-3'>
                  {TypeRecherche[recherche.type]}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

export default RecherchesList
