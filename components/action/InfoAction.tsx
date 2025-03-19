import { ReactNode } from 'react'

interface InfoActionProps {
  label: string
  children: ReactNode
  isForm?: boolean
  isInline?: boolean
}

export default function InfoAction({
  label,
  children,
  isForm = false,
  isInline = false,
}: InfoActionProps) {
  return (
    <>
      <dt
        className={`${
          isInline ? 'text-base-medium' : 'text-m-bold pb-6 flex items-center'
        }`}
      >
        {label}
        {isInline && ' :'}
      </dt>
      <dd
        className={`${
          isInline
            ? 'primary-lighten mb-3 pl-3 text-base-bold'
            : 'text-base-regular pb-10'
        }`}
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
