import React from 'react'

export function InlineDefinition({
  definition,
  description,
}: {
  definition: string
  description: string | number
}) {
  return (
    <div className='flex items-center'>
      <dt className='text-base-regular'>{definition} :</dt>
      <dd>
        <span className='text-base-medium ml-1'>{description}</span>
      </dd>
    </div>
  )
}
