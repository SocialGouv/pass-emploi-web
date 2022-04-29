import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import React from 'react'

import { Conseiller, UserStructure } from 'interfaces/conseiller'
import { ConseillerService } from 'services/conseiller.service'
import styles from 'styles/components/Layouts.module.css'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import withDependance from 'utils/injectionDependances/withDependance'

interface ProfilProps {
  conseiller: Conseiller
  structureConseiller: string
  pageTitle: string
}

function Profil({ conseiller, structureConseiller }: ProfilProps) {
  const labelAgence =
    structureConseiller === UserStructure.MILO ? 'Mission locale' : 'agence'

  useMatomo('Profil')

  return (
    <>
      <div className={styles.header}>
        <h1 className='h2-semi text-bleu_nuit'>Profil</h1>
      </div>
      <div className={styles.content}>
        <h2 className='h2-semi text-bleu_nuit'>
          {conseiller.firstName} {conseiller.lastName}
        </h2>
        <dl className='mt-3 text-sm-semi text-bleu_nuit'>
          {conseiller.email && (
            <>
              <dt aria-label='Votre e-mail' className='mt-2 inline'>
                Votre e-mail :
              </dt>
              <dd className='ml-2 inline'>{conseiller.email}</dd>
            </>
          )}

          {conseiller.agence && (
            <>
              <dt
                aria-label={`Votre ${labelAgence}`}
                className='mt-2 inline before:block before:content-[""]'
              >
                Votre {labelAgence} :
              </dt>
              <dd className='ml-2 inline'>{conseiller.agence.nom}</dd>
            </>
          )}
        </dl>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<ProfilProps> = async (
  context
) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const conseillerService =
    withDependance<ConseillerService>('conseillerService')
  const { user, accessToken } = sessionOrRedirect.session
  const conseiller = await conseillerService.getConseiller(user.id, accessToken)
  if (!conseiller) throw new Error(`Conseiller ${user.id} inexistant`)

  return {
    props: {
      conseiller: conseiller,
      structureConseiller: user.structure,
      pageTitle: 'Mon profil',
    },
  }
}

export default withTransaction(Profil.name, 'page')(Profil)
