import Link from 'next/link'
import { useEffect, useState } from 'react'

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
    <ul className='mb-2 flex'>
      {ariane.map(({ href, fragment }, index) => (
        <li key={fragment}>
          {index > 0 && (
            <span className='mx-2' aria-hidden={true}>
              /
            </span>
          )}
          <Link href={href}>
            <a className='text-primary hover:text-primary_darken'>{fragment}</a>
          </Link>
        </li>
      ))}
    </ul>
  )
}
