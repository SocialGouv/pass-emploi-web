import { ReactNode } from 'react'

import layout from 'app/(connected)/(with-sidebar)/(without-chat)/layout.module.css'
import PageLayout from 'app/(connected)/(with-sidebar)/PageLayout'
import Sidebar from 'components/Sidebar'

export default async function LayoutWithoutChat({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className='flex h-[100vh] w-[100vw]'>
      <div className={layout.sidebar}>
        <Sidebar />
      </div>

      <PageLayout fullWidth={false}>{children}</PageLayout>
    </div>
  )
}
