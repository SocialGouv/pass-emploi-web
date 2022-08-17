import React from 'react'

interface CellRowProps {
  style?: string
  children: any
}

export default function CellRow({ style, children }: CellRowProps) {
  return (
    <div
      role='cell'
      className={`table-cell text-base-medium p-4 align-middle ${style ?? ''} `}
    >
      {children}
    </div>
  )
}
