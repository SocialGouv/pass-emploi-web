import Link from 'next/link'
import { useEffect, useState } from 'react'

import IconComponent, { IconName } from './ui/IconComponent'

interface FilArianeProps {
  currentPath: string
}

export default function FilAriane({ currentPath }: FilArianeProps) {
  const [ariane, setAriane] = useState<{ fragment: string; href: string }[]>([])

  useEffect(() => {
    const crumbs: { fragment: string; href: string }[] = []
    getCurrentPathSansLesPathsANePasAfficher(currentPath)
      .split('/')
      .slice(1)
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
    setAriane(crumbs.length > 1 ? crumbs : [])
  }, [currentPath])

  return (
    <nav aria-label="Fil d'ariane">
      <ol className='mb-2 flex items-center'>
        {ariane.map(({ href, fragment }, index) => (
          <li key={fragment} className='flex items-center'>
            {index < ariane.length - 1 && (
              <>
                <Link href={href}>
                  <a className='text-s-regular text-content_color underline hover:text-primary_darken'>
                    {fragment}
                  </a>
                </Link>
                <IconComponent
                  name={IconName.ChevronRight}
                  aria-hidden={true}
                  focusable={false}
                  className='mx-2 w-6 h-6 fill-content_color'
                />
              </>
            )}
            {index === ariane.length - 1 && (
              <Link href={href}>
                <a
                  aria-current='page'
                  className='text-s-regular text-content_color'
                >
                  {fragment}
                </a>
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

function getCurrentPathSansLesPathsANePasAfficher(currentPath: string) {
  return currentPath.replace('/actions', '')
}
