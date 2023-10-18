import { ReactNode } from 'react'

import FailureIcon from 'assets/icons/informations/info.svg'

type ErreursFormulaireProps = {
  label: string
  children: ReactNode
}

export default function ErreursFormulaire({
  label,
  children,
}: ErreursFormulaireProps) {
  return (
    <div
      role='alert'
      className='text-warning bg-warning_lighten p-6 rounded-base mb-8'
    >
      <div className='flex items-center mb-8'>
        <FailureIcon
          aria-hidden={true}
          focusable={false}
          className='w-6 h-6 mr-2 fill-warning shrink-0'
        />
        <p className='text-base-bold grow'>{label}</p>
      </div>
      {children}
    </div>
  )
}
