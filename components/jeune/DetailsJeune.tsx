import React from 'react'
import { Jeune } from 'interfaces'
import { RdvJeune } from 'interfaces/rdv'

interface DetailsJeuneProps {
  jeune: Jeune
  rdv: RdvJeune[]
}

export const DetailsJeune = ({ jeune, rdv }: DetailsJeuneProps) => {
  return (
    <>
      <h1 className='h2-semi text-bleu_nuit pb-6'>
        {jeune.firstName} {jeune.lastName}
      </h1>
      <dl className='flex text-sm-semi text-bleu_nuit'>
        <dt className='mr-[1rem]'>Identifiant :</dt>
        <dd>{jeune.id}</dd>
      </dl>
      <div className='mt-8'>
        <h2 className='h4-semi text-bleu_nuit mb-4'>
          Rendez-vous ({rdv?.length})
        </h2>
      </div>
    </>
  )
}
