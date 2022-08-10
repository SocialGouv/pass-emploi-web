import Link from 'next/link'
import { useEffect, useState } from 'react'

import IconComponent, { IconName } from './ui/IconComponent'

interface FilArianeProps {
  currentPath: string
  currentRoute: string
}

export default function FilAriane({
  currentPath,
  currentRoute,
}: FilArianeProps) {
  const [ariane, setAriane] = useState<{ labelPath: string; href: string }[]>(
    []
  )

  const routeToLabelPath: { [key: string]: string } = {
    // niveau 1
    '/mes-jeunes': 'Portefeuille',
    // niveau2
    '/mes-jeunes/[jeune_id]': 'Fiche jeune',
    '/mes-jeunes/[jeune_id]/favoris': 'Favoris',
    '/mes-jeunes/milo/creation-jeune': 'Création',
    '/mes-jeunes/pole-emploi/creation-jeune': 'Création',
    // niveau 3
    '/mes-jeunes/[jeune_id]/actions/[action_id]': 'Détail action',
  }

  function creationFilAriane() {
    const liensFilAriane: { labelPath: string; href: string }[] = []
    const splittedPath = currentPath.split('/').slice(1)
    const splittedRoute = currentRoute.split('/').slice(1)
    let rebuiltPath = ''
    let rebuiltRoute = ''

    splittedPath.forEach((fragment, index) => {
      rebuiltPath += `/${fragment}`
      rebuiltRoute += `/${splittedRoute[index]}`
      if (routeToLabelPath.hasOwnProperty(rebuiltRoute)) {
        liensFilAriane.push({
          labelPath: routeToLabelPath[rebuiltRoute] ?? fragment,
          href: rebuiltPath,
        })
      }
    })

    return liensFilAriane.length > 1 ? liensFilAriane : []
  }

  useEffect(() => {
    const filAriane = creationFilAriane()
    setAriane(filAriane)
  }, [currentPath, currentRoute])

  return (
    <nav aria-label="Fil d'ariane">
      <ol className='mb-2 flex items-center'>
        {ariane.map(({ href, labelPath }, index) => (
          <li key={labelPath} className='flex items-center'>
            {index < ariane.length - 1 && (
              <>
                <Link href={href}>
                  <a className='text-s-regular text-content_color underline hover:text-primary_darken'>
                    {labelPath}
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
                  {labelPath}
                </a>
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
