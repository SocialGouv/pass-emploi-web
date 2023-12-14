import { ReactNode } from 'react'

import layout from './layout.module.css'

import Sidebar from 'components/Sidebar'

export default async function LayoutWithSidebar({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className='flex h-[100vh] w-[100vw]'>
      <div className={layout.sidebar}>
        <Sidebar />
      </div>

      {children}
    </div>
  )
}
