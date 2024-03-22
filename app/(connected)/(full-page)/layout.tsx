import { ReactNode } from 'react'

import { ID_CONTENU } from 'components/ids'

export default function FullPageLayout({ children }: { children: ReactNode }) {
  return (
    <div id={ID_CONTENU} className='h-dvh w-screen overflow-y-auto'>
      <div className='flex flex-col justify-center m-auto max-w-[800px] py-10'>
        {children}
      </div>
    </div>
  )
}
