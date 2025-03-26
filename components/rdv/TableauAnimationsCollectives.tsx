import React, { ForwardedRef, forwardRef } from 'react'

import { AnimationCollectiveRow } from 'components/rdv/AnimationCollectiveRow'
import { AnimationCollective } from 'interfaces/evenement'

type TableauAnimationsCollectivesLocaleProps = {
  animationsCollectives: AnimationCollective[]
  labelPeriode: string
  withRecherche: boolean
}

function TableauAnimationsCollectives(
  {
    animationsCollectives,
    labelPeriode,
    withRecherche,
  }: TableauAnimationsCollectivesLocaleProps,
  ref: ForwardedRef<HTMLTableElement>
) {
  return (
    // TODO utiliser <Table> (homogénéiser) ?
    <table className='w-full mt-6' tabIndex={-1} ref={ref}>
      <caption className='mb-6 text-left text-m-bold text-primary'>
        {animationsCollectives.length}{' '}
        {animationsCollectives.length === 1 &&
          (withRecherche ? 'résultat' : 'atelier ou information collective')}
        {animationsCollectives.length > 1 &&
          (withRecherche
            ? 'résultats'
            : 'ateliers ou informations collectives')}
        <span className='sr-only'> {labelPeriode}</span>
      </caption>

      <thead className='sr-only'>
        <tr>
          <th scope='col'>Horaires et durée</th>
          <th scope='col'>Titre, type et visibilité</th>
          <th scope='col'>Inscrits</th>
          <th scope='col'>Statut</th>
          <th scope='col'>Voir le détail</th>
        </tr>
      </thead>

      <tbody className='grid auto-rows-auto grid-cols-[repeat(3,auto)] layout-base:grid-cols-[repeat(5,auto)] gap-y-2'>
        {animationsCollectives.map((animationCollective) => (
          <AnimationCollectiveRow
            key={animationCollective.id}
            animationCollective={animationCollective}
          />
        ))}
      </tbody>
    </table>
  )
}

export default forwardRef(TableauAnimationsCollectives)
