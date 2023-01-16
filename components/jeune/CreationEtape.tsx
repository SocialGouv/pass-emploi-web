import React from 'react'

interface CreationEtapeProps {
  etape: number
}

export default function CreationEtape({ etape }: CreationEtapeProps) {
  return (
    <div className='bg-primary_lighten rounded-base w-auto inline-block p-2 text-base-medium text-primary'>
      <span>{etape} sur 2</span>
    </div>
  )
}
