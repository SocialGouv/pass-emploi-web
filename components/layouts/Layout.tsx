/**
 * Shared Layout, see: https://nextjs.org/docs/basic-features/layouts
 */

 import Header from './Header'
 import Sidebar from './Sidebar'


 import styles from 'styles/components/Layouts.module.css'

type LayoutProps = {
  children: any
}

export default function Layout({ children }: LayoutProps) {
   return (
     <>
      <Header />
      <div style={{position: "relative"}}>
          <Sidebar />
          <main className={styles.page} role="main">{children}</main>
      </div>
     </>
   )
 }