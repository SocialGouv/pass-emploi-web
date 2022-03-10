import Link from 'next/link'
import { MouseEventHandler, ReactNode } from 'react'
import styles from 'styles/components/Button.module.css'
import { UrlObject } from 'url'

interface CommonProps {
  children: ReactNode
  style?: ButtonStyle
  className?: any
}
interface LinkProps extends CommonProps {
  href: string | UrlObject
}
interface ButtonProps extends CommonProps {
  onClick?: MouseEventHandler<HTMLButtonElement>
  role?: string
  type?: 'button' | 'submit' | 'reset'
  controls?: string
  label?: string
  disabled?: boolean
  selected?: boolean
  form?: string
  id?: string
  tabIndex?: number
}
type Props = LinkProps | ButtonProps

export enum ButtonStyle {
  PRIMARY = 'PRIMARY',
  SECONDARY = 'SECONDARY',
  WARNING = 'WARNING',
}

export default function Button(props: Props) {
  return isLink(props) ? buildLink(props) : buildButton(props)
}

function isLink(props: Props): props is LinkProps {
  return Object.prototype.hasOwnProperty.call(props, 'href')
}

function buildLink({
  children,
  href,
  className,
  style = ButtonStyle.PRIMARY,
}: LinkProps): JSX.Element {
  return (
    <Link href={href}>
      <a
        className={`${className ? className : ''} text-sm ${
          styles.button
        } ${getColorStyleClassName(style)}`}
      >
        {children}
      </a>
    </Link>
  )
}

function buildButton({
  children,
  onClick,
  className,
  style = ButtonStyle.PRIMARY,
  form,
  id,
  tabIndex,
  role,
  type,
  controls,
  label,
  disabled,
  selected,
}: ButtonProps): JSX.Element {
  return (
    <>
      <button
        onClick={onClick}
        className={`${className ? className : ''} text-sm ${
          styles.button
        } ${getColorStyleClassName(style)}`}
        form={form ?? undefined}
        id={id ?? undefined}
        tabIndex={tabIndex ?? undefined}
        role={role ?? undefined}
        type={type ?? undefined}
        aria-controls={controls ?? undefined}
        aria-label={label ?? undefined}
        disabled={disabled}
        aria-disabled={disabled}
        aria-selected={selected}
      >
        {children}
      </button>
    </>
  )
}

const getColorStyleClassName = (style: ButtonStyle): string => {
  switch (style) {
    case ButtonStyle.SECONDARY:
      return styles.buttonSecondary
    case ButtonStyle.WARNING:
      return styles.buttonWarning
    case ButtonStyle.PRIMARY:
    default:
      return styles.buttonPrimary
  }
}
