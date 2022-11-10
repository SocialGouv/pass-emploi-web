import React, { ReactElement } from 'react'

type THeadProps = {
  children: Array<ReactElement | false>
  asDiv?: boolean
}

export function THead({ children, asDiv = false }: THeadProps) {
  if (asDiv)
    return (
      <div role='rowgroup' className='table-header-group'>
        <div role='row' className='table-row'>
          {React.Children.map(
            children,
            (child) => child && React.cloneElement(child, { asDiv: true })
          )}
        </div>
      </div>
    )
  else
    return (
      <thead>
        <tr>{children}</tr>
      </thead>
    )
}
