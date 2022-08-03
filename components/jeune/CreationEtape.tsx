import React from 'react'

interface CreationEtapeProps {
  etape: number
}

export default function CreationEtape({ etape }: CreationEtapeProps) {
  return (
    <div className='bg-primary_lighten rounded-small w-auto inline-block p-2 text-base-medium text-primary'>
      <span>{etape} sur 3</span>
    </div>
  )
}
