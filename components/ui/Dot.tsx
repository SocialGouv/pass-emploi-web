import { ComponentPropsWithoutRef } from 'react'

interface DotProps extends ComponentPropsWithoutRef<any> {
  color: string
}

export default function Dot({ color, className, ...props }: DotProps) {
  return (
    <span
      className={`inline-block rounded-full w-[0.5em] h-[0.5em] mb-[0.25em] bg-${color} ${className}`}
      {...props}
    />
  )
}
