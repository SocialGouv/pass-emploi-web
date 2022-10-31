import FilAriane from 'components/FilAriane'
import LienRetour from 'components/LienRetour'
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
          <h1 className='text-l-bold text-primary'>{pageHeader}</h1>
        </>
      )}

      {returnTo && (
        <>
          <LienRetour returnUrlOrPath={returnTo} />
          <h1 className='text-l-bold text-primary'>{pageHeader}</h1>
        </>
      )}
    </header>
  )
}
