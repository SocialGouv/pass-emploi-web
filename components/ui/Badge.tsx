import React from 'react'

export function Badge({ count }: { count: number }) {
  return (
    <span className='w-6 h-6 inline-block text-center bg-primary rounded-full text-blanc text-s-medium'>
      {count}
    </span>
  )
}
