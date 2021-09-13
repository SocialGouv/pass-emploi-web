import type { GetServerSideProps } from 'next'
import Link from 'next/link'

import { Jeune, UserAction } from 'interfaces'

import EmptyActionsImage from '../../assets/icons/empty_data.svg'

import linkStyles from 'styles/components/Link.module.css'

interface JeuneActions extends Jeune {
  actions: UserAction[]
  nbActionsEnCours: number
  nbActionsTerminees: number
}

type HomeProps = {
  jeunes: JeuneActions[]
}

function Home({jeunes}: HomeProps)  {
  return (
    <>
      <h1 className='h2 text-bleu_nuit mb-[45px]'>Les actions de mes bénéficaires</h1>

      {!jeunes?.length && <>
          <EmptyActionsImage focusable="false" aria-hidden="true" className='m-auto mb-[30px]'/> 
          <p className='text-md-semi text-bleu_nuit text-center'>
            Vous devriez avoir des jeunes inscrits pour visualiser leurs actions 
          </p>
      </>}

      <ul className='grid grid-cols-2 gap-5 xl:grid-cols-3 md:grid-cols-2 sm:grid-cols-1'>
        {jeunes.map((jeune: JeuneActions) => (
          <li key={`actions-${jeune.id}`} className='p-[15px] rounded-medium' style={{boxShadow:'0px 0px 10px rgba(118, 123, 168, 0.3)'}}>

            <h2 className='text-md text-bleu_nuit mb-[19px]'>
              Les actions de {jeune.firstName} {jeune.lastName}
            </h2>

            
            <p className='text-xs text-bleu_nuit flex mb-[25px]'>
              {jeune.nbActionsEnCours !== 0 ? `${jeune.firstName} a ${jeune.nbActionsEnCours} ${jeune.nbActionsEnCours === 1 ? 'action' : 'actions'} en cours` : `${jeune.firstName} n'a pas d'actions en cours pour le moment`}
            </p>

            <p className='text-xs text-bleu_nuit flex mb-[45px]'>
              {jeune.nbActionsTerminees !== 0 ? `${jeune.firstName} a ${jeune.nbActionsTerminees} ${jeune.nbActionsTerminees === 1 ? 'action terminée' : 'actions terminées'}` : `${jeune.firstName} n'a pas d'actions terminées pour le moment`}
            </p>

            <Link href={`/jeunes/${jeune.id}/actions`} passHref>
              <a className={`text-xs float-right ${linkStyles.buttonBlue}`}>
                VOIR LES ACTIONS
              </a>
            </Link>

          </li>
        ))
        }
      </ul>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const res = await fetch(`${process.env.API_ENDPOINT}/conseiller/jeunes`)

  const data = await res.json()

  if (!data) {
    return {
      notFound: true,
    }
  }

   await Promise.all(
    data.map(async (jeune: JeuneActions) => {
      const actionsRes = await fetch(`${process.env.API_ENDPOINT}/conseiller/jeunes/${jeune.id}/actions`)
      const actionRes = await actionsRes.json()
      jeune.actions = actionRes.actions
      jeune.nbActionsEnCours = actionRes.actions.filter((action: UserAction) => !action.isDone).length
      jeune.nbActionsTerminees = actionRes.actions.filter((action: UserAction) => action.isDone).length
    })
  )


  return {
    props:  {
      jeunes: data
    } ,
  }
}

export default Home
