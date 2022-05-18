import { ReactNode } from 'react'

interface TabListProps {
  children: ReactNode
  className?: string
  label?: string
}

export default function TabList({ children, className, label }: TabListProps) {
  return (
    <div
      role='tablist'
      className={`flex ${className ?? ''}`}
      aria-label={label}
    >
      {children}
    </div>
  )
}
