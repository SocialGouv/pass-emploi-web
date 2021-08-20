/**
 * Shared Layout, see: https://nextjs.org/docs/basic-features/layouts
 */

//  import Navbar from './navbar'
 import Header from './Header'
 

type LayoutProps = {
  children: any
}

export default function Layout({ children }: LayoutProps) {
   return (
     <>
       <Header />
       <main>{children}</main>
       {/* <Footer /> */}
     </>
   )
 }