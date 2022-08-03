import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import React, { ChangeEvent, useMemo } from 'react'

import QrcodeAppStore from '../assets/images/qrcode_app_store.svg'
import QrcodePlayStore from '../assets/images/qrcode_play_store.svg'

import { Switch } from 'components/ui/Switch'
import { StructureConseiller } from 'interfaces/conseiller'
import { PageProps } from 'interfaces/pageProps'
import { ConseillerService } from 'services/conseiller.service'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { useDependance } from 'utils/injectionDependances'

interface ProfilProps extends PageProps {}

function Profil(_: ProfilProps) {
  const conseillerService =
    useDependance<ConseillerService>('conseillerService')

  const [conseiller, setConseiller] = useConseiller()

  const labelAgence = useMemo(() => {
    if (!conseiller) return ''
    return conseiller.structure === StructureConseiller.MILO
      ? 'Mission locale'
      : 'agence'
  }, [conseiller])

  async function toggleNotificationsSonores(e: ChangeEvent<HTMLInputElement>) {
    const conseillerMisAJour = {
      ...conseiller!,
      notificationsSonores: e.target.checked,
    }
    await conseillerService.modifierNotificationsSonores(
      conseiller!.id,
      conseillerMisAJour.notificationsSonores
    )
    setConseiller(conseillerMisAJour)
  }

  useMatomo('Profil')

  return (
    <>
      {conseiller && (
        <>
          <section className='mb-8'>
            <h2 className='text-l-bold mb-4'>Informations</h2>
            <div className='pl-4'>
              <h3 className='w-text-m-bold'>
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
          <section className='mb-8'>
            <h2 className='text-l-bold mb-4'>Notifications</h2>
            <label
              htmlFor='notificationSonore'
              className='flex items-center flex-wrap layout_m:flex-nowrap'
            >
              <span className='mr-4'>
                Recevoir des notifications sonores pour la réception de nouveaux
                messages
              </span>
              {/*FIXME Switch dans le label ?*/}
              <Switch
                id='notificationSonore'
                checkedLabel='Activé'
                uncheckedLabel='Désactivé'
                checked={conseiller.notificationsSonores}
                onChange={toggleNotificationsSonores}
              />
            </label>
          </section>
          <section className='mb-8'>
            <h2 className='text-l-bold mb-4'>
              Application CEJ jeune - mode démo
            </h2>
            <p className='mb-4'>
              Le mode démo vous permet de visualiser l’application CEJ utilisée
              par vos bénéficiaires.
            </p>
            <p className='mb-4'>
              Pour accéder au mode démo, vous devez télécharger l’application
              sur le store de votre choix, l’ouvrir puis
              <b> appuyer 3 fois sur le logo </b>“Contrat d’Engagement Jeune”
              visible sur la page de connexion.
            </p>
            <p>
              L’application est disponible sur Google Play Store et sur l’App
              Store.
            </p>
            <div className='flex justify-evenly mt-8'>
              <div className='flex flex-col items-center'>
                <QrcodeAppStore
                  focusable='false'
                  aria-label='QR code pour l’App Store'
                />
                <p className='text-s-bold'>App Store</p>
              </div>
              <div className='flex flex-col items-center'>
                <QrcodePlayStore
                  focusable='false'
                  aria-label='QR code pour Google Play'
                />
                <p className='text-s-bold'>Google Play</p>
              </div>
            </div>
          </section>
        </>
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

  return {
    props: {
      pageTitle: 'Mon profil',
      pageHeader: 'Profil',
    },
  }
}

export default withTransaction(Profil.name, 'page')(Profil)
