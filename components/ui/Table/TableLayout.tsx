import React from 'react'

interface TableLayoutProps {
  label?: string
  describedBy?: string
  children: any
}

export default function TableLayout({
  label,
  describedBy,
  children,
}: TableLayoutProps) {
  return (
    <div
      role='table'
      className='table w-full border-spacing-y-3 border-separate'
      aria-label={label}
      aria-describedby={describedBy}
    >
      {children}
    </div>
  )
}
