import React from 'react'

interface RdvtypeTagProps {
  type: string
}

export const RdvTypeTag = ({ type }: RdvtypeTagProps) => {
  return (
    <span className='bg-primary/[.15] border border-solid border-primary rounded-x_large px-4 py-1 w-text-s-regular text-primary whitespace-nowrap'>
      {type}
    </span>
  )
}
