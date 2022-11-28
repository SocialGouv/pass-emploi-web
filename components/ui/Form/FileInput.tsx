import React, { ChangeEvent, useRef } from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import buttonStyle from 'styles/components/Button.module.css'
import style from 'styles/components/FileInput.module.css'

type FileInputProps = {
  id: string
  onChange: (fichier: File) => void
  ariaDescribedby?: string
  invalid?: boolean
  disabled?: boolean
}
export default function FileInput({
  id,
  onChange,
  ariaDescribedby,
  invalid = false,
  disabled = false,
}: FileInputProps) {
  const hiddenFileInput = useRef<HTMLInputElement>(null)

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
      <label
        htmlFor={id}
        className={`${buttonStyle.button} ${buttonStyle.buttonSecondary} w-fit text-s-bold cursor-pointer`}
      >
        <IconComponent
          name={IconName.File}
          aria-hidden={true}
          focusable={false}
          className='h-4 w-4 mr-2'
        />
        Ajouter une pièce jointe
      </label>
    </>
  )
}
