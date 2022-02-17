import { ReactNode } from 'react'

interface InfoActionProps {
  label: string
  children: ReactNode
  isForm?: boolean
}

function InfoAction({ label, children, isForm = false }: InfoActionProps) {
  const styles =
    'py-4 border-0 border-b border-solid border-b-primary_lighten text-bleu text-sm-regular'
  return (
    <>
      <dt
        className={`${styles} ${
          isForm ? 'flex items-center' : ''
        } whitespace-nowrap`}
      >
        {label}
      </dt>
      <dd className={`${styles} pl-6`}>
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
