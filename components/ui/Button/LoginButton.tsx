import Link from 'next/link'
import React from 'react'

import IllustrationComponent, {
  IllustrationName,
} from 'components/ui/IllustrationComponent'

type BaseProps = {
  label: string
  illustrationName?: IllustrationName
  prefix?: string
}
type LoginButtonProps = BaseProps & {
  onClick: () => void
}
type LoginLinkProps = BaseProps & {
  href: string
}

export default function LoginButton(props: LoginButtonProps | LoginLinkProps) {
  const ariaLabel = ['Connexion', props.prefix, props.label].join(' ')
  const style =
    'w-full h-full px-6 py-2 flex gap-4 items-center ' +
    'rounded-base border-2 border-primary_darken shadow-base ' +
    'text-base-bold whitespace-pre-wrap ' +
    'hover:bg-primary_lighten hover:shadow-m'

  if (isLink(props)) {
    return (
      <Link aria-label={ariaLabel} href={props.href} className={style}>
        <Content {...props} />
      </Link>
    )
  }

  return (
    <button
      type='submit'
      aria-label={ariaLabel}
      onClick={props.onClick}
      className={style}
    >
      <Content {...props} />
    </button>
  )
}

function Content({ illustrationName, label }: BaseProps) {
  return (
    <>
      {illustrationName && (
        <IllustrationComponent
          name={illustrationName}
          focusable={false}
          aria-hidden={true}
          className='h-[40px] shrink-0'
        />
      )}
      <span className={!illustrationName ? 'w-full text-center' : ''}>
        {label}
      </span>
    </>
  )
}

function isLink(
  props: LoginButtonProps | LoginLinkProps
): props is LoginLinkProps {
  return Object.prototype.hasOwnProperty.call(props, 'href')
}
