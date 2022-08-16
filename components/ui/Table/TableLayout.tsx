import React, { ReactNode } from 'react'

export default function TableLayout(children) {
  return (
    <table className='w-full border-spacing-y-3 border-separate'>
      {children}
    </table>
  )
}
