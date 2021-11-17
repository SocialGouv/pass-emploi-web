import React from "react"
import {Jeune} from "interfaces";


export const DetailsJeune = ({firstName, lastName, id} : Jeune )=> {
    return (

           <>
               <h1 className='h2-semi text-bleu-nuit pb-[2.4rem]'>{firstName} {lastName}</h1>
               <div className='text-sm-semi text-bleu_nuit'>
                   <dl className='flex'>
                       <dt className='mr-[1rem]'>Identifiant:</dt>
                       <dd >
                           {id}
                       </dd>
                   </dl>

               </div>
           </>

    )
}