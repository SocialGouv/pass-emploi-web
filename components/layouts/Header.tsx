import Link from 'next/link'

import FilAriane from 'components/FilAriane'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import styles from 'styles/components/Layouts.module.css'

interface HeaderProps {
  currentPath: string
  currentRoute: string
  returnTo?: string
  pageHeader: string
}

export function Header({
  currentPath,
  currentRoute,
  pageHeader,
  returnTo,
}: HeaderProps) {
  return (
    <header className={styles.header}>
      {!returnTo && (
        <>
          <FilAriane currentPath={currentPath} currentRoute={currentRoute} />
          <h1 className='text-xl-medium text-primary'>{pageHeader}</h1>
        </>
      )}

      {returnTo && (
        <div className='flex items-center'>
          <Link href={returnTo}>
            <a className='p-3 border-none rounded-full bg-primary_lighten'>
              <IconComponent
                name={IconName.ChevronLeft}
                aria-hidden={true}
                focusable={false}
                className='w-6 h-6 fill-primary'
              />
              <span className='sr-only'>Page précédente</span>
            </a>
          </Link>
          <h1 className='ml-4 text-xl-medium text-primary'>{pageHeader}</h1>
        </div>
      )}
    </header>
  )
}
