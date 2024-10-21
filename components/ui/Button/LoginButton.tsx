import React from 'react'

import Button, { ButtonStyle } from 'components/ui/Button/Button'
import IllustrationComponent, {
  IllustrationName,
} from 'components/ui/IllustrationComponent'

interface FormButtonProps {
  altText?: string
  illustrationName: IllustrationName
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  className?: string
  label?: string
  style?: ButtonStyle
}

export default function LoginButton({
  altText,
  illustrationName,
  label,
  handleSubmit,
  className,
  style = ButtonStyle.PRIMARY,
}: FormButtonProps) {
  return (
    <form onSubmit={handleSubmit} className={className}>
      <Button type='submit' className='w-full flex' style={style}>
        {altText && <span className='sr-only'>{altText}</span>}

        <IllustrationComponent
          name={illustrationName}
          className='mr-4 w-[50px] fill-primary_darken'
          focusable={false}
          aria-hidden={true}
        />

        {label}
      </Button>
    </form>
  )
}
