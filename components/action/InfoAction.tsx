import { ReactNode } from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'

interface InfoActionProps {
  label: string
  children: ReactNode
  isForm?: boolean
  isInline?: boolean
}

function InfoAction({
  label,
  children,
  isForm = false,
  isInline = false,
}: InfoActionProps) {
  const styles = 'text-m-bold pb-6 flex items-center'

  return (
    <>
      <dt
        className={`${
          isInline
            ? 'text-base-medium py-4 border-0 border-t border-solid border-t-primary_lighten'
            : styles
        }`}
      >
        {!isInline && (
          <IconComponent
            name={IconName.DecorativePoint}
            aria-hidden={true}
            focusable={false}
            className='w-2 h-2 mr-4'
          />
        )}
        <span>{label}</span>
      </dt>
      <dd
        className={`${
          isInline
            ? 'py-4 border-0 border-t border-solid border-t-primary_lighten'
            : 'text-base-regular pb-10'
        } pl-6`}
      >
        {isForm && (
          <form
            onSubmit={(e) => {
              e.preventDefault()
            }}
          >
            <fieldset className='flex items-center border-none'>
              <legend className='sr-only'>{label}</legend>
              {children}
            </fieldset>{' '}
          </form>
        )}
        {!isForm && children}
      </dd>
    </>
  )
}

export default InfoAction
