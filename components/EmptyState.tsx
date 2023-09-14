import React from 'react'

import ButtonLink from 'components/ui/Button/ButtonLink'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import IllustrationComponent, {
  IllustrationName,
} from 'components/ui/IllustrationComponent'

type EmptyStateLinkProps = { href: string; label: string; iconName?: IconName }
type EmptyStateProps = {
  illustrationName: IllustrationName
  titre: string
  sousTitre?: string
  premierLien?: EmptyStateLinkProps
  secondLien?: EmptyStateLinkProps
}

export default function EmptyState({
  illustrationName,
  premierLien,
  secondLien,
  sousTitre,
  titre,
}: EmptyStateProps) {
  return (
    <>
      <IllustrationComponent
        name={illustrationName}
        focusable='false'
        aria-hidden='true'
        className='w-48 h-48 m-auto mt-12'
      />

      <p className='text-base-bold text-center text-content_color mt-8'>
        {titre}
      </p>

      {sousTitre && (
        <p className='text-base-regular text-center text-content_color mt-4'>
          {sousTitre}
        </p>
      )}

      {(premierLien || secondLien) && (
        <div className='flex justify-center gap-4 mt-8'>
          {premierLien && (
            <ButtonLink href={premierLien.href}>
              {premierLien.iconName && (
                <IconComponent
                  name={premierLien.iconName}
                  focusable={false}
                  aria-hidden={true}
                  className='mr-2 w-4 h-4'
                />
              )}
              {premierLien.label}
            </ButtonLink>
          )}

          {secondLien && (
            <ButtonLink href={secondLien.href}>
              {secondLien.iconName && (
                <IconComponent
                  name={secondLien.iconName}
                  focusable={false}
                  aria-hidden={true}
                  className='mr-2 w-4 h-4'
                />
              )}
              {secondLien.label}
            </ButtonLink>
          )}
        </div>
      )}
    </>
  )
}
