import Link from 'next/link'

import BackIcon from '../../assets/icons/arrow_back.svg'

import FilAriane from 'components/FilAriane'
import styles from 'styles/components/Layouts.module.css'

interface HeaderProps {
  currentPath: string
  returnTo?: string
  pageHeader: string
}

export function Header({ currentPath, pageHeader, returnTo }: HeaderProps) {
  return (
    <header className={styles.header}>
      {!returnTo && (
        <>
          <FilAriane currentPath={currentPath} />
          <h1 className='text-xl-medium text-primary'>{pageHeader}</h1>
        </>
      )}

      {returnTo && (
        <div className='flex items-center'>
          <Link href={returnTo}>
            <a>
              <BackIcon aria-hidden={true} focusable={false} />
              <span className='sr-only'>Page précédente</span>
            </a>
          </Link>
          <h1 className='ml-4 text-xl-medium text-primary'>{pageHeader}</h1>
        </div>
      )}
    </header>
  )
}
