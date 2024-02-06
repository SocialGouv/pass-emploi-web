import { ReactNode } from 'react'

export default function FullPageLayout({ children }: { children: ReactNode }) {
  return (
    <div className='h-[100vh] w-[100vw] overflow-y-auto'>
      <div className='flex flex-col justify-center m-auto max-w-[800px] py-10'>
        {children}
      </div>
    </div>
  )
}
