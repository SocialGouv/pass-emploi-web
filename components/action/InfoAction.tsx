import React from 'react'

interface InfoActionProps {
  label: string
  children: any
}

function InfoAction({ label, children }: InfoActionProps) {
  const styles =
    'flex items-center py-4 border-0 border-b border-solid border-b-primary_lighten text-bleu text-sm-regular'
  return (
    <>
      <dt className={`${styles} whitespace-nowrap`}>{label}</dt>
      <dd className={`${styles} pl-6`}>{children}</dd>
    </>
  )
}

export default InfoAction
