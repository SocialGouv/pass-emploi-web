import React, { MouseEvent, ReactElement } from 'react'

type TRProps = {
  children: ReactElement | Array<ReactElement | false | undefined>
  classname?: string
  isSelected?: boolean
  isHeader?: boolean
  onClick?: (e: MouseEvent) => void
}

export default function TR(props: TRProps) {
  const { children, isSelected } = props
  const selectedStyle = 'bg-primary_lighten shadow-m'
  const style = `focus-within:bg-primary_lighten rounded-base shadow-base ${
    isSelected ? selectedStyle : ''
  }`
  const clickableStyle =
    'group cursor-pointer hover:bg-primary_lighten hover:rounded-base'

  const { isHeader, onClick, classname } = props
  return (
    <tr
      className={`${!isHeader ? style : ''} ${
        onClick ? clickableStyle : ''
      } ${classname ?? ''}`}
      onClick={onClick}
    >
      {children}
    </tr>
  )
}
