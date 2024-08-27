import React, {
  ChangeEvent,
  ReactElement,
  ReactNode,
  useRef,
  useState,
} from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import styles from 'styles/components/SelectButton.module.css'

export default function SelectButton({
  id,
  children,
  onChange,
  value,
  className,
}: {
  id: string
  children: ReactNode
  onChange: (event: ChangeEvent<HTMLSelectElement>) => Promise<void>
  value: string
  className?: string
}): ReactElement {
  const selectRef = useRef<HTMLSelectElement>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  async function triggerChange(event: ChangeEvent<HTMLSelectElement>) {
    setIsLoading(true)
    selectRef.current!.style.visibility = 'hidden'
    try {
      await onChange(event)
    } finally {
      setIsLoading(false)
      selectRef.current!.style.visibility = 'visible'
      selectRef.current!.focus()
    }
  }

  return (
    <div
      className={`${className} ${styles.wrapper} ${isLoading ? styles.loading : ''}`}
    >
      <span role='alert'>
        {isLoading && (
          <>
            <IconComponent
              aria-hidden={true}
              focusable={false}
              name={IconName.Spinner}
              title='Chargement en cours'
              className='w-6 h-6 fill-[currentColor] animate-spin absolute top-0 bottom-0 left-0 right-0 m-auto'
            />
            <span className='sr-only'>Chargement en cours</span>
          </>
        )}
      </span>

      <select id={id} ref={selectRef} onChange={triggerChange} value={value}>
        {children}
      </select>
    </div>
  )
}
