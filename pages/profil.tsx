import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import React, { ChangeEvent } from 'react'

import { Switch } from 'components/ui/Switch'
import { UserStructure } from 'interfaces/conseiller'
import { ConseillerService } from 'services/conseiller.service'
import styles from 'styles/components/Layouts.module.css'
import useMatomo from 'utils/analytics/useMatomo'
import useSession from 'utils/auth/useSession'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { useDependance } from 'utils/injectionDependances'

interface ProfilProps {
  structureConseiller: string
  pageTitle: string
}

function Profil({ structureConseiller }: ProfilProps) {
  const labelAgence =
    structureConseiller === UserStructure.MILO ? 'Mission locale' : 'agence'

  const conseillerService =
    useDependance<ConseillerService>('conseillerService')

  const [conseiller, setConseiller] = useConseiller()
  const { data: session } = useSession<true>({ required: true })

  async function toggleNotificationsSonores(e: ChangeEvent<HTMLInputElement>) {
    const conseillerMisAJour = {
      ...conseiller!,
      notificationsSonores: e.target.checked,
    }
    await conseillerService.modifierNotificationsSonores(
      conseiller!.id,
      conseillerMisAJour.notificationsSonores,
      session!.accessToken
    )
    setConseiller(conseillerMisAJour)
  }

  useMatomo('Profil')

  return (
    <>
      <div className={styles.header}>
        <h1 className='h2-semi text-primary'>Profil</h1>
      </div>
      {conseiller && (
        <div className={styles.content}>
          <section className='mb-8'>
            <h2 className='text-l-medium mb-4'>Informations</h2>
            <div className='pl-4'>
              <h3 className='text-m-medium'>
                {conseiller.firstName} {conseiller.lastName}
              </h3>
              <dl className='mt-3 text-sm-semi'>
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
                    <dd className='ml-2 inline'>{conseiller.agence}</dd>
                  </>
                )}
              </dl>
            </div>
          </section>
          <section>
            <h2 className='text-l-medium mb-4'>Notifications</h2>
            <label htmlFor='notificationSonore' className='flex items-center'>
              <span className='mr-4'>
                Recevoir des notifications sonores pour la réception de nouveaux
                messages
              </span>
              <Switch
                id='notificationSonore'
                checkedLabel='Activé'
                uncheckedLabel='Désactivé'
                checked={conseiller.notificationsSonores}
                onChange={toggleNotificationsSonores}
              />
            </label>
          </section>
        </div>
      )}
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
  const { user } = sessionOrRedirect.session

  return {
    props: {
      structureConseiller: user.structure,
      pageTitle: 'Mon profil',
    },
  }
}

export default withTransaction(Profil.name, 'page')(Profil)
