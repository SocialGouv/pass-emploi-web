import { Jeune } from 'interfaces'
import React from 'react'

interface DetailsJeuneProps {
  jeune: Jeune
}

export const DetailsJeune = ({ jeune }: DetailsJeuneProps) => {
  return (
    <>
      <h1 className='h2-semi text-bleu_nuit pb-6'>
        {jeune.firstName} {jeune.lastName}
      </h1>
      <dl className='flex text-sm-semi text-bleu_nuit'>
        <dt className='mr-[1rem]'>Identifiant :</dt>
        <dd>{jeune.id}</dd>
      </dl>
    </>
  )
}
