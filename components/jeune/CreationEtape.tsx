import React from 'react'

interface CreationEtapeProps {
  etape: number
}

export const CreationEtape = ({ etape }: CreationEtapeProps) => (
  <div className='bg-primary_lighten rounded-small w-auto inline-block p-2 w-text-base-bold text-primary'>
    <span>{etape} sur 3</span>
  </div>
)
