import React, { ReactElement, useEffect, useRef, useState } from 'react'

type TRProps = {
  children: ReactElement | Array<ReactElement | false | undefined>
  className?: string
  isSelected?: boolean
  isHeader?: boolean
}

export default function TR({
  children,
  className,
  isHeader,
  isSelected,
}: TRProps) {
  const rowRef = useRef<HTMLTableRowElement>(null)
  const [containsExtendedClickZone, setContainsExtendedClickZone] =
    useState<boolean>(false)

  const selectedStyle = 'bg-primary_lighten shadow-m'
  const style = `focus-within:bg-primary_lighten rounded-base shadow-base ${
    isSelected ? selectedStyle : ''
  }`
  const clickableStyle =
    'group cursor-pointer hover:bg-primary_lighten hover:rounded-base'

  useEffect(() => {
    const clickableContent = Array.from(
      rowRef.current!.querySelectorAll('td>a, td>label')
    )

    setContainsExtendedClickZone(
      clickableContent.some(({ classList }) =>
        classList.contains('before:inset-0')
      )
    )
  }, [])

  return (
    <tr
      ref={rowRef}
      className={`${!isHeader ? style : ''} ${
        containsExtendedClickZone ? clickableStyle : ''
      } ${containsExtendedClickZone ? 'relative rotate-0' : ''}
      ${className ?? ''}`}
    >
      {children}
    </tr>
  )
}
