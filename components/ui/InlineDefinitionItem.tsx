import React from 'react'

export function InlineDefinitionItem({
  definition,
  description,
}: {
  definition: string
  description: string | number
}) {
  return (
    <div className='flex items-center'>
      <dt className='w-text-base-regular'>{definition}</dt>
      <dd className='w-text-base-bold ml-1'>{description}</dd>
    </div>
  )
}
