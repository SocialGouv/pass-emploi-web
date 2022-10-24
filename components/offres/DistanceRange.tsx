import React from 'react'

import Input from 'components/ui/Form/Input'

export function DistanceRange({
  value,
  onChange,
  required,
}: {
  value: number
  onChange: (distance: number) => void
  required?: boolean
}) {
  const DISTANCE_MIN = 0
  const DISTANCE_MAX = 100

  return (
    <>
      <label htmlFor='distance'>
        {required && <span aria-hidden={true}>*&nbsp;</span>}
        Dans un rayon de : <span className='text-base-bold'>{value}km</span>
      </label>
      <Input
        id='distance'
        type='range'
        className='block mt-4 w-full'
        value={value}
        min={DISTANCE_MIN}
        max={DISTANCE_MAX}
        onChange={(value: string) => onChange(parseInt(value, 10))}
        list='distance-bornes'
        required={required}
      />
      <datalist id='distance-bornes' className='flex justify-between'>
        <option value='0' label='0km' className='text-s-bold' />
        <option value='100' label='100km' className='text-s-bold' />
      </datalist>
    </>
  )
}
