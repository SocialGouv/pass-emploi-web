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

  const style = `[&:focus-within>td]:bg-primary_lighten ${
    isSelected ? '[&>td]:bg-primary_lighten shadow-m' : 'shadow-base'
  }`
  const clickableStyle = 'cursor-pointer [&:hover>td]:bg-primary_lighten'

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
      className={`rounded-base ${!isHeader ? style : ''} ${
        containsExtendedClickZone ? clickableStyle : ''
      } ${containsExtendedClickZone ? 'relative rotate-0' : ''}
      ${className ?? ''}`}
    >
      {children}
    </tr>
  )
}
