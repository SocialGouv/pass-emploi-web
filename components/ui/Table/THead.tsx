import React, { ReactNode } from 'react'

type THeadProps = {
  children: ReactNode
}

export function THead({ children }: THeadProps) {
  return (
    <div role='rowgroup' className='table-header-group'>
      <div role='row' className='table-row'>
        {children}
      </div>
    </div>
  )
}
