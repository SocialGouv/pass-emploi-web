interface DotProps {
  color: string
  className?: string
}

export default function Dot({ color, className }: DotProps) {
  return (
    <span
      className={`inline-block rounded-full w-[0.5em] h-[0.5em] mb-[0.25em] bg-${color} ${className}`}
    />
  )
}
