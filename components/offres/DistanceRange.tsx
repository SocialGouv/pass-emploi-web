import React from 'react'

import styles from 'styles/components/Input.module.css'

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
        Dans un rayon de : <span className='text-base-bold'>{value}km</span>
      </label>

      <input
        type='range'
        id='distance'
        required={required}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className={`text-base-medium ${styles.range} mt-4`}
        value={value}
        min={DISTANCE_MIN}
        max={DISTANCE_MAX}
        list='distance-bornes'
      />

      <datalist id='distance-bornes' className='flex justify-between'>
        <option value='0' label='0km' className='text-s-bold' />
        <option value='100' label='100km' className='text-s-bold' />
      </datalist>
    </>
  )
}
