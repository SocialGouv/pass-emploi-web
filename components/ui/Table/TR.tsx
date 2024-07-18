import React, {
  MouseEvent,
  ReactElement,
  useEffect,
  useRef,
  useState,
} from 'react'

type TRProps = {
  children: ReactElement | Array<ReactElement | false | undefined>
  className?: string
  isSelected?: boolean
  isHeader?: boolean
  onClick?: (e: MouseEvent) => void
}

export default function TR({
  children,
  className,
  isHeader,
  isSelected,
  onClick,
}: TRProps) {
  const rowRef = useRef<HTMLTableRowElement>(null)
  const [hasExtendedLink, setHasExtendedLink] = useState<boolean>(false)

  const selectedStyle = 'bg-primary_lighten shadow-m'
  const style = `focus-within:bg-primary_lighten rounded-base shadow-base ${
    isSelected ? selectedStyle : ''
  }`
  const clickableStyle =
    'group cursor-pointer hover:bg-primary_lighten hover:rounded-base'

  useEffect(() => {
    setHasExtendedLink(
      Boolean(
        rowRef
          .current!.querySelector('td>a')
          ?.classList.contains('before:inset-0')
      )
    )
  }, [])

  return (
    <tr
      ref={rowRef}
      className={`${!isHeader ? style : ''} ${
        onClick || hasExtendedLink ? clickableStyle : ''
      } ${hasExtendedLink ? 'relative rotate-0' : ''}
      ${className ?? ''}`}
      onClick={onClick}
    >
      {children}
    </tr>
  )
}
