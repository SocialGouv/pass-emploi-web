import React, { ForwardedRef, forwardRef } from 'react'

import Button from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import IllustrationComponent, {
  IllustrationName,
} from 'components/ui/IllustrationComponent'

type EmptyStateLinkProps = { href: string; label: string; iconName?: IconName }
type EmptyStateButtonProps = {
  onClick: () => Promise<void>
  label: string
  iconName?: IconName
}

type EmptyStateProps = {
  illustrationName: IllustrationName
  titre: string
  sousTitre?: string
}
type EmptyStateWithLinkProps = EmptyStateProps & {
  lien: EmptyStateLinkProps
}
type EmptyStateWithButtonProps = EmptyStateProps & {
  bouton: EmptyStateButtonProps
}

export function hasLien(
  props: {} | { lien: EmptyStateLinkProps } | { bouton: EmptyStateButtonProps }
): props is { lien: EmptyStateLinkProps } {
  return Object.prototype.hasOwnProperty.call(props, 'lien')
}

export function hasBouton(
  props: {} | { lien: EmptyStateLinkProps } | { bouton: EmptyStateButtonProps }
): props is { bouton: EmptyStateButtonProps } {
  return Object.prototype.hasOwnProperty.call(props, 'bouton')
}

function EmptyState(
  {
    illustrationName,
    titre,
    sousTitre,
    ...props
  }: EmptyStateProps | EmptyStateWithLinkProps | EmptyStateWithButtonProps,
  ref: ForwardedRef<HTMLParagraphElement>
) {
  return (
    <>
      <IllustrationComponent
        name={illustrationName}
        focusable={false}
        aria-hidden={true}
        className='w-48 h-48 m-auto mt-12 [--secondary-fill:theme(colors.grey\_100)]'
      />

      <p
        className='text-base-bold text-center text-content_color mt-8'
        ref={ref}
      >
        {titre}
      </p>

      {sousTitre && (
        <p className='text-base-regular text-center text-content_color mt-4'>
          {sousTitre}
        </p>
      )}

      {hasLien(props) && (
        <div className='flex justify-center gap-4 mt-8'>
          <ButtonLink href={props.lien.href}>
            {props.lien.iconName && (
              <IconComponent
                name={props.lien.iconName}
                focusable={false}
                aria-hidden={true}
                className='mr-2 w-4 h-4'
              />
            )}
            {props.lien.label}
          </ButtonLink>
        </div>
      )}

      {hasBouton(props) && (
        <div className='flex justify-center gap-4 mt-8'>
          <Button onClick={props.bouton.onClick}>
            {props.bouton.iconName && (
              <IconComponent
                name={props.bouton.iconName}
                focusable={false}
                aria-hidden={true}
                className='mr-2 w-4 h-4'
              />
            )}
            {props.bouton.label}
          </Button>
        </div>
      )}
    </>
  )
}

export default forwardRef(EmptyState)
