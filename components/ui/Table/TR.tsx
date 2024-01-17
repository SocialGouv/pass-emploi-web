import Link from 'next/link'
import React, {
  ForwardedRef,
  forwardRef,
  MouseEvent,
  ReactElement,
} from 'react'

type Children = {
  children: ReactElement | Array<ReactElement | false | undefined>
}
type TRProps = Children & {
  isHeader?: boolean
  asDiv?: boolean
  onClick?: (e: MouseEvent) => void
}
type TRLinkProps = Children & {
  href: string
  label: string
  isSelected?: boolean
}

const TR = forwardRef(
  (props: TRProps | TRLinkProps, ref: ForwardedRef<any>) => {
    const style = 'focus-within:bg-primary_lighten rounded-base shadow-base'
    const clickableStyle =
      'group cursor-pointer hover:bg-primary_lighten hover:rounded-base'
    const selectedStyle = 'bg-primary_lighten shadow-m'

    if (isLink(props)) {
      const { href, label, children, isSelected } = props
      return (
        <Link
          href={href}
          role='row'
          aria-label={label}
          title={label}
          className={`table-row shadow-base ${clickableStyle} ${
            isSelected ? selectedStyle : ''
          }`}
          ref={ref}
        >
          {React.Children.map(
            children,
            (child) => child && React.cloneElement(child, { asDiv: true })
          )}
        </Link>
      )
    } else if (props.asDiv) {
      const { isHeader, onClick, children } = props
      return (
        <div
          role='row'
          className={`table-row ${!isHeader ? style : ''} ${
            onClick ? clickableStyle : ''
          }`}
          onClick={onClick}
          ref={ref}
        >
          {React.Children.map(
            children,
            (child) => child && React.cloneElement(child, { asDiv: true })
          )}
        </div>
      )
    } else {
      const { isHeader, onClick, children } = props
      return (
        <tr
          className={`${!isHeader ? style : ''} ${
            onClick ? clickableStyle : ''
          }`}
          onClick={onClick}
          ref={ref}
        >
          {children}
        </tr>
      )
    }
  }
)
TR.displayName = 'TR'
export default TR

function isLink(props: TRProps | TRLinkProps): props is TRLinkProps {
  return Object.prototype.hasOwnProperty.call(props, 'href')
}
