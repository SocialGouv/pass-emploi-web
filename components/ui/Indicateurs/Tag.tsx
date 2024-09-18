import React, { ReactElement } from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import { StructureConseiller } from 'interfaces/conseiller'

interface TagProps {
  label: string
  color: string
  backgroundColor: string
  className?: string
  iconName?: IconName
  iconLabel?: string
  isSmallTag?: boolean
}

interface TagCategorieActionProps {
  categorie?: string
}

interface TagTypeProps {
  isSession?: boolean
  type?: string
  source?: string
  isSmallTag?: boolean
}

function Tag({
  label,
  color,
  backgroundColor,
  className,
  iconName,
  iconLabel,
  isSmallTag,
}: TagProps) {
  return (
    <span
      className={`flex items-center w-fit text-s-medium text-${color} px-3 bg-${backgroundColor} whitespace-nowrap ${
        className ?? ''
      } ${isSmallTag ? '!px-2 !py-1 !text-xs !font-bold [&>svg]:!w-4 [&>svg]:!h-4' : ''}`}
    >
      {iconName && (
        <IconComponent
          name={iconName}
          aria-hidden={!iconLabel}
          className='h-5 w-5 mr-1 fill-current'
          aria-label={iconLabel ? iconLabel : undefined}
          title={iconLabel ? iconLabel : undefined}
          role='img'
        />
      )}
      {label}
    </span>
  )
}

export function TagMetier({ className, ...props }: TagProps) {
  return <Tag className={'rounded-base ' + className} {...props} />
}

export function TagStatut({ className, ...props }: TagProps) {
  return <Tag className={'rounded-l ' + className} {...props} />
}

export function TagDate({
  className,
  label,
}: Pick<TagProps, 'className' | 'label'>) {
  return (
    <Tag
      className={'rounded-l ' + className}
      backgroundColor='grey_100'
      color='grey_800'
      label={label}
    />
  )
}

export function TagType({
  isSession,
  type,
  source,
  isSmallTag = false,
}: TagTypeProps): ReactElement {
  let tagProps: {
    color: string
    iconName?: IconName
    iconLabel?: string
    background?: string
  } = {
    color: 'content_color',
    iconName: undefined,
    iconLabel: undefined,
    background: 'additional_5',
  }
  if (source === StructureConseiller.MILO)
    tagProps = {
      color: 'content_color',
      iconName: IconName.Lock,
      iconLabel: 'Non modifiable',
      background: 'additional_5',
    }

  if (isSession)
    tagProps = {
      color: 'accent_1',
      iconName: IconName.Lock,
      iconLabel: 'Informations de la session non modifiables',
      background: 'accent_1',
    }

  return (
    <TagMetier
      label={type!}
      color={tagProps.color}
      backgroundColor={tagProps.background + '_lighten'}
      iconName={tagProps.iconName}
      iconLabel={tagProps.iconLabel}
      isSmallTag={isSmallTag}
    />
  )
}

export function TagCategorieAction({ categorie }: TagCategorieActionProps) {
  if (categorie)
    return (
      <Tag
        className='rounded-l text-wrap'
        backgroundColor='primary_lighten'
        color='primary'
        label={categorie}
      />
    )

  return (
    <Tag
      className='rounded-l'
      backgroundColor='white'
      color='alert'
      iconName={IconName.Warning}
      label='Catégorie manquante'
    />
  )
}
