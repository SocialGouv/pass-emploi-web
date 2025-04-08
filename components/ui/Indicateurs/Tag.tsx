import React, { ReactElement } from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import { unsafeRandomId } from 'utils/helpers'

import { EvenementListItem } from '../../../interfaces/evenement'

interface TagProps {
  label: string
  className: string
  iconName?: IconName
  iconLabel?: string
  isSmallTag?: boolean
}

interface TagCategorieProps {
  categorie?: string
}

interface TagTypeProps {
  isSession?: boolean
  type?: string
  source?: string
  isSmallTag?: boolean
}

function Tag({ label, className, iconName, iconLabel, isSmallTag }: TagProps) {
  function TagIcon() {
    const iconStyle = 'h-5 w-5 mr-1 fill-current'
    if (iconLabel) {
      const labelId = 'tag-icon-' + unsafeRandomId()
      return (
        <>
          <IconComponent
            name={iconName!}
            focusable={false}
            className={iconStyle}
            role='img'
            aria-labelledby={labelId}
            title={iconLabel}
          />
          <span id={labelId} className='sr-only'>
            {iconLabel}
          </span>
        </>
      )
    } else
      return (
        <IconComponent
          name={iconName!}
          focusable={false}
          aria-hidden={true}
          className={iconStyle}
        />
      )
  }

  return (
    <span
      className={`flex items-center w-fit text-s-medium px-3 ${className} whitespace-nowrap ${isSmallTag ? 'px-2! py-1! text-xs! font-bold! [&>svg]:w-4! [&>svg]:h-4!' : ''}`}
    >
      {iconName && <TagIcon />}
      {label}
    </span>
  )
}

export function TagMetier({ className, ...props }: TagProps) {
  return <Tag className={'rounded-base ' + className} {...props} />
}

export function TagStatut({ className, ...props }: TagProps) {
  return <Tag className={'rounded-large ' + className} {...props} />
}

export function TagDate({ label }: Pick<TagProps, 'label'>) {
  return (
    <Tag className='bg-grey-100 text-grey-800 rounded-large' label={label} />
  )
}

export function TagType({
  isSession,
  type,
  source,
  isSmallTag = false,
}: TagTypeProps): ReactElement {
  let tagProps: {
    style: string
    iconName?: IconName
    iconLabel?: string
  } = {
    style: 'text-content-color bg-additional-5-lighten',
    iconName: undefined,
    iconLabel: undefined,
  }

  if (source === 'MILO')
    tagProps = {
      style: 'text-content-color bg-additional-5-lighten',
      iconName: IconName.Lock,
      iconLabel: 'Non modifiable',
    }

  if (isSession)
    tagProps = {
      style: 'text-accent-1 bg-accent-1-lighten',
      iconName: IconName.Lock,
      iconLabel: 'Informations de la session non modifiables',
    }

  return (
    <TagMetier
      label={type!}
      className={tagProps.style}
      iconName={tagProps.iconName}
      iconLabel={tagProps.iconLabel}
      isSmallTag={isSmallTag}
    />
  )
}

export function TagCategorie({ categorie }: TagCategorieProps) {
  if (categorie)
    return (
      <Tag
        className='text-primary bg-primary-lighten rounded-large text-wrap!'
        label={categorie}
      />
    )

  return (
    <Tag
      className='text-alert bg-white rounded-large'
      iconName={IconName.Warning}
      label='Catégorie manquante'
    />
  )
}

export function TagFavori({ aPostule }: { aPostule: boolean }) {
  if (aPostule) {
    return (
      <TagMetier
        label='Postulée'
        className='text-accent-1 bg-accent-1-lighten'
      />
    )
  }

  return (
    <TagMetier
      label='Enregistrée'
      className='text-primary bg-primary-lighten'
    />
  )
}

export function TagModalite({ modality }: EvenementListItem): ReactElement {
  return (
    <TagStatut
      label={modality!}
      className='text-primary bg-primary-lighten px-2! py-1! text-xs! font-bold! [&>svg]:w-4! [&>svg]:h-4!'
    />
  )
}

export function TagPresence({ estPresent }: { estPresent?: boolean }) {
  let label = 'Présent'
  if (estPresent === undefined) label = 'Inscrit'
  else if (!estPresent) label = 'Absent'
  return (
    <Tag
      className='text-primary bg-primary-lighten rounded-large text-wrap!'
      label={label}
    />
  )
}
