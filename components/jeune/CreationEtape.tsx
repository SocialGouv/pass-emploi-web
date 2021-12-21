import React from 'react'

interface CreationEtapeProps {
  etape: string
}

export const CreationEtape = ({ etape }: CreationEtapeProps) => (
  <div className='bg-gris_blanc rounded-small w-auto inline-block p-2 text-base-medium text-bleu_nuit'>
    <span>{etape} sur 3</span>
  </div>
)
