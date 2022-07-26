import React from 'react'

export function Badge({ count, bgColor }: { count: number; bgColor: string }) {
  return (
    <span
      className={`w-6 h-6 inline-block text-center bg-${bgColor} rounded-full text-blanc text-s-medium`}
    >
      {count}
    </span>
  )
}
