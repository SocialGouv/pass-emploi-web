import React, { ReactNode, useEffect, useRef, useState } from 'react'

import TD from './TD'
import TR from './TR'

interface IntercalaireProps {
  children: ReactNode
  className?: string
  rowLike?: boolean
}

export function Intercalaire({
  children,
  className = '',
  rowLike = false,
}: IntercalaireProps): React.JSX.Element {
  const [colspan, setColspan] = useState<number>(1)
  const divRef = useRef<HTMLDivElement>(null)

  function computeColspan(row: HTMLElement): number {
    const table = findParentTable(row)
    const headerRow = findHeaderRow(table)
    return countCells(headerRow)
  }

  function findParentTable(element: HTMLElement): HTMLElement {
    const parentElement: HTMLElement = element.parentElement!
    if (
      parentElement.tagName === 'TABLE' ||
      element.attributes.getNamedItem('role')?.nodeValue === 'table'
    ) {
      return parentElement
    }
    return findParentTable(parentElement)
  }

  function findHeaderRow(table: HTMLElement): HTMLElement {
    return table.querySelector('tr, div[role="row"]')!
  }

  function countCells(row: HTMLElement): number {
    return row.querySelectorAll(
      'td, th, div[role="cell"], div[role="columnheader"]'
    ).length
  }

  useEffect(() => {
    if (divRef.current) setColspan(computeColspan(divRef.current))
  }, [divRef])

  if (!rowLike) {
    return (
      <div role='row' className='table-row' ref={divRef}>
        <div
          role='columnheader'
          className={'table-cell ' + className}
          aria-colspan={colspan}
        >
          {children}
        </div>
      </div>
    )
  } else {
    return (
      <TR asDiv={true} ref={divRef}>
        <TD role='columnheader' asDiv={true} aria-colspan={colspan}>
          {children}
        </TD>
      </TR>
    )
  }
}
