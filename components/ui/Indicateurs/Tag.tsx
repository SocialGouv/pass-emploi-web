import React, { ReactElement } from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import { unsafeRandomId } from 'utils/helpers'

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
    <Tag className='bg-grey_100 text-grey_800 rounded-large' label={label} />
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
    style: 'text-content_color bg-additional_5_lighten',
    iconName: undefined,
    iconLabel: undefined,
  }

  if (source === 'MILO')
    tagProps = {
      style: 'text-content_color bg-additional_5_lighten',
      iconName: IconName.Lock,
      iconLabel: 'Non modifiable',
    }

  if (isSession)
    tagProps = {
      style: 'text-accent_1 bg-accent_1_lighten',
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
        className='text-primary bg-primary_lighten rounded-large text-wrap!'
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
