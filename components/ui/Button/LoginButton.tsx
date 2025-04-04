import Link from 'next/link'
import React, { FC, SVGProps, useState } from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'

type BaseProps = {
  label: string
  Illustration?: FC<SVGProps<SVGElement>>
  prefix?: string
}
type LoginButtonProps = BaseProps & {
  onClick: () => void
}
type LoginLinkProps = BaseProps & {
  href: string
}

export default function LoginButton(props: LoginButtonProps | LoginLinkProps) {
  const [isLoading, setisLoading] = useState<boolean>(false)

  const ariaLabel = ['Connexion', props.prefix, props.label].join(' ')
  const style =
    'relative inline-block w-full h-full px-6 py-2 min-h-[60px] ' +
    'rounded-base border-2 border-primary-darken shadow-base ' +
    'text-base-bold whitespace-pre-wrap ' +
    'hover:bg-primary-lighten hover:shadow-m' +
    (isLoading ? ' cursor-not-allowed opacity-50' : '')

  if (isLink(props)) {
    return (
      <Link
        aria-label={ariaLabel}
        href={props.href}
        className={style}
        onClick={() => setisLoading(true)}
      >
        <Content {...props} isLoading={isLoading} />
      </Link>
    )
  }

  return (
    <button
      type='submit'
      aria-label={ariaLabel}
      onClick={() => {
        setisLoading(true)
        props.onClick()
      }}
      className={style}
      disabled={isLoading}
    >
      <Content {...props} isLoading={isLoading} />
    </button>
  )
}

function Content({
  Illustration,
  label,
  isLoading,
}: BaseProps & { isLoading: boolean }) {
  return (
    <>
      <LoadingZone isLoading={isLoading} />

      <span
        className={`flex gap-4 items-center ${isLoading ? 'invisible' : ''}`}
      >
        {Illustration && (
          <Illustration
            focusable={false}
            aria-hidden={true}
            className='inline h-[40px] shrink-0'
          />
        )}
        <span className={!Illustration ? 'w-full text-center' : ''}>
          {label}
        </span>
      </span>
    </>
  )
}

function LoadingZone({ isLoading }: { isLoading: boolean }) {
  return (
    <span role='alert'>
      {isLoading && (
        <>
          <IconComponent
            name={IconName.Spinner}
            focusable={false}
            role='img'
            aria-labelledby='loading-label'
            title='Chargement en cours'
            className='w-6 h-6 animate-spin absolute top-0 bottom-0 left-0 right-0 m-auto'
          />
          <span id='loading-label' className='sr-only'>
            Chargement en cours
          </span>
        </>
      )}
    </span>
  )
}

function isLink(
  props: LoginButtonProps | LoginLinkProps
): props is LoginLinkProps {
  return Object.prototype.hasOwnProperty.call(props, 'href')
}
