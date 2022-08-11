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
  const [ariane, setAriane] = useState<{ label: string; href: string }[]>([])

  const routeToLabel: { [key: string]: string } = {
    '/mes-jeunes': 'Portefeuille',
    '/mes-jeunes/[jeune_id]': 'Fiche jeune',
    '/mes-jeunes/[jeune_id]/favoris': 'Favoris',
    '/mes-jeunes/milo/creation-jeune': 'Création',
    '/mes-jeunes/pole-emploi/creation-jeune': 'Création',
    '/mes-jeunes/[jeune_id]/actions/[action_id]': 'Détail action',
  }

  function creationFilAriane() {
    const liensFilAriane: { label: string; href: string }[] = []
    const splittedPath = currentPath.split('/').slice(1)
    const splittedRoute = currentRoute.split('/').slice(1)
    let rebuiltPath = ''
    let rebuiltRoute = ''

    splittedPath.forEach((fragmentPath, index) => {
      rebuiltPath += `/${fragmentPath}`
      rebuiltRoute += `/${splittedRoute[index]}`
      if (routeToLabel.hasOwnProperty(rebuiltRoute)) {
        liensFilAriane.push({
          label: routeToLabel[rebuiltRoute] ?? fragmentPath,
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
        {ariane.map(({ href, label }, index) => (
          <li key={label} className='flex items-center'>
            {index < ariane.length - 1 && (
              <>
                <Link href={href}>
                  <a className='text-s-regular text-content_color underline hover:text-primary_darken'>
                    {label}
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
                  {label}
                </a>
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
