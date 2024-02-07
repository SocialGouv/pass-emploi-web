import { ReactNode } from 'react'

import PageLayout from 'app/(connected)/(with-sidebar)/PageLayout'
import sidebarLayout from 'app/(connected)/(with-sidebar)/sidebar.module.css'
import Sidebar from 'components/Sidebar'

export default async function LayoutWithoutChat({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className='flex h-[100dvh] w-[100vw]'>
      <div className={sidebarLayout.sidebar}>
        <Sidebar />
      </div>

      <PageLayout fullWidth={false}>{children}</PageLayout>
    </div>
  )
}
