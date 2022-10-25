import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import React, { ChangeEvent, useMemo } from 'react'

import QrcodeAppStore from '../assets/images/qrcode_app_store.svg'
import QrcodePlayStore from '../assets/images/qrcode_play_store.svg'

import { Switch } from 'components/ui/Form/Switch'
import { StructureConseiller } from 'interfaces/conseiller'
import { PageProps } from 'interfaces/pageProps'
import { ConseillerService } from 'services/conseiller.service'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { useDependance } from 'utils/injectionDependances'
import ExternalLink from 'components/ui/Navigation/ExternalLink'
import withDependance from 'utils/injectionDependances/withDependance'
import { ReferentielService } from 'services/referentiel.service'
import { Agence } from 'interfaces/referentiel'
import {
  FormContainer,
  RenseignementAgenceMissionLocaleForm,
} from 'components/RenseignementAgenceMissionLocaleForm'
import { IconName } from 'components/ui/IconComponent'

type ProfilProps = PageProps & {
  referentielAgences: Agence[]
}

function Profil({ referentielAgences }: ProfilProps) {
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

  //TODO-1127 garder ID en nullable?
  async function selectAgence(agence: {
    id?: string
    nom: string
  }): Promise<void> {
    await conseillerService.modifierAgence(agence)
    setConseiller({ ...conseiller!, agence: agence.nom })
    //TODO-1127 setTrackingLabel('Succès ajout agence')
  }

  useMatomo('Profil')

  return (
    <>
      {conseiller && (
        <>
          <section className='border border-solid rounded-medium w-full p-4 border-grey_100 mb-8'>
            <h2 className='text-m-bold mb-4'>Informations</h2>
            <h3 className='text-base-bold'>
              {conseiller.firstName} {conseiller.lastName}
            </h3>
            <dl className='mt-3'>
              {conseiller.email && (
                <>
                  <dt className='mt-2 inline text-base-regular'>
                    Votre e-mail :
                  </dt>
                  <dd className='ml-2 inline text-base-medium'>
                    {conseiller.email}
                  </dd>
                </>
              )}

              {conseiller.agence && (
                <>
                  <dt className='mt-2 inline before:block before:content-[""] text-base-regular'>
                    Votre {labelAgence} :
                  </dt>
                  <dd className='ml-2 inline text-base-medium'>
                    {conseiller.agence}
                  </dd>
                </>
              )}
            </dl>
            {!conseiller.agence &&
              conseiller.structure === StructureConseiller.MILO && (
                <RenseignementAgenceMissionLocaleForm
                  referentielAgences={referentielAgences}
                  onAgenceChoisie={selectAgence}
                  container={FormContainer.PAGE}
                />
              )}
            {conseiller.agence &&
              conseiller.structure === StructureConseiller.MILO && (
                <div className='mt-4'>
                  <p>
                    Vous avez besoin de modifier votre Mission Locale de
                    référence ?
                  </p>

                  <div className={'flex'}>
                    <p>Pour ce faire merci de</p>
                    <div
                      className={'ml-1 text-primary_darken hover:text-primary'}
                    >
                      <ExternalLink
                        href={'mailto:support@pass-emploi.beta.gouv.fr'}
                        label={'contacter le support'}
                        iconName={IconName.Email}
                        // TODO-1127 matomo ?
                        onClick={() => console.log('mail click')}
                      />
                    </div>
                  </div>
                </div>
              )}
          </section>
          <section className='border border-solid rounded-medium w-full p-4 border-grey_100 mb-8'>
            <h2 className='text-m-bold mb-4'>Notifications</h2>
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
          <section className='border border-solid rounded-medium w-full p-4 border-grey_100 mb-8'>
            <h2 className='text-m-bold mb-4'>
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

  const {
    session: { user, accessToken },
  } = sessionOrRedirect

  let referentielAgences: Agence[] = []

  if (user.structure === StructureConseiller.MILO) {
    const conseillerService =
      withDependance<ConseillerService>('conseillerService')
    const conseiller = await conseillerService.getConseillerServerSide(
      user,
      accessToken
    )
    if (!conseiller) {
      throw new Error(`Conseiller ${user.id} inexistant`)
    }

    if (!conseiller.agence) {
      const agenceService =
        withDependance<ReferentielService>('referentielService')
      referentielAgences = await agenceService.getAgences(
        user.structure,
        accessToken
      )
    }
  }

  return {
    props: {
      referentielAgences: referentielAgences,
      pageTitle: 'Mon profil',
      pageHeader: 'Profil',
    },
  }
}

export default withTransaction(Profil.name, 'page')(Profil)
