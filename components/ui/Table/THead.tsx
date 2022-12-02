import React, { ReactElement } from 'react'

type THeadProps = {
  children: ReactElement
  asDiv?: boolean
}

export function THead({ children, asDiv = false }: THeadProps) {
  if (asDiv)
    return (
      <div role='rowgroup' className='table-header-group'>
        {React.Children.map(
          children,
          (child) => child && React.cloneElement(child, { asDiv: true })
        )}
      </div>
    )
  else return <thead>{children}</thead>
}
