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
      <dt className='text-base-regular'>{definition}</dt>
      <dd className='text-base-medium ml-1'>{description}</dd>
    </div>
  )
}
