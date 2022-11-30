import React, { ChangeEvent, useRef } from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import buttonStyle from 'styles/components/Button.module.css'
import style from 'styles/components/FileInput.module.css'

type FileInputProps = {
  id: string
  onChange: (fichier: File) => void
  ariaDescribedby?: string
  iconOnly?: boolean
  invalid?: boolean
  disabled?: boolean
}
export default function FileInput({
  id,
  onChange,
  ariaDescribedby,
  iconOnly = false,
  invalid = false,
  disabled = false,
}: FileInputProps) {
  const hiddenFileInput = useRef<HTMLInputElement>(null)

  const styleLabel = iconOnly
    ? 'bg-primary w-12 h-12 border-none rounded-full short:hidden'
    : `${buttonStyle.button} ${buttonStyle.buttonSecondary} w-fit text-s-bold`
  const styleIcone = iconOnly ? 'm-auto w-6 h-6 fill-blanc' : 'w-4 h-4 mr-2'

  function emettreFichier(
    event: ChangeEvent<HTMLInputElement>
  ): File | undefined {
    if (!event.target.files || !event.target.files[0]) return

    onChange(event.target.files[0])

    hiddenFileInput.current!.value = ''
  }

  return (
    <>
      <input
        id={id}
        type='file'
        ref={hiddenFileInput}
        aria-describedby={ariaDescribedby + (invalid ? ` ${id}--error` : '')}
        aria-invalid={invalid}
        onChange={emettreFichier}
        className={style.input + ' sr-only'}
        accept='.pdf, .png, .jpeg, .jpg'
        disabled={disabled}
      />
      <label htmlFor={id} className={'cursor-pointer ' + styleLabel}>
        <IconComponent
          name={IconName.File}
          aria-hidden={true}
          focusable={false}
          className={styleIcone}
        />
        <span className={iconOnly ? 'sr-only' : ''}>
          Ajouter une pièce jointe
        </span>
      </label>
    </>
  )
}
