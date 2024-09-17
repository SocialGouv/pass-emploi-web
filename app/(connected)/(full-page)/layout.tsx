import React, { ReactNode } from 'react'

import { ID_CONTENU } from 'components/ids'

export default function FullPageLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style>{`html {overflow-y: auto;}
      body 
                  {
                    position: static; 
                    height: auto;
                    overflow-y: auto;
                   } 
               `}</style>
      <div id={ID_CONTENU} className='w-screen' tabIndex={-1}>
        <div className='flex flex-col justify-center m-auto max-w-[800px] py-10'>
          {children}
        </div>
      </div>
    </>
  )
}
