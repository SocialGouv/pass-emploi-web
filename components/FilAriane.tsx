import Link from 'next/link'
import { useEffect, useState } from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import mapRoutesToLabels from 'utils/route-labels'

type FilArianeProps = {
  currentPath: string
}

export default function FilAriane({ currentPath }: FilArianeProps) {
  const [ariane, setAriane] = useState<Array<{ label: string; href: string }>>(
    []
  )

  function creationFilAriane(path: string) {
    const liensFilAriane: { label: string; href: string }[] = []
    const pathWithoutQuery = path.split('?')[0]
    const splittedPath = pathWithoutQuery.split('/').slice(1)
    let rebuiltPath = ''

    const regExps: RegExp[] = Array.from(mapRoutesToLabels.keys())
    splittedPath.forEach((fragmentPath) => {
      rebuiltPath += `/${fragmentPath}`

      const route = regExps.find((regex) => regex.test(rebuiltPath))
      if (route) {
        liensFilAriane.push({
          label: mapRoutesToLabels.get(route) ?? fragmentPath,
          href: rebuiltPath,
        })
      }
    })

    return liensFilAriane.length > 1 ? liensFilAriane : []
  }

  useEffect(() => {
    const filAriane = creationFilAriane(currentPath)
    setAriane(filAriane)
  }, [currentPath])

  return (
    <nav role='navigation' aria-label="Fil d'ariane">
      <ol className='mb-2 flex items-center'>
        {ariane.map(({ href, label }, index) => (
          <li key={label} className='flex items-center'>
            {index < ariane.length - 1 && (
              <>
                <Link
                  href={href}
                  className='text-s-regular text-content_color underline hover:text-primary_darken'
                >
                  {label}
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
              <Link
                href={href}
                aria-current='page'
                className='text-s-regular text-content_color'
              >
                {label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
