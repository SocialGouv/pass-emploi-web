import Link from 'next/link'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import mapRoutesToLabels from 'utils/route-labels'

interface LienRetourProps {
  returnUrlOrPath: string
}

export default function LienRetour({ returnUrlOrPath }: LienRetourProps) {
  function getLabelLienRetour(pathOrUrl: string): string | undefined {
    const regExps: RegExp[] = Array.from(mapRoutesToLabels.keys())
    const pathname = pathOrUrl.startsWith('http')
      ? new URL(pathOrUrl).pathname
      : pathOrUrl.split('?')[0]

    const route = regExps.find((regex) => regex.test(pathname))
    if (route) {
      return `à ${mapRoutesToLabels.get(route) ?? pathOrUrl}`
    }
  }

  return (
    <nav aria-label="Fil d'ariane">
      <Link
        href={returnUrlOrPath}
        className='flex items-center text-s-regular text-content-color underline hover:text-primary'
      >
        <IconComponent
          name={IconName.ArrowBackward}
          aria-hidden={true}
          focusable={false}
          className='w-4 h-4 fill-current mr-3'
        />
        Retour {getLabelLienRetour(returnUrlOrPath)}
      </Link>
    </nav>
  )
}
