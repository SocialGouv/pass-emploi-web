import React, { ReactElement } from 'react'

type TBodyProps = {
  children: ReactElement | ReactElement[]
  asDiv?: boolean
}

export function TBody({ children, asDiv = false }: TBodyProps) {
  if (asDiv)
    return (
      <div role='rowgroup' className='table-row-group'>
        {React.Children.map(children, (child) =>
          React.cloneElement(child, { asDiv: true })
        )}
      </div>
    )
  else return <tbody>{children}</tbody>
}
