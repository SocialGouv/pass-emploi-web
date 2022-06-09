import { ReactNode } from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'

interface InfoActionProps {
  label: string
  children: ReactNode
  isForm?: boolean
}

function InfoAction({ label, children, isForm = false }: InfoActionProps) {
  const styles = 'text-m-medium pb-6 text-sm-regular flex items-center'
  return (
    <>
      <dt className={`${styles}`}>
        <IconComponent
          name={IconName.DecorativePoint}
          aria-hidden={true}
          focusable={false}
          className='w-2 h-2 mr-4'
        />
        <span>{label}</span>
      </dt>
      <dd className={`text-base-regular pb-10`}>
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
