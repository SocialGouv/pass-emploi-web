import React from 'react'

interface RdvTypeItemProps {
  type: string
}

export const RdvTypeItem = ({ type }: RdvTypeItemProps) => {
  return (
    <span className='bg-[pink] border border-solid border-[#3B69D1] rounded-x_large px-4 py-1 text-sm-regular text-[#3B69D1] whitespace-nowrap'>
      {type}
    </span>
  )
}
