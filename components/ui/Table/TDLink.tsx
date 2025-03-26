import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import TD from 'components/ui/Table/TD'
import { getVisibleText, unsafeRandomId } from 'utils/helpers'

export default function TDLink({
  href,
  labelPrefix,
  className,
}: {
  href: string
  labelPrefix: string
  className?: string
}) {
  const tdRef = useRef<HTMLTableCellElement>(null)
  const [label, setLabel] = useState<string>(labelPrefix)
  const labelId = 'tdlink-icon-' + unsafeRandomId()

  useEffect(() => {
    const rowVisibleText = Array.from(tdRef.current!.parentElement!.children)
      .slice(0, -1)
      .map(getVisibleText)
      .filter((cellVisibleText) => cellVisibleText !== null)

    setLabel(labelPrefix + ' ' + rowVisibleText.join(' '))
  }, [])

  // a11y card : https://kittygiraudel.com/2022/04/02/accessible-cards/
  return (
    <TD ref={tdRef} className={className}>
      {/*FIXME bg */}
      <Link
        href={href}
        className='block before:absolute before:inset-0 before:z-10 cursor-pointer'
        title={label}
      >
        <IconComponent
          name={IconName.ChevronRight}
          focusable={false}
          role='img'
          aria-labelledby={labelId}
          className=' w-6 h-6 fill-white rounded-full bg-primary mx-auto'
        />
        <span id={labelId} className='sr-only'>
          {label}
        </span>
      </Link>
    </TD>
  )
}
