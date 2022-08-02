import { HeaderCell } from '../../rdv/HeaderCell'

interface RecherchesListProps {
  recherches: []
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
              <HeaderCell label='A' />
              <HeaderCell label='B' />
              <HeaderCell label='C' />
              <HeaderCell label='D' />
              <HeaderCell label='E' />
            </div>
          </div>
          <div role='rowgroup' className='table-row-group'>
            {recherches.map((recherche) => (
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

export default RecherchesList
