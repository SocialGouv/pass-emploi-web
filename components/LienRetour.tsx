import Link from 'next/link'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import routesToLabel from 'utils/route-labels'

interface LienRetourProps {
  returnUrlOrPath: string
}

export default function LienRetour({ returnUrlOrPath }: LienRetourProps) {
  function getLabelLienRetour(pathOrUrl: string): string | undefined {
    const regExps: RegExp[] = Array.from(routesToLabel.keys())
    const path = pathOrUrl.startsWith('http')
      ? new URL(pathOrUrl).pathname
      : pathOrUrl

    const route = regExps.find((regex) => regex.test(path))
    if (route) {
      return routesToLabel.get(route) ?? pathOrUrl
    }
  }

  return (
    <nav aria-label="Fil d'ariane">
      <Link
        href={returnUrlOrPath}
        className='flex items-center text-s-regular text-content_color underline hover:text-primary_darken'
      >
        <IconComponent
          name={IconName.ArrowLeft}
          aria-hidden={true}
          focusable={false}
          className='w-4 h-4 fill-[currentColor] mr-3'
        />
        Retour à {getLabelLienRetour(returnUrlOrPath)}
      </Link>
    </nav>
  )
}
