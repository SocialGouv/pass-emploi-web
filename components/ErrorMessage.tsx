import React from 'react'
import Exclamation from '../assets/icons/exclamation.svg'

export const ErrorMessage = ({ children }) => (
  <div className='flex mb-8'>
    <Exclamation className='mr-1' focusable='false' aria-hidden='true' />
    <p className='text-sm-medium text-warning'>{children}</p>
  </div>
)
