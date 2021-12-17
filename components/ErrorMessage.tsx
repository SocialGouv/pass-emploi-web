import React from 'react'
import Exclamation from '../assets/icons/exclamation.svg'

interface ErrorMessageProps {
  children: React.ReactNode
}

export const ErrorMessage = ({ children }: ErrorMessageProps) => (
  <div className='flex items-center mb-8'>
    <Exclamation className='mr-1' focusable='false' aria-hidden='true' />
    <p className='text-sm-medium text-warning'>{children}</p>
  </div>
)
