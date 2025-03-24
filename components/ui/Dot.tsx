type DotColor = 'ACCENT' | 'GREY'
type DotProps = {
  color: DotColor
  className?: string
}

export default function Dot({ color, className }: DotProps) {
  return (
    <span
      className={`inline-block rounded-full w-[0.5em] h-[0.5em] mb-[0.25em] ${styles[color]} ${className}`}
    />
  )
}

const styles: { [key in DotColor]: string } = {
  ACCENT: 'bg-accent-1',
  GREY: 'bg-grey-700',
}
