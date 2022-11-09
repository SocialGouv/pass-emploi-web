import React from 'react'

interface TableLayoutProps {
  children: any
  caption: string
}

export default function TableLayout({ children, caption }: TableLayoutProps) {
  const style = 'w-full border-spacing-y-2 border-separate'

  return (
    <div role='table' className={'table ' + style} aria-label={caption}>
      {children}
    </div>
  )
}
