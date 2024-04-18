import Link from 'next/link'
import React, {
  ForwardedRef,
  forwardRef,
  MouseEvent,
  ReactElement,
} from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import TD from 'components/ui/Table/TD'

type CommonProps = {
  children: ReactElement | Array<ReactElement | false | undefined>
  classname?: string
  isSelected?: boolean
}
type TRProps = CommonProps & {
  isHeader?: boolean
  asDiv?: boolean
  onClick?: (e: MouseEvent) => void
}
type TRLinkProps = CommonProps & {
  href: string
  label: string
  titreRow: string
}

const TR = forwardRef(
  (props: TRProps | TRLinkProps, ref: ForwardedRef<any>) => {
    const { children, isSelected } = props
    const selectedStyle = 'bg-primary_lighten shadow-m'
    const style = `focus-within:bg-primary_lighten rounded-base shadow-base ${
      isSelected ? selectedStyle : ''
    }`
    const clickableStyle =
      'group cursor-pointer hover:bg-primary_lighten hover:rounded-base'

    if (isLink(props)) {
      const { href, label, classname, titreRow } = props
      return (
        <div
          role='row'
          className={`table-row ${style} ${classname}`}
          ref={ref}
          aria-label={titreRow}
        >
          {React.Children.map(
            children,
            (child) => child && React.cloneElement(child, { asDiv: true })
          )}
          <TD
            asDiv={true}
            className='hover:bg-primary_lighten flex items-center justify-center'
          >
            <Link
              href={href}
              title={label}
              className='flex items-center justify-center w-full h-full flex-grow'
            >
              <IconComponent
                name={IconName.ChevronRight}
                focusable={false}
                aria-hidden={true}
                className=' w-6 h-6 fill-blanc rounded-full bg-primary mx-auto'
              />
            </Link>
          </TD>
        </div>
      )
    } else if (props.asDiv) {
      const { isHeader, onClick, classname } = props
      return (
        <div
          role='row'
          className={`table-row ${!isHeader ? style : ''} ${
            onClick ? clickableStyle : ''
          } ${classname ?? ''}`}
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
      const { isHeader, onClick, classname } = props
      return (
        <tr
          className={`${!isHeader ? style : ''} ${
            onClick ? clickableStyle : ''
          } ${classname ?? ''}`}
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
