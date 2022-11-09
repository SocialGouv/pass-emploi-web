import React, { ReactNode } from 'react'

type TBodyProps = {
  children: ReactNode
}

export function TBody({ children }: TBodyProps) {
  return (
    <div role='rowgroup' className='table-row-group'>
      {children}
    </div>
  )
}
