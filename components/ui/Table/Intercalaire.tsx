import React, { ReactNode, useRef, useState, useEffect } from 'react'

interface IntercalaireProps {
  children: ReactNode
  className?: string
  asDiv?: boolean
}

export function Intercalaire({
  children,
  asDiv = false,
  className = '',
}: IntercalaireProps): JSX.Element {
  const [colspan, setColspan] = useState<number>(1)
  const divRef = useRef<HTMLDivElement>(null)
  const trRef = useRef<HTMLTableRowElement>(null)

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
    if (trRef.current) setColspan(computeColspan(trRef.current))
  }, [divRef, trRef])

  if (asDiv) {
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
      <tr ref={trRef}>
        <th className={'text-left ' + className} colSpan={colspan}>
          {children}
        </th>
      </tr>
    )
  }
}
