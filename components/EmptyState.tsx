import React from 'react'

import Button, { ButtonStyle } from 'components/ui/Button/Button'
import IllustrationComponent, {
  IllustrationName,
} from 'components/ui/IllustrationComponent'

type EmptyStateProps = {
  illustrationName: IllustrationName
  titre: string
  sousTitre?: string
  CTAPrimary?: JSX.Element
  CTASecondary?: HTMLButtonElement
}

export default function EmptyState(props: EmptyStateProps) {
  return (
    <>
      <IllustrationComponent
        name={props.illustrationName}
        focusable='false'
        aria-hidden='true'
        className='w-48 m-auto'
      />

      <p className='text-base-bold text-center text-content_color mt-8'>
        {props.titre}
      </p>

      {props.sousTitre && (
        <p className='text-base-regular text-center text-content_color mt-4'>
          Recommencez ou modifiez votre recherche.
        </p>
      )}

      {(props.CTAPrimary || props.CTASecondary) && (
        <div className='flex justify-center gap-4 mt-8'>
          {props.CTASecondary && <>{props.CTASecondary}</>}
          {props.CTAPrimary && <>{props.CTAPrimary}</>}
        </div>
      )}
    </>
  )
}
