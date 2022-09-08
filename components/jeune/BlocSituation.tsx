import React from 'react'

import SituationTag from 'components/jeune/SituationTag'
import { CategorieSituation, EtatSituation } from 'interfaces/jeune'

interface BlocSituationProps {
  situations: Array<{
    etat?: EtatSituation
    categorie: CategorieSituation
    dateFin?: string
  }>
  afficherUneSeuleSituation: boolean
}

export function BlocSituation({
  situations,
  afficherUneSeuleSituation,
}: BlocSituationProps) {
  situations = situations.concat(situations)
  return (
    <div className='border border-solid rounded-medium w-full p-4 mt-2 border-grey_100'>
      <h2 className='text-base-bold mb-1'>Situation</h2>
      {!(situations && situations.length) && (
        <ol>
          <li className='mt-3'>
            <div className='mb-3'>
              <SituationTag situation={CategorieSituation.SANS_SITUATION} />
            </div>
            <div className='mb-3'>
              Etat : <span className='text-base-medium'>--</span>
            </div>
            <div>
              Fin le : <span className='text-base-medium'>--</span>
            </div>
          </li>
        </ol>
      )}

      {situations && Boolean(situations.length) && (
        <ol className='flex flex-row flex-wrap'>
          {situations
            .map((situation) => (
              <li
                className='mt-3 mr-32 last:mr-0'
                key={situation.etat + '-' + situation.categorie}
              >
                <div className='mb-3'>
                  <SituationTag situation={situation.categorie} />
                </div>
                <div className='mb-3'>
                  Etat :{' '}
                  <span className='text-base-medium'>
                    {situation.etat ?? '--'}
                  </span>
                </div>
                <div className=''>
                  Fin le :{' '}
                  <span className='text-base-medium'>
                    {situation.dateFin ?? '--'}
                  </span>
                </div>
              </li>
            ))
            .slice(0, afficherUneSeuleSituation ? 1 : situations.length)}
        </ol>
      )}
    </div>
  )
}
