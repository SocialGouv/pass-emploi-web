import Link from 'next/link'
import { useEffect, useState } from 'react'

import ChevronIcon from '../assets/icons/chevron_right.svg'

interface FilArianeProps {
  currentPath: string
}

export default function FilAriane({ currentPath }: FilArianeProps) {
  const [ariane, setAriane] = useState<{ fragment: string; href: string }[]>([])

  useEffect(() => {
    const crumbs: { fragment: string; href: string }[] = []
    currentPath
      .split('/')
      .slice(1, -1)
      .forEach((fragment, index) => {
        if (index > 0) {
          crumbs.push({
            fragment,
            href: `${crumbs[index - 1].href}/${fragment}`,
          })
        } else {
          crumbs.push({ fragment, href: `/${fragment}` })
        }
      })
    setAriane(crumbs)
  }, [currentPath])

  return (
    <ul className='mb-2 flex items-center'>
      {ariane.map(({ href, fragment }, index) => (
        <li key={fragment} className='flex items-center'>
          {index > 0 && (
            <ChevronIcon
              aria-hidden={true}
              focusable={false}
              className='mx-2 fill-content_color'
            />
          )}
          <Link href={href}>
            <a className='text-sm-regular text-content_color underline hover:text-primary_darken'>
              {fragment}
            </a>
          </Link>
        </li>
      ))}
    </ul>
  )
}
