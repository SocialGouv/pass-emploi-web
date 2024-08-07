import React from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'

interface TagProps {
  label: string
  color: string
  backgroundColor: string
  className?: string
  iconName?: IconName
  iconLabel?: string
}

interface TagCategorieActionProps {
  categorie?: string
}

function Tag({
  label,
  color,
  backgroundColor,
  className,
  iconName,
  iconLabel,
}: TagProps) {
  return (
    <span
      className={`flex items-center w-fit text-s-medium text-${color} px-3 bg-${backgroundColor} whitespace-nowrap ${
        className ?? ''
      }`}
    >
      {iconName && (
        <IconComponent
          name={iconName}
          aria-hidden={!iconLabel}
          className='h-5 w-5 mr-1 fill-[currentColor]'
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
