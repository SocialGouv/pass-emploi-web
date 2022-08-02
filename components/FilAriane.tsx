import Link from 'next/link'
import { useEffect, useState } from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'

interface FilArianeProps {
  currentPath: string
  currentRoute: string
}

export default function FilAriane({
  currentPath,
  currentRoute,
}: FilArianeProps) {
  const [ariane, setAriane] = useState<{ fragment: string; href: string }[]>([])

  const routeToFragment: { [key: string]: string } = {
    '/mes-jeunes': 'Mes jeunes',
    '/mes-jeunes/[jeune_id]': 'Fiche jeune',
    '/mes-jeunes/[jeune_id]/actions': 'Actions',
    '/mes-jeunes/[jeune_id]/actions/[action_id]': 'Détail action',
  }

  useEffect(() => {
    const crumbs: { fragment: string; href: string }[] = []
    const splittedPath = currentPath.split('/').slice(1)
    const splittedRoute = currentRoute.split('/').slice(1)
    let rebuiltPath = ''
    let rebuiltRoute = ''

    splittedPath.forEach((fragment, index) => {
      rebuiltPath += `/${fragment}`
      rebuiltRoute += `/${splittedRoute[index]}`
      crumbs.push({
        fragment: routeToFragment[rebuiltRoute] ?? fragment,
        href: rebuiltPath,
      })
    })
    setAriane(crumbs.length > 1 ? crumbs : [])
  }, [currentPath, currentRoute])

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
